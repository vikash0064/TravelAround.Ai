import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../service/api'
import TripCard from '../components/ui/TripCard'
import { Link, useNavigate } from 'react-router-dom'

function MyTrips() {
    const { user } = useAuth()
    const [trips, setTrips] = useState([])
    const [bookings, setBookings] = useState([])
    const [creatorRequests, setCreatorRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tripsRes, bookingsRes, requestsRes] = await Promise.all([
                    api.get('/trips/user-trips'),
                    api.get('/bookings/user-bookings'),
                    api.get('/bookings/creator-requests')
                ]);
                setTrips(tripsRes.data);
                setBookings(bookingsRes.data);
                setCreatorRequests(requestsRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        }

        if (user) fetchData()
    }, [user])

    const handleRemoveBooking = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this join request?")) return;
        try {
            await api.delete(`/bookings/${id}`);
            // Remove from local state and re-sync
            setBookings(prev => prev.filter(b => b._id !== id));
            // Trigger a refresh of the entire data to ensure consistency (e.g. if the trip was cancelled)
            // But for now, just filtering is fine for speed.
        } catch (error) {
            console.error("Failed to remove booking", error);
            alert("Failed to cancel join request. Please try again.");
        }
    };

    const handleRemoveTrip = async (id) => {
        if (!window.confirm("Are you sure you want to delete this trip? This will also remove all group messages and join requests.")) return;
        try {
            await api.delete(`/trips/${id}`);
            // Remove from local state
            setTrips(prev => prev.filter(t => t._id !== id));
        } catch (error) {
            console.error("Failed to remove trip", error);
            alert("Failed to delete trip. You might not have permission or the trip may have already been deleted.");
        }
    };

    if (loading) return <div className='p-10 text-center'>Loading...</div>

    return (
        <div className='min-h-screen bg-gray-50/50 px-5 sm:px-10 md:px-24 lg:px-32 xl:px-48 py-12'>
            <div>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
                    <div className='flex items-center gap-4'>
                        <div className='w-2 h-10 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full'></div>
                        <h1 className='font-extrabold text-4xl text-gray-900'>My Created Trips</h1>
                    </div>

                    {(user?.role === 'organiser' || user?.role === 'admin') && (
                        <Link
                            to={user.role === 'admin' ? "/admin" : "/organiser"}
                            className='inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-100 text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-sm'
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            Go to {user.role === 'admin' ? 'Admin' : 'Organiser'} Panel
                        </Link>
                    )}
                </div>

                {trips.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {trips.map((trip, index) => (
                            <div key={index} className='relative group h-full'>
                                <Link to={`/view-trip/${trip._id}`} className='block h-full'>
                                    <div className='bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer h-full flex flex-col group/card'>
                                        <div className='relative h-56 overflow-hidden'>
                                            <img
                                                src={trip.tripData?.locationInfo?.photoUrl || trip.tripData?.hotels?.[0]?.imageUrl || '/placeholder.jpg'}
                                                alt={trip.destination}
                                                className='h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110'
                                                onError={(e) => {
                                                    if (e.target.src.includes(trip.tripData?.locationInfo?.photoUrl) && trip.tripData?.hotels?.[0]?.imageUrl) {
                                                        e.target.src = trip.tripData?.hotels?.[0]?.imageUrl;
                                                    } else {
                                                        e.target.src = '/placeholder.jpg';
                                                    }
                                                }}
                                            />
                                            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-6'>
                                                <p className='text-white text-sm font-medium'>View Full Itinerary</p>
                                            </div>
                                            <div className='absolute top-4 right-4'>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${trip.status === 'approved' ? 'bg-green-500 text-white' :
                                                    trip.status === 'rejected' ? 'bg-red-500 text-white' :
                                                        'bg-amber-500 text-white'
                                                    }`}>
                                                    {trip.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='p-6 flex-1 flex flex-col'>
                                            <h2 className='font-bold text-xl text-gray-900 mb-2 truncate group-hover/card:text-blue-600 transition-colors'>
                                                {trip.destination}
                                            </h2>
                                            <div className='flex items-center gap-2 text-gray-500 text-sm mb-4'>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {new Date(trip.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className='mt-auto flex flex-wrap gap-2'>
                                                <span className='px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold border border-blue-100'>
                                                    {trip.duration || 3} Days
                                                </span>
                                                <span className='px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-semibold border border-purple-100'>
                                                    {trip.budget || 'Budget'}
                                                </span>
                                                {trip.requestOrganiser && (
                                                    <span className='px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold border border-emerald-100 flex items-center gap-1'>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                        Lead
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleRemoveTrip(trip._id);
                                    }}
                                    className='absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 z-20 shadow-lg border border-transparent hover:border-red-600'
                                    title="Delete Trip"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center shadow-sm'>
                        <div className='w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h2 className='text-2xl font-bold text-gray-800 mb-3'>No Created Trips</h2>
                        <p className='text-gray-500 mb-8 max-w-sm mx-auto'>You haven't generated any trips yet. Start planning your perfect itinerary now!</p>
                        <Link
                            to="/create-trip"
                            className='inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all'
                        >
                            Create First Trip
                        </Link>
                    </div>
                )}
            </div>

            <div className='pt-8 border-t border-gray-100'>
                <div className='flex items-center gap-4 mb-8'>
                    <div className='w-2 h-10 bg-gradient-to-b from-emerald-600 to-green-600 rounded-full'></div>
                    <h1 className='font-extrabold text-4xl text-gray-900'>Joined Trips</h1>
                </div>

                {bookings.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {bookings.map((booking, index) => (
                            <div key={index} className='relative h-full group'>
                                <Link to={booking.tripId ? `/view-trip/${booking.tripId?._id || booking.tripId}` : '#'} className='block h-full'>
                                    <div className='bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col group/card relative'>
                                        <div className='absolute top-4 right-4 z-10'>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-lg
                                                ${booking.status === 'approved' ? 'bg-green-500' : booking.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className='relative h-48 overflow-hidden bg-gray-100'>
                                            <img
                                                src={booking.hotelImage || booking.tripId?.tripData?.locationInfo?.photoUrl || booking.tripId?.tripData?.hotels?.[0]?.imageUrl || '/placeholder.jpg'}
                                                alt={booking.hotelName || booking.destination}
                                                className='h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110'
                                                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                            />
                                        </div>

                                        <div className='p-6 flex-1 flex flex-col'>
                                            <h2 className='font-bold text-xl text-gray-900 mb-2 truncate group-hover/card:text-emerald-600 transition-colors'>
                                                {booking.tripId?.tripData?.hotels?.[0]?.hotelName || booking.destination || 'Unnamed Trip'}
                                            </h2>
                                            <p className='text-sm text-gray-500 mb-4 italic line-clamp-1'>
                                                {booking.destination}
                                            </p>

                                            <div className='mt-auto space-y-4'>
                                                {booking.status === 'approved' && (
                                                    <Link
                                                        to={`/chat?tripId=${booking.tripId?._id || booking.tripId}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className='w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-center rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100'
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                        Community Chat
                                                    </Link>
                                                )}

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleRemoveBooking(booking._id);
                                                    }}
                                                    className='w-full py-2 flex items-center justify-center gap-2 text-red-500 hover:text-red-700 text-xs font-semibold'
                                                >
                                                    Cancel Request
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center'>
                        <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm'>
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                        </div>
                        <h2 className='text-xl font-bold text-gray-600 mb-2'>No Joined Trips</h2>
                        <p className='text-gray-400 max-w-xs mx-auto mb-6'>Join other community trips to meet fellow travelers!</p>
                        <Link to="/explore" className='text-blue-600 font-bold hover:underline'>Explore Destinations →</Link>
                    </div>
                )}
            </div>

            {/* Incoming Requests for My Trips */}
            {creatorRequests.length > 0 && (
                <div className='pt-8 border-t border-gray-100'>
                    <div className='flex items-center gap-4 mb-8'>
                        <div className='w-2 h-10 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full'></div>
                        <h1 className='font-extrabold text-4xl text-gray-900'>Incoming Join Requests</h1>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {creatorRequests.map((request, index) => (
                            <div key={index} className='bg-white border border-blue-50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group/req'>
                                <div className='absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover/req:scale-110'></div>

                                <div className='relative z-10'>
                                    <div className='flex justify-between items-start mb-6'>
                                        <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-extrabold text-xl shadow-inner'>
                                            {request.userId?.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${request.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {request.status}
                                        </span>
                                    </div>

                                    <h3 className='font-bold text-gray-900 text-lg mb-1'>{request.userId?.username}</h3>
                                    <p className='text-xs text-gray-400 mb-4'>{request.userId?.email}</p>

                                    <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
                                        <p className='text-[10px] uppercase font-bold text-gray-400 mb-2'>Requesting to join</p>
                                        <p className='text-sm font-bold text-gray-800 line-clamp-1'>{request.tripId?.destination || 'This Trip'}</p>
                                        <p className='text-xs text-gray-500 mt-1 line-clamp-1'>{request.hotelName}</p>
                                    </div>

                                    <div className='mt-6 pt-4 border-t border-gray-50 flex items-center justify-between'>
                                        <span className='text-[10px] text-gray-400'>{new Date(request.createdAt).toLocaleDateString()}</span>
                                        <Link to="/organiser" className='text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1'>
                                            Process Panel
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyTrips

