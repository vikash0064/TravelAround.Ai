
import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, User } from 'lucide-react'
import NotificationDropdown from "../NotificationDropdown";
import api from '../../service/api'
import { io } from "socket.io-client";
import { useToast } from '../ui/toast';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, logout, refreshUser } = useAuth()
    const navigate = useNavigate();
    const { toast } = useToast();

    // Refresh user data on mount to sync roles
    useEffect(() => {
        if (user) {
            refreshUser();
        }
    }, []);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    // Fetch Notifications on load
    useEffect(() => {
        if (user) {
            fetchNotifications();

            // Connect Socket
            const socketUrl = import.meta.env.PROD ? window.location.origin : "http://localhost:5000";
            const newSocket = io(socketUrl, {
                withCredentials: true
            });
            setSocket(newSocket);

            newSocket.on(`notification_${user.id}`, (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                toast({
                    title: "New Notification",
                    description: newNotif.message,
                });
            });

            return () => newSocket.disconnect();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put(`/notifications/mark-all-read`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    return (
        <header className="w-full h-full sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group cursor-pointer">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-linear-to-r from-blue-400 to-purple-400 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="relative w-10 h-10 object-contain transform group-hover:scale-105 transition duration-300"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h1 className='font-bold text-lg tracking-tight bg-linear-to-r from-sky-600 to-fuchsia-600 bg-clip-text text-transparent'>
                                Travel Around
                            </h1>
                            <span className="text-[10px] text-gray-500 font-medium tracking-wider">
                                PLAN YOUR PERFECT TRIP
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        <Link to="/" className="px-3 py-1.5 text-sm text-gray-700 hover:text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 relative group">
                            Home
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-linear-to-r from-blue-400 to-purple-400 group-hover:w-4/5 transition-all duration-300"></span>
                        </Link>
                        <Link to="/about" className="px-3 py-1.5 text-sm text-gray-700 hover:text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 relative group">
                            About
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-linear-to-r from-blue-400 to-purple-400 group-hover:w-4/5 transition-all duration-300"></span>
                        </Link>
                        <Link to="/contact" className="px-3 py-1.5 text-sm text-gray-700 hover:text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 relative group">
                            Contact
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-linear-to-r from-blue-400 to-purple-400 group-hover:w-4/5 transition-all duration-300"></span>
                        </Link>
                    </nav>

                    {/* Right Side - Desktop */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link to="/explore">
                            <Button variant="ghost" size="sm" className="text-sm text-gray-700 h-8 px-3">Explore</Button>
                        </Link>
                        <Link to="/my-trips">
                            <Button variant="ghost" size="sm" className="text-sm text-gray-700 h-8 px-3">My Trips</Button>
                        </Link>
                        <Link to="/chat">
                            <Button variant="ghost" size="sm" className="text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 h-8 px-3">
                                Chat
                            </Button>
                        </Link>
                        <Link to="/create-trip">
                            <Button variant="outline" size="sm" className="text-sm text-gray-700 h-8 px-3">
                                + Create Trip
                            </Button>
                        </Link>
                        {user?.role === 'admin' && (
                            <Button asChild size="sm" className="text-sm bg-red-600 hover:bg-red-700 text-white h-8 px-3">
                                <Link to="/admin">Panel</Link>
                            </Button>
                        )}
                        {user?.role === 'organiser' && (
                            <Button asChild size="sm" className="text-sm bg-blue-600 hover:bg-blue-700 text-white h-8 px-3">
                                <Link to="/organiser">Panel</Link>
                            </Button>
                        )}

                        {/* Notification Bell */}
                        {user && (
                            <NotificationDropdown
                                notifications={notifications}
                                onMarkRead={handleMarkRead}
                                onMarkAllRead={handleMarkAllRead}
                            />
                        )}

                        {/* Auth Buttons */}
                        {user ? (
                            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                                <Link to="/profile" className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{user.username || user.email}</span>
                                        </div>
                                        {user.role === 'organiser' && (
                                            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                                                Organiser
                                            </span>
                                        )}
                                        {user.role === 'admin' && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        logout();
                                        navigate('/');
                                    }}
                                    className="text-sm h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="text-sm text-gray-700 h-8 px-3">
                                        Log In
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="text-sm bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-8 px-4">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
                            <span className={`w-6 h-0.5 bg-gray-700 transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                            <span className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`w-6 h-0.5 bg-gray-700 transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </div>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden animate-fadeIn">
                        <div className="py-4 px-2 space-y-1 border-t border-gray-100 mt-4">
                            {['Home', 'Destinations', 'Trips', 'About', 'Contact'].map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item}
                                </a>
                            ))}
                            <div className="pt-4 space-y-2">
                                <div className="pt-4 space-y-2">
                                    <Link to="/explore" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-center">Explore</Button>
                                    </Link>
                                    <Link to="/my-trips" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-center">My Trips</Button>
                                    </Link>
                                    <Link to="/chat" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-center text-blue-600">Community Chat</Button>
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Button asChild className="w-full justify-center bg-red-600 hover:bg-red-700 text-white">
                                            <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                                        </Button>
                                    )}
                                    {user?.role === 'organiser' && (
                                        <Button asChild className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white">
                                            <Link to="/organiser" onClick={() => setIsMenuOpen(false)}>Organiser Panel</Link>
                                        </Button>
                                    )}
                                    <Link to="/create-trip" onClick={() => setIsMenuOpen(false)}>
                                        <Button
                                            className="w-full justify-center bg-linear-to-r from-blue-500 to-purple-500 
                                                hover:from-blue-600 hover:to-purple-600 text-white"
                                        >
                                            Plan a Trip
                                        </Button>
                                    </Link>

                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Decorative Element */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-200 to-transparent"></div>
        </header>
    )
}

export default Header
