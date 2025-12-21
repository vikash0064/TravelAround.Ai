import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Star, Clock, Calendar,
  Phone, Globe, Wifi, Car, Utensils, Users,
  CreditCard, Shield, CheckCircle, Navigation,
  Hotel, Map, Clock3, DollarSign, User, Tag, MessageSquare
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation as SwiperNav, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useAuth } from '../context/AuthContext';
import api from '../service/api';
import { useToast } from '../components/ui/toast';
import PaymentModal from '../components/PaymentModal';
import ItinerarySection from '../components/ItinerarySection';

// Function to redirect to OYO with user inputs
const redirectToOYO = (bookingData) => {
  const baseUrl = "https://www.oyorooms.com";

  // Build search parameters based on user input
  const params = new URLSearchParams({
    location: bookingData.destination || '',
    checkin: bookingData.checkIn || '',
    checkout: bookingData.checkOut || '',
    guests: bookingData.guests || '2',
    rooms: bookingData.rooms || '1'
  });

  // Redirect to OYO with parameters
  window.open(`${baseUrl}/search?${params.toString()}`, '_blank');
};

// Usage in your form submit
const handleSubmit = (e) => {
  e.preventDefault();

  const bookingData = {
    destination: document.getElementById('destination').value,
    checkIn: document.getElementById('checkin').value,
    checkOut: document.getElementById('checkout').value,
    guests: document.getElementById('guests').value,
    rooms: document.getElementById('rooms').value
  };

  redirectToOYO(bookingData);
};
const ViewDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotel, isHotel = true, tripId, tripHotelName } = location.state || {};
  const [loading, setLoading] = useState(!hotel);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);

  // New Features State
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingStatus, setBookingStatus] = useState('none'); // none, pending, approved, rejected
  const [showChat, setShowChat] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const images = hotel ? (function () {
    const name = isHotel ? hotel.hotelName : hotel.placeName;
    const images = [];
    if (hotel.imageUrl && hotel.imageUrl.startsWith('http')) {
      images.push(hotel.imageUrl);
    }
    if (name) {
      images.push(`https://source.unsplash.com/featured/1200x800/?${encodeURIComponent(name)} ${isHotel ? 'hotel' : 'tourist attraction'}`);
      images.push(`https://source.unsplash.com/featured/1200x800/?${encodeURIComponent(name)} ${isHotel ? 'luxury' : 'travel'}`);
    }
    images.push(`https://source.unsplash.com/featured/1200x800/?${isHotel ? 'luxury hotel room' : 'tourist destination'}`);
    images.push(`https://source.unsplash.com/featured/1200x800/?${isHotel ? 'hotel lobby' : 'vacation spot'}`);
    return [...new Set(images.filter(url => url && url.startsWith('http')))].slice(0, 5);
  })() : [];

  const name = isHotel ? hotel?.hotelName || 'Hotel Name' : hotel?.placeName || 'Attraction Name';
  const displayTitle = tripHotelName || name;
  const description = isHotel ? hotel?.description || 'Comfortable accommodation' : hotel?.details || 'Popular tourist attraction';
  const address = hotel?.address || 'Address not specified';
  const price = isHotel ? (hotel?.price || '$100 - $200 per night') : (hotel?.ticketPricing || 'Varies');
  const rating = hotel?.rating || '4.5';
  const bestTime = hotel?.bestTimeToVisit || 'Morning';

  const destinationName = address || hotel?.placeName || hotel?.hotelName || "Unknown Destination";

  const [tripData, setTripData] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!hotel) {
      setTimeout(() => setLoading(false), 1000);
    } else {
      if (user) checkBookingStatus();
      // Only fetch if tripId is a valid-looking ObjectId string
      if (tripId && typeof tripId === 'string' && tripId.length >= 24 && tripId !== 'undefined' && tripId !== 'null' && !tripId.includes('[object')) {
        fetchTripAndMembers();
      } else {
        console.warn("ViewDetails: Missing or invalid tripId, skipping context fetch", tripId);
      }
    }
  }, [hotel, user, tripId]);

  const fetchTripAndMembers = async () => {
    try {
      const [tripRes, membersRes] = await Promise.all([
        api.get(`/trips/${tripId}`),
        api.get(`/bookings/trip/${tripId}/members`)
      ]);
      setTripData(tripRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error("Failed to fetch trip context", err);
    }
  };

  const checkBookingStatus = async () => {
    try {
      const { data } = await api.get(`/bookings/status/${encodeURIComponent(destinationName)}`);
      if (data && data.status) {
        setBookingStatus(data.status);
      }
    } catch (error) {
      console.error("Failed to check status", error);
    }
  };

  const handleJoinTrip = () => {
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to be logged in to join trips.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    setShowPaymentModal(true);
  };

  const processBooking = async () => {
    try {
      console.log("DEBUG: Processing booking for", destinationName);
      const response = await api.post('/bookings/join', {
        destination: destinationName,
        tripId: tripId || hotel?.tripId,
        hotelId: hotel?.id || hotel?.name,
        hotelName: name,
        hotelImage: images[0],
        hotelAddress: address,
        price: price
      });

      console.log("DEBUG: Booking successful", response.data);
      setBookingStatus('pending');
      setShowPaymentModal(false);
      toast({
        title: "Request Sent",
        description: "Your request to join has been sent to the Organiser/Admin.",
        type: "success"
      });
    } catch (error) {
      console.error("Booking Error FULL:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to join.";
      toast({
        title: "Booking Failed",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "Share this destination with your friends!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Hotel className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">No Details Found</h1>
          <p className="text-gray-600 mb-8">
            Please select a hotel or attraction to view details.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Image generation moved up

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/20 to-white text-left">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate max-w-md">
              {displayTitle}
            </h1>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isHotel
                ? 'bg-blue-100 text-blue-700'
                : 'bg-emerald-100 text-emerald-700'}`}>
                {isHotel ? 'Hotel' : 'Attraction'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="rounded-2xl overflow-hidden shadow-xl mb-6">
              <Swiper
                modules={[SwiperNav, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                className="h-64 md:h-96"
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <img
                      src={img}
                      alt={`${name} - Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = isHotel
                          ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'
                          : 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Basic Info */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-gray-800">{rating}</span>
                  <span className="text-gray-500">/5.0</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-green-600">{price}</span>
                </div>

                {!isHotel && (
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium text-gray-700">Best: {bestTime}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl mb-6">
                <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Location</h3>
                  <p className="text-gray-600">{address}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex flex-wrap gap-4 sm:gap-6">
                  {['overview', 'amenities', 'itinerary', 'community', 'reviews', 'location'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 px-1 font-medium capitalize border-b-2 transition-colors text-sm sm:text-base ${activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="py-6">
                {activeTab === 'overview' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
                    <p className="text-gray-600 leading-relaxed mb-8">{description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Exact Location
                        </h4>
                        <p className="text-sm text-gray-600">{address}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Pricing
                        </h4>
                        <p className="text-sm text-gray-600">{price}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {isHotel ? 'Amenities & Services' : 'Features & Facilities'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(isHotel ? ['Free WiFi', 'Swimming Pool', 'Spa', 'Parking', 'Restaurant', '24/7 Room Service'] : ['Guided Tours', 'Photography', 'Wheelchair Ready', 'Restrooms', 'Food Court', 'Parking']).map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700 font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'itinerary' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {tripData?.tripData?.itinerary ? (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <Calendar className="w-6 h-6 text-blue-600" />
                          <h3 className="text-2xl font-bold text-gray-900">Full Trip Itinerary</h3>
                        </div>
                        <ItinerarySection itinerary={tripData.tripData.itinerary} />
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <Clock className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No itinerary data available for this trip yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'community' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <Users className="w-6 h-6 text-blue-600" />
                          Travel Community
                        </h3>
                        <p className="text-gray-600">Meet the travelers who are part of this journey</p>
                      </div>
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                        {members.length} Members
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {members.length > 0 ? (
                        members.map((member, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                              {member.userId?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">{member.userId?.username || 'Traveler'}</h4>
                              <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Approved Member</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                          <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3 animate-pulse" />
                          <p className="text-gray-500">Be the first to join this community!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Verified Guest Reviews</h3>
                    <div className="space-y-4">
                      {[
                        { user: 'Sarah L.', rating: 5, comment: 'Simply amazing! Every detail was perfect.', date: 'Dec 2024' },
                        { user: 'James W.', rating: 4, comment: 'Great location and very responsive staff.', date: 'Nov 2024' }
                      ].map((review, idx) => (
                        <div key={idx} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {review.user[0]}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800">{review.user}</h4>
                                <div className="flex gap-1">
                                  {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Location Exploration</h3>
                    <div className="bg-gray-100 rounded-2xl h-80 flex items-center justify-center mb-6 relative overflow-hidden group">
                      <img
                        src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=13&size=800x400&key=YOUR_API_KEY`}
                        alt="Map Placeholder"
                        className="w-full h-full object-cover blur-xs group-hover:blur-0 transition-all duration-700"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200";
                          e.target.classList.remove('blur-xs');
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-white p-4">
                        <MapPin className="w-12 h-12 mb-2 drop-shadow-lg animate-bounce" />
                        <p className="font-bold text-lg drop-shadow-lg">{address}</p>
                        <button className="mt-4 px-6 py-2 bg-white text-gray-900 rounded-full text-sm font-bold hover:bg-blue-600 hover:text-white transition-all">
                          Open in Google Maps
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card (Replaced with Join Trip) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {isHotel ? 'Trip Details' : 'Plan Visit'}
                </h3>
                <Tag className="w-5 h-5 text-blue-500" />
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">
                  Est. Cost
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {isHotel ? (price.split('-')[0]?.trim()?.replace('$', '') || '200') : '20'}
                  <span className="text-lg text-gray-500">USD</span>
                </div>
              </div>

              <div className="space-y-4 mb-6 text-sm text-gray-600">
                <p>Join this trip to connect with other travelers.</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">

                {/* Dynamic Logic for Booking/Chat */}
                {bookingStatus === 'none' && (
                  <button
                    onClick={handleJoinTrip}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Request to Join Trip
                  </button>
                )}

                {bookingStatus === 'pending' && (
                  <button
                    disabled
                    className="w-full py-4 bg-yellow-100 text-yellow-800 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-yellow-200"
                  >
                    <Clock className="w-5 h-5" />
                    Pending Admin Validation
                  </button>
                )}

                {bookingStatus === 'approved' && (
                  <div className="space-y-3">
                    <button
                      disabled
                      className="w-full py-4 bg-green-100 text-green-800 font-bold rounded-xl cursor-default flex items-center justify-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      Join Request Approved
                    </button>
                    <button
                      onClick={() => navigate('/chat', { state: { tripId } })}
                      className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Enter Group Chat
                    </button>
                  </div>
                )}

                {(tripData?.userId === user?.id || tripData?.userId?._id === user?.id) && (
                  <button
                    onClick={() => navigate('/chat', { state: { tripId } })}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Trip Chat (Organiser)
                  </button>
                )}

                {bookingStatus === 'rejected' && (
                  <button
                    disabled
                    className="w-full py-4 bg-red-100 text-red-800 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    Join Request Rejected
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Share Destination
                </button>
              </div>

              {/* Safety Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Verified Travelers Only</span>
                </div>

                <div className="text-xs text-gray-500">
                  Admins or Trip Organisers validate all members before they can join the trip.
                </div>
              </div>
              <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={processBooking}
                amount={isHotel ? (price.split('-')[0]?.trim()?.replace('$', '') || '200') : '20'}
                itemName={name}
              />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ViewDetails;