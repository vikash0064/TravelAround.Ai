import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { Send, MessageCircle, LogOut, Lock, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { useSearchParams } from 'react-router-dom';
import api from '../service/api';

function Chat() {
    const { user } = useContext(AuthContext);
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [socket, setSocket] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const [approvedTrips, setApprovedTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tripId = searchParams.get('tripId');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messageList]);

    useEffect(() => {
        // Simple auth check
        if (!user) {
            navigate('/login');
            return;
        }

        if (!tripId) {
            // Need to fetch user's approved trips to let them select one
            setLoadingTrips(true);
            api.get('/bookings/user-bookings')
                .then(res => {
                    const approved = res.data.filter(b => b.status === 'approved' && b.tripId);
                    setApprovedTrips(approved);
                })
                .catch(err => console.error("Failed to fetch approved trips", err))
                .finally(() => setLoadingTrips(false));
            return;
        }

        // FETCH HISTORY
        api.get(`/messages/${tripId}`).then((response) => {
            const history = response.data.map(msg => ({
                tripId: msg.tripId,
                author: msg.username,
                message: msg.message,
                type: msg.type || 'text',
                imageUrl: msg.imageUrl || "",
                time: new Date(msg.createdAt).getHours() + ":" + new Date(msg.createdAt).getMinutes().toString().padStart(2, '0') // Format time
            }));
            setMessageList(history);
            setAccessDenied(false);
        }).catch(err => {
            console.error("Failed to fetch chat history", err);
            if (err.response?.status === 403) {
                setAccessDenied(true);
            }
        });

        // Initialize socket with session (cookie)
        const socketUrl = import.meta.env.PROD ? window.location.origin : "http://localhost:5000";
        console.log("DEBUG: Connecting to socket at:", socketUrl, "with tripId:", tripId);
        const newSocket = io(socketUrl, {
            withCredentials: true
        });

        newSocket.on("connect", () => {
            console.log("DEBUG: Socket Connected!", newSocket.id);
            // Join room automatically upon connection
            newSocket.emit("join_chat", { tripId });
        });

        newSocket.on("joined_room", (data) => {
            console.log("DEBUG: Confirmed joined room:", data.room);
        });

        newSocket.on("error", (err) => {
            console.error("DEBUG: Socket error:", err);
        });

        setSocket(newSocket);

        // Listen for connection errors
        newSocket.on("connect_error", (err) => {
            console.error("DEBUG: Socket Connection Error:", err.message);
        });

        return () => {
            console.log("DEBUG: Disconnecting socket");
            newSocket.disconnect();
        };

    }, [user, navigate, tripId]);

    // Receive Messages
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (data) => {
            console.log("DEBUG: Received message event:", data);
            setMessageList((list) => [...list, data]);
        };

        socket.on("receive_message", handleReceiveMessage);

        socket.on("error", (data) => {
            console.error("DEBUG: Received error from server:", data);
            alert(data.message || "Something went wrong sending the message.");
        });

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("error");
        };
    }, [socket]);


    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const sendMessage = async () => {
        console.log("DEBUG: sendMessage called. socket:", !!socket, "socket connected:", socket?.connected, "tripId:", tripId);

        if ((currentMessage.trim() !== "" || selectedImage) && socket && tripId) {
            if (!socket.connected) {
                console.error("DEBUG: Socket not connected. Attempting to reconnect...");
                socket.connect();
                return;
            }

            setUploading(true);
            const messageData = {
                tripId,
                author: user.username,
                message: currentMessage.trim(),
                type: selectedImage ? 'image' : 'text',
                imageUrl: selectedImage || "",
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes().toString().padStart(2, '0'),
            };

            console.log("DEBUG: Emitting send_message:", messageData);
            socket.emit("send_message", messageData);

            setCurrentMessage("");
            setSelectedImage(null);
            setUploading(false);
        } else {
            console.log("DEBUG: sendMessage condition not met:", {
                hasContent: currentMessage.trim() !== "" || !!selectedImage,
                hasSocket: !!socket,
                hasTripId: !!tripId
            });
        }
    };

    // Render logic
    if (!user) return null; // Redirecting

    if (!tripId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Your Conversations</h2>
                            <p className="text-gray-500">Select an approved trip to join the chat</p>
                        </div>
                    </div>

                    {loadingTrips ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                            <p className="text-gray-500">Loading your trips...</p>
                        </div>
                    ) : approvedTrips.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {approvedTrips.map((booking) => (
                                <button
                                    key={booking._id}
                                    onClick={() => navigate(`/chat?tripId=${booking.tripId._id}`)}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left group"
                                >
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                        <img
                                            src={booking.hotelImage || '/placeholder.jpg'}
                                            alt={booking.destination}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {booking.destination}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{booking.hotelName || 'Join the community'}</p>
                                    </div>
                                    <div className="px-4 py-2 bg-white rounded-lg text-blue-600 text-sm font-bold shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        Open Chat
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-700">No Approved Trips Yet</h4>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">
                                You need to join a trip and get approved by the admin before you can chat with others.
                            </p>
                            <button
                                onClick={() => navigate('/explore')}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Explore Trips
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    if (accessDenied) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
                    <p className="text-gray-500 mb-6">
                        You are not an approved member of this trip's group chat.
                        Please request to join the trip first.
                    </p>
                    <button
                        onClick={() => navigate(tripId ? `/view-trip/${tripId}` : '/')}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                        Return to Trip
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
                {/* Header */}
                <div className="bg-blue-600 p-4 px-6 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">
                                {tripId ? "Group Conversation" : "Travel Community"}
                            </h3>
                            <div className="flex items-center gap-1.5 opacity-80 text-xs">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Live as {user.username}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(tripId ? '/chat' : '/')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                        title={tripId ? "Back to Selection" : "Return Home"}
                    >
                        {tripId ? <X className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4 custom-scrollbar">
                    {messageList.map((messageContent, index) => {
                        const isMyMessage = user.username === messageContent.author;
                        return (
                            <div
                                key={index}
                                className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[70%] ${isMyMessage ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                    <div className={`flex items-end gap-2 ${isMyMessage ? "flex-row-reverse" : "flex-row"}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isMyMessage ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                                            }`}>
                                            {messageContent.author[0].toUpperCase()}
                                        </div>
                                        <div
                                            className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${isMyMessage
                                                ? (messageContent.type === 'image' ? "bg-blue-600 p-1" : "bg-blue-600 text-white rounded-tr-none")
                                                : (messageContent.type === 'image' ? "bg-white p-1" : "bg-white text-gray-800 rounded-tl-none border border-gray-100")
                                                }`}
                                        >
                                            {messageContent.type === 'image' ? (
                                                <img
                                                    src={messageContent.imageUrl}
                                                    alt="shared"
                                                    className="max-h-64 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => window.open(messageContent.imageUrl, '_blank')}
                                                />
                                            ) : (
                                                <p className="break-words">{messageContent.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`text-[10px] text-gray-400 px-1 ${isMyMessage ? "text-right" : "text-left"}`}>
                                        <span className="font-semibold">{messageContent.author}</span> • {messageContent.time}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Image Preview Area */}
                {selectedImage && (
                    <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 flex items-center justify-between animate-in slide-in-from-bottom duration-200">
                        <div className="flex items-center gap-3">
                            <img src={selectedImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm" />
                            <span className="text-sm font-medium text-blue-700">Photo selected</span>
                        </div>
                        <button onClick={() => setSelectedImage(null)} className="p-1.5 hover:bg-blue-100 text-blue-500 rounded-full transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <div className="flex gap-2 items-center">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        >
                            <ImageIcon className="w-6 h-6" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageSelect}
                        />
                        <input
                            type="text"
                            value={currentMessage}
                            placeholder={selectedImage ? "Add a caption..." : "Type your message..."}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                            onChange={(event) => setCurrentMessage(event.target.value)}
                            onKeyPress={(event) => event.key === 'Enter' && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={uploading}
                            className={`px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                        >
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Chat;
