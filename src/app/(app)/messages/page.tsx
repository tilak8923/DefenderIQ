'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, Send, UserPlus, X } from "lucide-react";
import { useUser } from '@/firebase';
import type { UserProfile, Conversation, Message } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const dummyOtherUser: UserProfile = {
    id: 'dummy-user-123',
    username: 'Jane Doe',
    email: 'jane.doe@example.com',
    photoURL: 'https://i.pravatar.cc/150?u=jane_doe'
};

const dummyConversation: Conversation = {
    id: 'convo-1',
    participants: ['current-user-placeholder', dummyOtherUser.id],
    participantDetails: [dummyOtherUser], // Current user will be added later
    lastMessage: 'Sounds good, talk to you then!',
    lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
};

const dummyMessages: Message[] = [
    { id: 'msg-1', senderId: dummyOtherUser.id, text: 'Hey, did you see the latest security bulletin?', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    { id: 'msg-2', senderId: 'current-user-placeholder', text: 'Not yet, was it critical?', timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString() },
    { id: 'msg-3', senderId: dummyOtherUser.id, text: 'Yeah, there is a new RCE vulnerability in the web framework we use. We should patch it ASAP.', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
    { id: 'msg-4', senderId: 'current-user-placeholder', text: 'Wow, okay. I will get on it right away. I am scheduling the maintenance window now.', timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString() },
    { id: 'msg-5', senderId: dummyOtherUser.id, text: 'Sounds good, talk to you then!', timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString() },
];

type SearchedUserState = UserProfile | 'not_found' | null;

export default function MessagesPage() {
    const { user: currentUser } = useUser();
    
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [userConversations, setUserConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    
    const [isSearching, setIsSearching] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState<SearchedUserState>(null);
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    // Initialize with dummy data when currentUser is available
    useEffect(() => {
        if (currentUser) {
            const currentUserProfile: UserProfile = {
                id: currentUser.uid,
                username: currentUser.displayName || 'Current User',
                email: currentUser.email || undefined,
                photoURL: currentUser.photoURL || undefined
            };
            
            const populatedConvo: Conversation = {
                ...dummyConversation,
                participants: [currentUser.uid, dummyOtherUser.id],
                participantDetails: [currentUserProfile, dummyOtherUser]
            };

            const populatedMessages = dummyMessages.map(m => ({
                ...m,
                senderId: m.senderId === 'current-user-placeholder' ? currentUser.uid : m.senderId
            }));

            setAllUsers([currentUserProfile, dummyOtherUser]);
            setUserConversations([populatedConvo]);
            setActiveConversation(populatedConvo);
            setMessages(populatedMessages);
        }
    }, [currentUser]);

    // Scroll to bottom effect
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSelectConversation = (conversation: Conversation) => {
        setActiveConversation(conversation);
        setIsSearching(false);
    };

    const handleSearchUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchEmail.trim()) return;

        setIsSearchLoading(true);
        setSearchedUser(null);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        if (searchEmail.toLowerCase() === dummyOtherUser.email) {
            setSearchedUser(dummyOtherUser);
        } else {
            setSearchedUser('not_found');
        }
        setIsSearchLoading(false);
    };
    
    const handleStartConversation = (otherUser: UserProfile) => {
        const existingConvo = userConversations.find(c => c.participants.length === 2 && c.participants.includes(otherUser.id));
        if (existingConvo) {
            setActiveConversation(existingConvo);
        } else {
             // This part is for demo only, in a real app you'd create a new conversation document
             alert("Starting a new conversation is disabled in this demo.");
        }
        setIsSearching(false);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !currentUser) return;

        const newMsg: Message = {
            id: uuidv4(),
            senderId: currentUser.uid,
            text: newMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(currentMessages => [...currentMessages, newMsg]);
        
        // Also update the last message on the conversation list for UI feedback
        setUserConversations(convos => convos.map(c => 
            c.id === activeConversation.id ? { ...c, lastMessage: newMessage } : c
        ));

        setNewMessage('');
    };

    const getOtherParticipant = (convo: Conversation) => {
        return convo.participantDetails?.find(p => p.id !== currentUser?.uid);
    }

    const getMessageSender = (senderId: string) => {
        return allUsers?.find(u => u.id === senderId);
    }
    
    const toggleSearch = () => {
        setIsSearching(!isSearching);
        setSearchedUser(null);
        setSearchEmail('');
    }

    return (
        <div className="flex h-[calc(100vh-8rem)]">
            {/* Sidebar */}
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-wider">Messages</h1>
                    <Button variant="ghost" size="icon" onClick={toggleSearch}>
                        {isSearching ? <X className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    {isSearching ? (
                        <div className="p-4 space-y-4">
                           <form onSubmit={handleSearchUser} className="flex items-center gap-2">
                                <Input 
                                    placeholder="Enter user email..." 
                                    type="email"
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                />
                                <Button type="submit" size="icon" disabled={isSearchLoading}>
                                    <Search className="h-4 w-4" />
                                </Button>
                           </form>
                           {isSearchLoading && <p className="text-sm text-muted-foreground text-center">Searching...</p>}
                           
                           {searchedUser && typeof searchedUser === 'object' && (
                                <div className="p-4 bg-muted rounded-lg space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={searchedUser.photoURL} />
                                            <AvatarFallback>{getInitials(searchedUser.username || searchedUser.email)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{searchedUser.username || 'Unknown User'}</p>
                                            <p className="text-sm text-muted-foreground">{searchedUser.email}</p>
                                        </div>
                                    </div>
                                    <Button className="w-full" onClick={() => handleStartConversation(searchedUser)}>Start Conversation</Button>
                                </div>
                           )}

                           {searchedUser === 'not_found' && (
                                <div className="p-4 bg-muted rounded-lg text-center space-y-3">
                                    <p className="text-sm">No user found with the email <span className="font-semibold">{searchEmail}</span>.</p>
                                    <Button className="w-full" variant="outline" disabled>Invite to TSIEM</Button>
                                    <p className="text-xs text-muted-foreground">(Invite feature coming soon)</p>
                                </div>
                           )}

                        </div>
                    ) : (
                        <div>
                            {userConversations.map((convo) => {
                                const otherUser = getOtherParticipant(convo);
                                if (!otherUser) return null;
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
                        <p>Select a conversation or start a new one by searching for a user.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
