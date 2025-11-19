'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, Send, UserPlus } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, doc, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import type { UserProfile, Conversation, Message } from '@/lib/types';

// Helper to get initials from a name
const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function MessagesPage() {
    const { user: currentUser } = useUser();
    const firestore = useFirestore();

    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [showUserList, setShowUserList] = useState(false);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    // --- Data Fetching ---
    // Fetch all users
    const usersQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'users')) : null,
    [firestore]);
    const { data: allUsers } = useCollection<UserProfile>(usersQuery);

    // Fetch conversations the current user is part of
    const conversationsQuery = useMemoFirebase(() =>
        currentUser ? query(collection(firestore, 'conversations'), where('participants', 'array-contains', currentUser.uid)) : null,
    [currentUser, firestore]);
    const { data: userConversations } = useCollection<Omit<Conversation, 'id' | 'participantDetails'>>(conversationsQuery);

    // Fetch messages for the active conversation
    const messagesQuery = useMemoFirebase(() =>
        activeConversation ? query(collection(firestore, 'conversations', activeConversation.id, 'messages'), orderBy('timestamp', 'asc')) : null,
    [activeConversation]);
    const { data: messages } = useCollection<Message>(messagesQuery);
    
    // --- Memos & Effects ---
    // Combine conversation data with participant details
    const conversationsWithDetails = useMemo<Conversation[]>(() => {
        if (!userConversations || !allUsers) return [];
        return userConversations.map(convo => {
            const participantDetails = (convo.participants || [])
                .map(pId => allUsers.find(u => u.id === pId))
                .filter((p): p is UserProfile => !!p);
            return { ...convo, participantDetails };
        });
    }, [userConversations, allUsers]);

    // Scroll to the bottom of the messages when new messages arrive
     useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    // --- Handlers ---
    const handleSelectConversation = (conversation: Conversation) => {
        setActiveConversation(conversation);
        setShowUserList(false);
    };
    
    const handleStartConversation = async (otherUser: UserProfile) => {
        if (!currentUser || !firestore) return;
        
        // Check if a conversation already exists
        const existingConvo = conversationsWithDetails.find(c => c.participants.length === 2 && c.participants.includes(otherUser.id));
        if (existingConvo) {
            setActiveConversation(existingConvo);
            setShowUserList(false);
            return;
        }

        // Create a new conversation
        const newConversationRef = await addDoc(collection(firestore, 'conversations'), {
            participants: [currentUser.uid, otherUser.id],
            lastMessage: `Started conversation with ${otherUser.username || otherUser.email}`,
            lastMessageTimestamp: serverTimestamp(),
        });
        
        const newConvoDoc = await getDoc(newConversationRef);
        const newConvoData = { id: newConvoDoc.id, ...newConvoDoc.data() } as Conversation;

        setActiveConversation(newConvoData);
        setShowUserList(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !currentUser || !firestore) return;

        const messagesCol = collection(firestore, 'conversations', activeConversation.id, 'messages');
        await addDoc(messagesCol, {
            senderId: currentUser.uid,
            text: newMessage,
            timestamp: serverTimestamp(),
        });

        // Update the last message on the conversation
        const convoRef = doc(firestore, 'conversations', activeConversation.id);
        await updateDoc(convoRef, {
            lastMessage: newMessage,
            lastMessageTimestamp: serverTimestamp(),
        });
        
        setNewMessage('');
    };

    const getOtherParticipant = (convo: Conversation) => {
        return convo.participantDetails?.find(p => p.id !== currentUser?.uid);
    }

    const getMessageSender = (senderId: string) => {
        return allUsers?.find(u => u.id === senderId);
    }

    return (
        <div className="flex h-[calc(100vh-8rem)]">
            {/* Sidebar */}
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-wider">Messages</h1>
                    <Button variant="ghost" size="icon" onClick={() => setShowUserList(!showUserList)}>
                        <UserPlus className="h-5 w-5"/>
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    {showUserList ? (
                        // User List for starting new chats
                        <div>
                             {allUsers?.filter(u => u.id !== currentUser?.uid).map(user => (
                                <div key={user.id} onClick={() => handleStartConversation(user)} className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50">
                                    <Avatar>
                                        <AvatarImage src={user.photoURL} />
                                        <AvatarFallback>{getInitials(user.username || user.email)}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-semibold truncate">{user.username || user.email}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Conversation List
                        <div>
                            {conversationsWithDetails.map((convo) => {
                                const otherUser = getOtherParticipant(convo);
                                return (
                                    <div key={convo.id} onClick={() => handleSelectConversation(convo)} className={cn("flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50", activeConversation?.id === convo.id && 'bg-muted')}>
                                        <Avatar>
                                            <AvatarImage src={otherUser?.photoURL} />
                                            <AvatarFallback>{getInitials(otherUser?.username || otherUser?.email)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-semibold truncate">{otherUser?.username || otherUser?.email}</p>
                                            <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Main Chat Panel */}
            <div className="w-2/3 flex flex-col">
                {activeConversation ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={getOtherParticipant(activeConversation)?.photoURL} />
                                <AvatarFallback>{getInitials(getOtherParticipant(activeConversation)?.username)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{getOtherParticipant(activeConversation)?.username || getOtherParticipant(activeConversation)?.email}</p>
                                <p className="text-sm text-muted-foreground">Online</p>
                            </div>
                        </div>
                        <ScrollArea className="flex-1 p-6 space-y-4">
                            {messages?.map((msg) => {
                                const sender = getMessageSender(msg.senderId);
                                return (
                                    <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === currentUser?.uid && 'justify-end')}>
                                        {msg.senderId !== currentUser?.uid && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={sender?.photoURL} />
                                                <AvatarFallback>{getInitials(sender?.username)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn("max-w-md p-3 rounded-lg", msg.senderId === currentUser?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={endOfMessagesRef} />
                        </ScrollArea>
                        <div className="p-4 border-t">
                            <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
                                <Input placeholder="Type a message..." className="flex-1" value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                                <Button type="submit" size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 items-center justify-center text-muted-foreground">
                        <p>Select a conversation or start a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
