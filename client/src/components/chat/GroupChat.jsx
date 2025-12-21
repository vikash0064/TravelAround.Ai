import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Image as ImageIcon, Smile, X, Paperclip, Loader2 } from 'lucide-react';
import api from '../../service/api';
import { useAuth } from '../../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';

const GroupChat = ({ destination, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [buddies, setBuddies] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const messagesEndRef = useRef(null);
    const intervalRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const { data } = await api.get(`/chat/${encodeURIComponent(destination)}`);
            setMessages(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load chat", error);
        }
    };

    const fetchBuddies = async () => {
        try {
            const { data } = await api.get(`/chat/${encodeURIComponent(destination)}/buddies`);
            setBuddies(data);
        } catch (error) {
            console.error("Failed to load buddies", error);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchBuddies();
        intervalRef.current = setInterval(fetchMessages, 3000);
        return () => clearInterval(intervalRef.current);
    }, [destination]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result); // Base64 string
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedImage) return;

        setUploading(true);
        try {
            await api.post(`/chat/${encodeURIComponent(destination)}`, {
                message: newMessage,
                senderName: user.username,
                type: selectedImage ? 'image' : 'text',
                imageUrl: selectedImage
            });
            setNewMessage('');
            setSelectedImage(null);
            setShowPicker(false);
            fetchMessages();
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setUploading(false);
        }
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex overflow-hidden animate-in fade-in zoom-in duration-300 ring-1 ring-white/20">

                {/* Sidebar - Buddies List (Desktop) */}
                <div className="hidden md:flex flex-col w-72 bg-gray-50 border-r border-gray-100">
                    <div className="p-6 border-b border-gray-200 bg-white">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                            <User className="w-5 h-5 text-blue-500" /> Trip Buddies
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{buddies.length} Members</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {buddies.map((buddy, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                                    {buddy.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{buddy.username}</p>
                                    <p className="text-xs text-gray-500 truncate">{buddy.email}</p>
                                </div>
                                {user.username === buddy.username && (
                                    <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">You</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-50 relative">
                    {/* Header */}
                    <div className="bg-white p-4 px-6 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                {destination}
                                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Group</span>
                            </h3>
                            <p className="text-xs text-green-500 font-medium flex items-center gap-1 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                        {loading ? (
                            <div className="flex justify-center mt-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                        ) : messages.length === 0 ? (
                            <div className="text-center mt-20">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">👋</div>
                                <h4 className="font-bold text-gray-700 text-lg">No messages yet</h4>
                                <p className="text-gray-500">Break the ice and say hello!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === user.id;
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                        <div className={`flex flex-col max-w-[80%] md:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isMe && (
                                                <span className="text-xs text-gray-500 ml-1 mb-1 font-medium">{msg.senderName}</span>
                                            )}

                                            <div className={`p-4 shadow-sm relative ${isMe
                                                    ? (msg.type === 'image' ? 'bg-blue-500 p-2 rounded-2xl' : 'bg-blue-500 text-white rounded-2xl rounded-tr-sm')
                                                    : (msg.type === 'image' ? 'bg-white p-2 rounded-2xl' : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm')
                                                }`}>
                                                {msg.type === 'image' ? (
                                                    <img src={msg.imageUrl} alt="Shared" className="rounded-lg max-h-60 object-cover cursor-pointer hover:scale-[1.02] transition-transform" />
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                                )}

                                                <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-blue-100/80' : 'text-gray-400'
                                                    }`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Image Preview */}
                    {selectedImage && (
                        <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={selectedImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                                <span className="text-sm text-gray-600">Image selected</span>
                            </div>
                            <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-gray-200 rounded-full">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="flex gap-3 items-end max-w-4xl mx-auto">

                            {/* Tools */}
                            <div className="flex gap-1 pb-2">
                                <button type="button" onClick={() => setShowPicker(!showPicker)} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors relative">
                                    <Smile className="w-6 h-6" />
                                    {showPicker && (
                                        <div className="absolute bottom-12 left-0 z-50 shadow-2xl rounded-xl">
                                            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                                        </div>
                                    )}
                                </button>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                                    <ImageIcon className="w-6 h-6" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
                            </div>

                            {/* Text Input */}
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
                                    className="w-full bg-transparent outline-hidden text-gray-700 placeholder-gray-400 min-h-[24px] max-h-32"
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={(!newMessage.trim() && !selectedImage) || uploading}
                                className={`p-3 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 ${(!newMessage.trim() && !selectedImage)
                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        : 'bg-linear-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-200'
                                    }`}
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupChat;
