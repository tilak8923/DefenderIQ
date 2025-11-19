'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, Send } from "lucide-react";

const conversations = [
    { name: 'Alice', message: 'Sounds good, I will review the PR.', unread: 2, avatar: '/avatars/01.png' },
    { name: 'CyberSec Channel', message: 'Alert: High severity vulnerability detected.', unread: 0, avatar: '/avatars/02.png' },
    { name: 'Bob', message: 'Can you check the firewall logs?', unread: 0, avatar: '/avatars/03.png' },
    { name: 'System Alerts', message: 'Database performance degraded.', unread: 1, avatar: '/avatars/04.png' },
];

const messages = [
    { from: 'them', text: 'Hey, did you see the alert about the SQL injection attempt?' },
    { from: 'me', text: 'Yeah, I just saw it. Looks like the WAF blocked it.' },
    { from: 'them', text: 'Phew, that was close. I am escalating to the security team for a full review.' },
    { from: 'me', text: 'Good call. I will pull the relevant logs for them now.' },
];

export default function MessagesPage() {
    return (
        <div className="flex h-[calc(100vh-8rem)]">
            <div className="w-1/4 border-r flex flex-col">
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold tracking-wider">Messages</h1>
                    <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search" className="pl-8" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {conversations.map((convo, index) => (
                        <div key={index} className={cn(
                            "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50",
                             index === 0 && 'bg-muted'
                        )}>
                            <Avatar>
                                <AvatarImage src={convo.avatar} />
                                <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold truncate">{convo.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{convo.message}</p>
                            </div>
                            {convo.unread > 0 && (
                                <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {convo.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </ScrollArea>
            </div>
            <div className="w-3/4 flex flex-col">
                <div className="p-4 border-b flex items-center gap-3">
                     <Avatar>
                        <AvatarImage src="/avatars/01.png" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">Alice</p>
                        <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                </div>
                <ScrollArea className="flex-1 p-6 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={cn(
                            "flex items-end gap-2",
                            msg.from === 'me' && 'justify-end'
                        )}>
                             {msg.from === 'them' && <Avatar className="h-8 w-8"><AvatarFallback>A</AvatarFallback></Avatar>}
                            <div className={cn(
                                "max-w-md p-3 rounded-lg",
                                msg.from === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            )}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
                <div className="p-4 border-t">
                    <form className="flex items-center gap-2">
                        <Input placeholder="Type a message..." className="flex-1" />
                        <Button type="submit" size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
