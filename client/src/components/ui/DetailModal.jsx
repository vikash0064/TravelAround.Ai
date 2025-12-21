// components/DetailModal.jsx
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import { 
  X, MapPin, Star, Clock, DollarSign, Users, Wifi, Car, 
  Utensils, Heart, Share2, Calendar, Phone, Globe, 
  ChevronLeft, ChevronRight, Maximize2, CheckCircle,
  Navigation as NavigationIcon, Info, BookOpen
} from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { Toggle } from "@/components/ui/toggle"


const DetailModal = ({ isOpen, onClose, data, isHotel = true }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageArray, setImageArray] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const features = isHotel ? [
    { icon: <Wifi className="w-5 h-5" />, label: 'Free WiFi', available: true },
    { icon: <Users className="w-5 h-5" />, label: 'Family Rooms', available: true },
    { icon: <Car className="w-5 h-5" />, label: 'Parking', available: true },
    { icon: <Utensils className="w-5 h-5" />, label: 'Restaurant', available: true },
    { icon: '🏊', label: 'Pool', available: true },
    { icon: '💆', label: 'Spa', available: false },
    { icon: '🏋️', label: 'Gym', available: true },
    { icon: '🛎️', label: '24/7 Service', available: true },
  ] : [
    { icon: <Clock className="w-5 h-5" />, label: 'Guided Tours', available: true },
    { icon: <Users className="w-5 h-5" />, label: 'Family Friendly', available: true },
    { icon: '♿', label: 'Accessible', available: true },
    { icon: '🅿️', label: 'Parking', available: true },
    { icon: '🎧', label: 'Audio Guide', available: true },
    { icon: '🛍️', label: 'Gift Shop', available: true },
    { icon: '☕', label: 'Café', available: true },
    { icon: '📸', label: 'Photo Spots', available: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full h-full bg-white shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-110"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Image Gallery */}
        <div className="relative h-96 bg-gray-900">
          <Swiper
            modules={[Navigation, Pagination, Thumbs]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            thumbs={{ swiper: thumbsSwiper }}
            onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
            className="h-full"
          >
            {imageArray.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img 
                  src={img} 
                  alt={`${isHotel ? data.hotelName : data.placeName} - Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
            {activeImageIndex + 1} / {imageArray.length}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-320px)]">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isHotel 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isHotel ? 'HOTEL' : 'ATTRACTION'}
                    </span>
                    {data.rating && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-gray-800">{data.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isHotel ? data.hotelName : data.placeName}
                  </h2>
                  
                  {isHotel && data.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{data.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-lg transition-colors ${isLiked 
                      ? 'bg-red-50 text-red-500' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {['overview', 'features', 'reviews', 'location'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {isHotel 
                      ? data.description || 'Experience luxury and comfort in our beautifully appointed accommodations. Featuring modern amenities, exceptional service, and a prime location, this hotel offers everything you need for a memorable stay.'
                      : data.details || 'Discover this amazing attraction with stunning views, rich history, and unforgettable experiences. Perfect for visitors of all ages looking to create lasting memories.'
                    }
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">
                        {isHotel ? 'Price Range' : 'Ticket Price'}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {isHotel ? (data.price || '$199 - $399') : (data.ticketPricing || '$25 - $50')}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">
                        {isHotel ? 'Check-in/out' : 'Opening Hours'}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {isHotel ? '3PM / 11AM' : '9AM - 6PM'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">
                        {isHotel ? 'Guest Rating' : 'Visitor Rating'}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {data.rating || '4.5'} ⭐
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">
                        {isHotel ? 'Rooms' : 'Visit Duration'}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {isHotel ? '120+' : '2-3 hours'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'features' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {features.map((feature, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-3 p-3 rounded-lg ${feature.available ? 'bg-gray-50' : 'bg-gray-50/50'}`}
                      >
                        <span className={`text-lg ${feature.available ? 'text-blue-500' : 'text-gray-300'}`}>
                          {feature.icon}
                        </span>
                        <span className={`text-sm ${feature.available ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Reviews</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((review) => (
                      <div key={review} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <span className="font-medium">Traveler {review}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                          "Great experience! {isHotel ? 'The rooms were clean and the staff was very helpful.' : 'Beautiful place with amazing views. Highly recommended!'}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Price</div>
              <div className="text-2xl font-bold text-gray-900">
                {isHotel ? (data.price || '$199') : (data.ticketPricing || '$25')}
                <span className="text-sm text-gray-500 ml-2">
                  {isHotel ? '/night' : '/person'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Toggle><button  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Save for Later
              </button></Toggle>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg">
                {isHotel ? 'Book Now' : 'Get Tickets'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;