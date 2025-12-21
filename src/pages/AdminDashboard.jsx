import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Loader2, CheckCircle, XCircle, Map, Users, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, navigate, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const res = await api.get('/users');
                setUsers(res.data);
            } else if (activeTab === 'bookings') {
                const res = await api.get('/bookings/admin/all');
                setBookings(res.data);
            } else {
                const res = await api.get('/trips/admin/all');
                setTrips(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = async (id, action) => {
        try {
            await api.patch(`/users/${id}/${action}`);
            fetchData();
        } catch (err) {
            console.error(`User ${action} failed`, err);
        }
    };

    const handleUserDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone and will remove all their data.")) return;
        try {
            await api.delete(`/users/${id}`);
            // Instantly update UI for better UX
            setUsers(prev => prev.filter(u => u._id !== id));
            // Also fetch again in background to ensure everything is synced
            fetchData();
        } catch (err) {
            console.error("User deletion failed", err);
            alert("Failed to delete user: " + (err.response?.data?.message || err.message));
            fetchData(); // Refresh list on error to ensure correct state
        }
    };

    const handleTripStatus = async (id, status) => {
        try {
            await api.patch(`/trips/${id}/status`, { status });
            fetchData();
        } catch (err) {
            console.error("Trip status update failed", err);
        }
    };

    const handleOrganiserStatus = async (id, status) => {
        try {
            await api.patch(`/trips/${id}/organiser-status`, { status });
            fetchData();
        } catch (err) {
            console.error("Organiser status update failed", err);
        }
    };

    const handleBookingValidate = async (id, status) => {
        try {
            await api.put(`/bookings/admin/validate/${id}`, { status });
            fetchData();
        } catch (err) {
            console.error("Booking validation failed", err);
        }
    };

    const handleTripDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this trip request? All members will lose access.")) return;
        try {
            await api.delete(`/trips/${id}`);
            setTrips(prev => prev.filter(t => t._id !== id));
            fetchData();
        } catch (err) {
            console.error("Trip deletion failed", err);
            alert("Failed to delete trip: " + (err.response?.data?.message || err.message));
            fetchData();
        }
    };

    const handleBookingDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this join request?")) return;
        try {
            await api.delete(`/bookings/admin/${id}`);
            setBookings(prev => prev.filter(b => b._id !== id));
            fetchData();
        } catch (err) {
            console.error("Booking deletion failed", err);
            alert("Failed to delete request: " + (err.response?.data?.message || err.message));
            fetchData();
        }
    };

    if (loading && users.length === 0 && trips.length === 0 && bookings.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-5 sm:p-10 md:px-20 min-h-screen bg-gray-50">
            <h1 className="font-bold text-3xl mb-8 text-gray-800">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'users'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                    <Users className="w-5 h-5" /> Users
                </button>
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'bookings'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                        : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                    <CheckCircle className="w-5 h-5" /> Join Requests
                </button>
                <button
                    onClick={() => setActiveTab('trips')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'trips'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                        : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                    <Map className="w-5 h-5" /> Trip Requests
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                {activeTab === 'users' ? (
                                    <>
                                        <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                                        <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    </>
                                ) : activeTab === 'bookings' ? (
                                    <>
                                        <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Destination</th>
                                        <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Destination</th>
                                        <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Creator</th>
                                        <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Organiser Req</th>
                                        <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    </>
                                )}
                                <th className="px-5 py-4 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'users' ? users.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm font-medium text-gray-900">{u.username}</td>
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm text-gray-600">{u.email}</td>
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-600' : u.role === 'organiser' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {u.isVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                                        <div className="flex items-center gap-2">
                                            {!u.isVerified ? (
                                                <button onClick={() => handleUserAction(u._id, 'verify')} className="text-green-600 hover:text-green-800 flex items-center gap-1 font-semibold">
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                            ) : (
                                                <button onClick={() => handleUserAction(u._id, 'revoke')} className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1 font-semibold">
                                                    <XCircle className="w-4 h-4" /> Revoke
                                                </button>
                                            )}
                                            <button onClick={() => handleUserDelete(u._id)} className="text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold ml-2">
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : activeTab === 'bookings' ? bookings.map((b) => (
                                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            {b.hotelImage && (
                                                <img src={b.hotelImage} alt={b.hotelName} className="w-10 h-10 rounded-lg object-cover" />
                                            )}
                                            <div>
                                                <div>{b.hotelName || b.destination}</div>
                                                {b.hotelName && <div className="text-xs text-gray-500">{b.destination}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm text-gray-600">
                                        <div>{b.userId?.username || 'Unknown'}</div>
                                        <div className="text-xs text-gray-400">{b.userId?.email}</div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            b.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {b.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                                        <div className="flex gap-3">
                                            <button onClick={() => handleBookingValidate(b._id, 'approved')} className="text-green-600 hover:text-green-800 flex items-center gap-1 font-semibold">
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                            <button onClick={() => handleBookingValidate(b._id, 'rejected')} className="text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold">
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                            <button onClick={() => handleBookingDelete(b._id)} className="text-gray-400 hover:text-red-600 flex items-center gap-1 font-semibold ml-2">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : trips.map((t) => (
                                <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm font-medium text-gray-900">{t.destination}</td>
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm text-gray-600">{t.userId?.username || 'Unknown'}</td>
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                                        {t.requestOrganiser ? (
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit ${t.organiserStatus === 'approved' ? 'bg-blue-100 text-blue-700' :
                                                    t.organiserStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {t.organiserStatus}
                                                </span>
                                                {t.organiserStatus === 'pending' && (
                                                    <div className="flex gap-2 mt-1">
                                                        <button onClick={() => handleOrganiserStatus(t._id, 'approved')} className="text-[10px] font-bold text-blue-600 hover:underline">Verify</button>
                                                        <button onClick={() => handleOrganiserStatus(t._id, 'rejected')} className="text-[10px] font-bold text-red-600 hover:underline">Deny</button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">No</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {t.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                                        <div className="flex gap-3">
                                            {t.status !== 'approved' && (
                                                <button onClick={() => handleTripStatus(t._id, 'approved')} className="text-green-600 hover:text-green-800 flex items-center gap-1 font-semibold">
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                            )}
                                            {t.status !== 'rejected' && (
                                                <button onClick={() => handleTripStatus(t._id, 'rejected')} className="text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold">
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            )}
                                            <button onClick={() => handleTripDelete(t._id)} className="text-gray-400 hover:text-red-600 flex items-center gap-1 font-semibold ml-2">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
