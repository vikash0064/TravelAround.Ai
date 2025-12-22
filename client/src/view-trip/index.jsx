import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, Clock, Calendar, Navigation, Globe, Share2, Users, Shield, CheckCircle, MessageCircle } from "lucide-react";
import TripCard from "../components/ui/TripCard";
import ItinerarySection from '../components/ItinerarySection';
import api from "../service/api";
import { useToast } from '../components/ui/toast';
import { useAuth } from '../context/AuthContext';



export default function ViewTrip() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // New Features State
  const { user } = useAuth();
  const [bookingStatus, setBookingStatus] = useState('none'); // none, pending, approved, rejected
  const [showChat, setShowChat] = useState(false);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [userBooking, setUserBooking] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      try {
        const { data } = await api.get(`/trips/${id}`);
        if (data && data.tripData) {
          setTrip({
            ...data.tripData,
            destination: data.destination,
          });
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load trip details.'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const fetchMembers = async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/bookings/trip/${id}/members`);
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [id]);

  useEffect(() => {
    if (trip && user) {
      checkBookingStatus();
    }
  }, [trip, user]);

  const checkBookingStatus = async () => {
    try {
      // Check status by destination name associated with this trip
      const { data } = await api.get(`/bookings/status/${encodeURIComponent(trip.destination)}`);
      if (data) {
        setBookingStatus(data.status || 'none');
        setUserBooking(data._id ? data : null);
      }
    } catch (error) {
      console.error("Failed to check status", error);
    }
  };

  const handleJoinTrip = async () => {
    try {
      console.log("DEBUG: User attempting to join trip", id);
      const response = await api.post('/bookings/join', {
        destination: trip.destination,
        tripId: id
      });
      console.log("DEBUG: Join request response:", response.data);
      setBookingStatus('pending');
      fetchMembers(); // Update members list after joining
      toast({
        title: "Request Sent",
        description: "Your request has been sent to the Organiser/Admin.",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (error) {
      console.error("Join Trip Error FULL:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to join.";
      toast({
        title: "Error Joining",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "You can now share this trip with your friends."
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl font-medium text-gray-500">Loading your adventure...</p>
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen bg-linear-to-b from-blue-50/50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <Globe className="w-12 h-12 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">No Trip Found</h1>
        <p className="text-gray-600 mb-8">Please generate a trip first to view your itinerary.</p>
        <Link
          to="/create-trip"
          className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
        >
          <Navigation className="w-5 h-5" />
          Create New Trip
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50/50 to-white">
      {/* Trip Header */}
      <div className="bg-linear-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 border-b border-gray-200/50">
        <div className="px-5 sm:px-10 md:px-24 lg:px-48 xl:px-64 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-blue-50 to-purple-50 border border-blue-100 mb-6 shadow-sm">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Custom Trip Itinerary
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-700 via-purple-700 to-gray-800 bg-clip-text text-transparent mb-2">
              {trip.hotels?.[0]?.hotelName || trip.destination || 'Your Trip'}
            </h1>
            {trip.hotels?.[0]?.hotelName && (
              <p className="text-xl text-gray-500 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" /> {trip.destination}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-6 text-gray-600">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{trip.duration || 'Custom'} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="font-medium">{trip.rating || 'Premium'} Experience</span>
                </div>
              </div>

              <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4 text-gray-700" />
                <span className="font-medium text-gray-700">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 sm:px-10 md:px-24 lg:px-48 xl:px-64 py-12">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Pending Notification Banner */}


          {/* Members & Booking Status Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
            {/* Community Members */}
            <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-1 mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Travel Community ({members.length})
                </h3>
                <p className="text-gray-500 text-sm italic">Meet the fellow adventurers joining this trip</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {members.length > 0 ? (
                  members.map((member, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-all">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-110 transition-transform">
                        {member.userId?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{member.userId?.username}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Approved Member</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex items-center gap-3 bg-gray-50 px-6 py-8 rounded-xl border border-dashed border-gray-300 justify-center">
                    <Globe className="w-5 h-5 text-gray-400 animate-pulse" />
                    <span className="text-sm font-medium text-gray-500">Wait for the first member to join!</span>
                  </div>
                )}
              </div>
            </div>

            {/* User Specific Booking Detail Card */}
            <div className={`lg:col-span-1 rounded-2xl p-6 shadow-sm border transition-all flex flex-col justify-between
              ${bookingStatus === 'approved' ? 'bg-green-50 border-green-200' :
                bookingStatus === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'}`}>

              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Booking Status
                </h4>

                <div className="py-4">
                  {bookingStatus === 'approved' ? (
                    <div className="space-y-3">
                      <div className="flex flex-col items-center gap-2 text-center text-green-700">
                        <CheckCircle className="w-10 h-10" />
                        <p className="font-bold">Access Granted!</p>
                        <p className="text-xs">You are a confirmed member of this community trip.</p>
                      </div>
                      <Link
                        to={`/chat?tripId=${id}`}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-100 transition-all transform hover:scale-[1.02]"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Join Trip Chat
                      </Link>
                    </div>
                  ) : bookingStatus === 'pending' ? (
                    <div className="space-y-3">
                      <div className="flex flex-col items-center gap-2 text-center text-yellow-700">
                        <Clock className="w-10 h-10 animate-pulse" />
                        <p className="font-bold">Pending Review</p>
                        <p className="text-xs">An admin is reviewing your request to join.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col items-center gap-2 text-center text-blue-700">
                        <Navigation className="w-10 h-10" />
                        <p className="font-bold">Ready to travel?</p>
                        <p className="text-xs">Request access to see the full community details.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/5">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest text-center">Safety Verified Trip</p>
              </div>
            </div>
          </div>



          {/* Hotels Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-10 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-800">
                🏨 Recommended Hotels
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trip?.hotels?.map((hotel, index) => (
                <TripCard
                  key={index}
                  hotel={hotel}
                  isHotel={true}
                  tripId={id}
                  tripHotelName={trip.hotels?.[0]?.hotelName}
                />
              ))}
            </div>
          </section>

          {/* Itinerary Section */}
          <section className="relative">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-10 bg-linear-to-b from-emerald-500 to-green-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-800">
                  🗓 Daily Itinerary Plan
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                Your personalized day-by-day adventure schedule
              </p>
            </div>

            <div className="space-y-8">
              <ItinerarySection itinerary={trip.itinerary} tripHotelName={trip.hotels?.[0]?.hotelName} />
            </div>
          </section>

          {/* Summary & Actions */}
          <section className="bg-linear-to-br from-blue-50/50 to-purple-50/50 rounded-3xl p-8 border border-gray-200/50">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Ready to Join This Adventure?
              </h3>
              <p className="text-gray-600 mb-8">
                Connect with the group, discuss plans, and get ready for your trip to {trip.destination}.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                {/* Dynamic Logic for Booking/Chat */}
                {bookingStatus === 'none' && (
                  <button
                    onClick={handleJoinTrip}
                    className="px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Request to Join Trip
                  </button>
                )}

                {bookingStatus === 'pending' && (
                  <button
                    disabled
                    className="px-8 py-4 bg-yellow-100 text-yellow-800 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-yellow-200"
                  >
                    <Clock className="w-5 h-5" />
                    Pending Admin Validation
                  </button>
                )}

                {bookingStatus === 'approved' && (
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                      disabled
                      className="px-8 py-4 bg-green-100 text-green-800 font-bold rounded-xl cursor-default flex items-center justify-center gap-2 border border-green-200"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Trip Approved
                    </button>
                    <Link
                      to={`/chat?tripId=${id}`}
                      className="px-8 py-4 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-5 h-5" />
                      Chat with Approved Members
                    </Link>
                  </div>
                )}

                {bookingStatus === 'revoked' && (
                  <div className="px-8 py-4 bg-red-100 text-red-800 font-bold rounded-xl flex items-center justify-center gap-2 border border-red-200">
                    <Shield className="w-5 h-5" />
                    Access Revoked by Admin
                  </div>
                )}

                {bookingStatus === 'rejected' && (
                  <div className="px-8 py-4 bg-red-100 text-red-800 font-bold rounded-xl flex items-center justify-center gap-2 border border-red-200">
                    <XCircle className="w-5 h-5" />
                    Join Request Rejected
                  </div>
                )}

                {/* Standard Actions */}
                <button
                  onClick={() => window.print()}
                  className="px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                >
                  Download Itinerary
                </button>
                <button onClick={handleShare} className="px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-300">
                  Share Trip
                </button>

                {/* New Package Details Button */}
                <button
                  onClick={() => setShowTripDetails(true)}
                  className="px-6 py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Trip Details
                </button>
              </div>
            </div>
          </section>



          {/* Custom Trip Details Modal */}
          {showTripDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
              <div
                className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100"
                role="dialog"
                aria-modal="true"
              >
                {/* Modal Header */}
                <div className="relative px-8 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Trip Overview</h2>
                      <div className="flex items-center gap-4 text-blue-100">
                        <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-md border border-white/10">
                          <MapPin className="w-4 h-4" /> {trip.destination}
                        </span>
                        <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-md border border-white/10">
                          <Clock className="w-4 h-4" /> {trip.duration} Days
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTripDetails(false)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl pointer-events-none"></div>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar bg-gray-50/50">
                  <div className="space-y-10">

                    {/* Hotel Summary */}
                    <div>
                      <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        Accommodation Highlights
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {trip.hotels?.map((hotel, idx) => (
                          <div key={idx} className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 flex gap-4">
                            <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-200">
                              <img
                                src={hotel?.imageUrl || '/placeholder.jpg'}
                                alt={hotel?.hotelName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.src = '/placeholder.jpg';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate">{hotel?.hotelName}</h4>
                              <p className="text-sm text-gray-500 mb-2 truncate">{hotel?.address}</p>
                              <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                                  {hotel?.price}
                                </span>
                                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span>{hotel?.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    {/* Itinerary Preview */}
                    <div>
                      <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        Itinerary Roadmap
                      </h3>

                      <div className="relative border-l-2 border-purple-200 ml-4 space-y-8 pb-4">
                        {Object.entries(trip.itinerary || {}).sort((a, b) => {
                          const dayA = parseInt(a[0].replace(/\D/g, '')) || 0;
                          const dayB = parseInt(b[0].replace(/\D/g, '')) || 0;
                          return dayA - dayB;
                        }).map(([day, details], idx) => (
                          <div key={idx} className="relative pl-8">
                            {/* Dot */}
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-purple-500 shadow-sm"></div>

                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-purple-600 font-bold uppercase tracking-wider text-sm">
                                  {day}
                                </span>
                                <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded-full">{details?.time || 'All Day'}</span>
                              </div>
                              <h4 className="font-bold text-lg text-gray-800 mb-2">
                                {details?.theme || details?.placeName || 'Exploration Day'}
                              </h4>
                              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                {details?.details || details?.description || 'Enjoy a wonderful day exploring the best spots in the city.'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Modal */}
                <div className="p-6 bg-white border-t border-gray-100 shrink-0 flex justify-end gap-3">
                  <button
                    onClick={() => setShowTripDetails(false)}
                    className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => { setShowTripDetails(false); window.print(); }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
