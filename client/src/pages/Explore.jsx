import React, { useEffect, useState } from 'react';
import api from '../service/api';
import UserTripCard from '../components/ui/UserTripCard';
import TripFilters from '../components/custom/TripFilters';
import { Loader2, Globe } from 'lucide-react';

const Explore = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        query: '',
        budget: '',
        minDays: '',
        maxDays: ''
    });
    const [userBookings, setUserBookings] = useState([]);

    useEffect(() => {
        const fetchTrips = async () => {
            setLoading(true);
            try {
                // Construct query params
                const params = new URLSearchParams();
                if (filters.query) params.append('query', filters.query);
                if (filters.budget) params.append('budget', filters.budget);
                if (filters.minDays) params.append('minDays', filters.minDays);
                if (filters.maxDays) params.append('maxDays', filters.maxDays);

                const res = await api.get(`/trips?${params.toString()}`);
                setTrips(res.data);

                // Fetch user bookings if logged in
                if (localStorage.getItem('token')) {
                    const bookingsRes = await api.get('/bookings/user-bookings');
                    setUserBookings(bookingsRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch trips", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchTrips();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [filters]);

    return (
        <div className="px-5 sm:px-10 md:px-24 lg:px-48 xl:px-64 py-10 bg-gray-50 min-h-screen">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Explore Community Trips
                </h1>
                <p className="text-gray-600 text-lg">
                    Discover itineraries created by other travelers
                </p>
            </div>

            <div className="mb-8">
                <TripFilters filters={filters} setFilters={setFilters} />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            ) : trips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {trips.map((trip) => {
                        const booking = userBookings.find(b => b.tripId?._id === trip._id || b.tripId === trip._id);
                        return (
                            <UserTripCard
                                key={trip._id}
                                trip={trip}
                                isJoined={!!booking}
                                bookingStatus={booking?.status}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800">No trips found</h3>
                    <p className="text-gray-500">Try adjusting your filters to find more adventures.</p>
                </div>
            )}
        </div>
    );
};

export default Explore;
