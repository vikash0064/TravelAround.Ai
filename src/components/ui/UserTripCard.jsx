import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/toast';
import api from '../../service/api';

const UserTripCard = ({ trip, isJoined, bookingStatus }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [joining, setJoining] = React.useState(false);

    const [imgSrc, setImgSrc] = React.useState(
        trip.tripData?.locationInfo?.photoUrl ||
        trip.tripData?.hotels?.[0]?.imageUrl ||
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'
    );

    const handleImageError = () => {
        setImgSrc('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800');
    };

    const handleJoinClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Please login to join trips");
            navigate('/login');
            return;
        }

        setJoining(true);
        try {
            await api.post('/bookings/join', {
                destination: trip.destination,
                tripId: trip._id,
                hotelName: trip.tripData?.hotels?.[0]?.hotelName || "Main Accommodation",
                hotelImage: imgSrc,
                price: trip.budget || "Varies"
            });
            toast.success("Join request sent to organiser!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to join trip");
        } finally {
            setJoining(false);
        }
    };

    return (
        <div
            onClick={() => navigate(`/view-trip/${trip._id}`)}
            className='border rounded-2xl p-4 hover:shadow-xl transition-all cursor-pointer h-full flex flex-col bg-white group border-gray-100 shadow-sm relative overflow-hidden'
        >
            <div className="relative h-[200px] w-full mb-4 overflow-hidden rounded-xl">
                <img
                    src={imgSrc}
                    alt={trip.destination}
                    className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
                    onError={handleImageError}
                />
                <div className="absolute top-2 right-2 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold shadow-sm uppercase tracking-wider text-gray-700">
                    {trip.duration || trip.tripData?.duration || 3} Days
                </div>

                {/* Status Badge */}
                {trip.status === 'approved' && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500/90 backdrop-blur-md rounded text-[8px] font-bold text-white uppercase tracking-widest">
                        Verified
                    </div>
                )}
            </div>

            <div className='flex justify-between items-start mb-2'>
                <h2 className='font-bold text-lg truncate flex-1 text-gray-800'>
                    {trip.tripData?.hotels?.[0]?.hotelName || trip.destination || 'Unnamed Trip'}
                </h2>
            </div>

            <p className='text-sm text-gray-500 flex items-center gap-1 mb-4'>
                <MapPin className='w-3 h-3 text-blue-500' /> {trip.destination}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 gap-3">
                <div className='flex flex-col'>
                    <span className='text-[10px] text-gray-400 font-bold uppercase tracking-tighter'>Budget</span>
                    <span className='font-bold text-blue-600 text-sm'>
                        {trip.budget || trip.tripData?.budget || 'Medium'}
                    </span>
                </div>

                {(trip.userId !== user?.id && trip.userId?._id !== user?.id) ? (
                    <button
                        onClick={handleJoinClick}
                        disabled={joining || isJoined}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-90 flex items-center justify-center gap-1 shadow-md
                            ${isJoined
                                ? 'bg-emerald-500 text-white shadow-emerald-100 cursor-default'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-100 hover:shadow-lg'}`}
                    >
                        {joining ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : isJoined ? (
                            <div className='flex items-center gap-1'>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                {bookingStatus === 'approved' ? 'Joined' : 'Requested'}
                            </div>
                        ) : (
                            'Join Trip'
                        )}
                    </button>
                ) : (
                    <div className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold text-center border border-blue-100 uppercase tracking-wider">
                        Your Trip
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserTripCard;
