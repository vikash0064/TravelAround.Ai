import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Map, MessageSquare,
    CheckCircle, XCircle, Clock, ChevronRight,
    Search, Filter, ExternalLink, Shield
} from 'lucide-react';
import api from '../service/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';

const OrganiserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [trips, setTrips] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!user || (user.role !== 'organiser' && user.role !== 'admin')) {
            navigate('/');
            return;
        }
        fetchOrganiserData();
    }, [user, navigate]);

    const fetchOrganiserData = async () => {
        setLoading(true);
        try {
            const [tripsRes, requestsRes] = await Promise.all([
                api.get('/organiser/my-managed-trips'),
                api.get('/organiser/join-requests')
            ]);
            setTrips(tripsRes.data);
            setRequests(requestsRes.data);
        } catch (err) {
            console.error("Failed to fetch organiser data", err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAction = async (requestId, status) => {
        try {
            await api.put(`/organiser/requests/${requestId}/validate`, { status });
            toast.success(`Request ${status} successfully`);
            fetchOrganiserData(); // Refresh
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update request");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium tracking-wide">Loading Organiser Panel...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight">Organiser</h2>
                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Dashboard</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'trips', label: 'My Trips', icon: Map },
                        { id: 'requests', label: 'Join Requests', icon: Users },
                        { id: 'chat', label: 'Community', icon: MessageSquare },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-blue-50 text-blue-600 shadow-sm font-semibold'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-4 text-white">
                        <p className="text-xs opacity-80 mb-1">Total Trips</p>
                        <p className="text-2xl font-bold mb-3">{trips.length}</p>
                        <button
                            onClick={() => navigate('/create-trip')}
                            className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                        >
                            + New Trip
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back, {user?.username}</h1>
                        <p className="text-gray-500 mt-1">Manage your trips and approved travelers here.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
                            />
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                        <Map className="w-6 h-6" />
                                    </div>
                                    <span className="text-green-500 text-xs font-bold">+2 New</span>
                                </div>
                                <h3 className="text-gray-500 text-sm font-medium">Active Trips</h3>
                                <p className="text-3xl font-bold text-gray-900">{trips.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="text-yellow-500 text-xs font-bold">{requests.filter(r => r.status === 'pending').length} Pending</span>
                                </div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Travelers</h3>
                                <p className="text-3xl font-bold text-gray-900">{requests.filter(r => r.status === 'approved').length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-green-50 rounded-xl text-green-600">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <span className="text-green-500 text-xs font-bold">Live</span>
                                </div>
                                <h3 className="text-gray-500 text-sm font-medium">Active Chats</h3>
                                <p className="text-3xl font-bold text-gray-900">{trips.length}</p>
                            </div>
                        </div>

                        {/* Recent Requests Summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Recent Join Requests</h3>
                                <button onClick={() => setActiveTab('requests')} className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
                                    View All <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {requests.slice(0, 5).map((req, idx) => (
                                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                                {req.userId?.username?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{req.userId?.username}</h4>
                                                <p className="text-xs text-gray-500">Wants to join: <span className="text-blue-600 font-medium">{req.tripId?.destination}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {req.status === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleRequestAction(req._id, 'approved')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRequestAction(req._id, 'rejected')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {requests.length === 0 && (
                                    <div className="p-20 text-center">
                                        <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-400">No join requests yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'trips' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {trips.map((trip) => (
                            <div key={trip._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                <div className="h-40 bg-gray-200 relative group">
                                    <img
                                        src={trip.tripData?.hotels?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'}
                                        alt={trip.destination}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold shadow-sm">
                                            {trip.duration} Days
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500 text-white shadow-lg`}>
                                            Managed
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{trip.destination}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Filter className="w-3 h-3" /> {trip.budget} Budget
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/view-trip/${trip._id}`)}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {requests.filter(r => r.tripId?._id === trip._id && r.status === 'approved').slice(0, 3).map((r, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                    {r.userId?.username?.[0]?.toUpperCase()}
                                                </div>
                                            ))}
                                            {requests.filter(r => r.tripId?._id === trip._id && r.status === 'approved').length > 3 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                    +{requests.filter(r => r.tripId?._id === trip._id && r.status === 'approved').length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Approved</p>
                                                <p className="text-sm font-bold text-gray-900">{requests.filter(r => r.tripId?._id === trip._id && r.status === 'approved').length} Members</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Incoming Requests</h3>
                                <p className="text-sm text-gray-500 mt-1">Review and approve travelers for your shared trips.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-semibold border border-gray-100">All</button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold border border-blue-100">Pending</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trip Destination</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {requests.map((req) => (
                                        <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {req.userId?.username?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{req.userId?.username}</div>
                                                        <div className="text-xs text-gray-500">{req.userId?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-medium text-gray-700">{req.tripId?.destination}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {req.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleRequestAction(req._id, 'approved')}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-100"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestAction(req._id, 'rejected')}
                                                            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs font-medium italic">Handled</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrganiserDashboard;
