import React from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';

const NotificationDropdown = ({ notifications, onMarkRead, onMarkAllRead }) => {
    const navigate = useNavigate();
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleItemClick = async (notif) => {
        if (!notif.isRead) {
            onMarkRead(notif._id);
        }
        if (notif.link) {
            navigate(notif.link);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
                <div className="flex items-center justify-between px-4 py-2">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="xs"
                            className="text-xs text-blue-600 h-6 px-2"
                            onClick={onMarkAllRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-xs">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => handleItemClick(notif)}
                                className={`
                                    flex items-start gap-3 p-3 text-sm cursor-pointer transition-colors border-b border-gray-50 last:border-0
                                    ${notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'}
                                `}
                            >
                                <div className={`
                                    mt-1 h-2 w-2 rounded-full flex-shrink-0
                                    ${notif.isRead ? 'bg-gray-300' : 'bg-blue-500'}
                                `} />
                                <div className="flex-1 space-y-1">
                                    <p className={`leading-snug ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                        {notif.message}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;
