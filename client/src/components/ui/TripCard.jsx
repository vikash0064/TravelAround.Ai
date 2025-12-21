import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { MapPin, Star, Clock, Calendar, ExternalLink } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const TripCard = ({ hotel, isHotel = true, tripId, tripHotelName }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageArray, setImageArray] = useState([]);
  const navigate = useNavigate();

  // Generate safe image array
  useEffect(() => {
    const generateImages = () => {
      const name = isHotel ? hotel.hotelName : hotel.placeName;
      const images = [];

      // 1. Provided image
      if (hotel.imageUrl && hotel.imageUrl.startsWith('http')) {
        images.push(hotel.imageUrl);
      }

      // 2. Local AI-generated premium assets
      if (isHotel) {
        images.push('/hotels/luxury.png');
        images.push('/hotels/boutique.png');
        images.push('/hotels/resort.png');
        images.push('/hotels/modern.png');
      } else {
        images.push('/attractions/temple.png');
      }

      // 3. Keyword-based placeholders
      if (name) {
        images.push(`https://loremflickr.com/800/600/${encodeURIComponent(name.toLowerCase())},travel`);
      }

      // 4. Generic safe fallbacks
      images.push(`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80`);
      images.push(`https://picsum.photos/800/600?random=${Math.random()}`);

      const uniqueImages = [...new Set(images.filter(url => url))];
      setImageArray(uniqueImages);
    };

    generateImages();
  }, [hotel, isHotel]);

  const handleImageError = (e, index) => {
    e.target.src = isHotel
      ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80';
  };

  const handleViewDetails = () => {
    navigate("/view-details", {
      state: {
        hotel,
        isHotel,
        tripId,
        tripHotelName: tripHotelName || (isHotel ? hotel.hotelName : null)
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">

      {/* Image Slider */}
      <div className="relative h-64 md:h-72 bg-linear-to-br from-blue-50/50 to-purple-50/50">
        {imageArray.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false
            }}
            onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
            className="h-full"
          >
            {imageArray.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img}
                  alt={`${hotel.hotelName || hotel.placeName || 'Destination'} - Image ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => handleImageError(e, idx)}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent"></div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-20">
                {isHotel ? '🏨' : '🏛️'}
              </div>
            </div>
          </div>
        )}

        {/* Rating Badge */}
        {hotel.rating && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-1 shadow-lg">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-bold text-gray-800">{hotel.rating}</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isHotel
            ? 'bg-blue-100 text-blue-700'
            : 'bg-emerald-100 text-emerald-700'
            }`}>
            {isHotel ? 'Hotel' : 'Attraction'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {isHotel ? hotel.hotelName || 'Hotel Name' : hotel.placeName || 'Attraction Name'}
          </h3>

          {/* Location */}
          {isHotel && hotel.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="line-clamp-1">{hotel.address}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2">
            {isHotel ? hotel.description || 'Comfortable accommodation' : hotel.details || 'Popular tourist attraction'}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Price */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <span className="text-blue-600">💰</span>
            </div>
            <div>
              <div className="text-xs text-gray-500">{isHotel ? 'Price' : 'Ticket'}</div>
              <div className="font-semibold text-green-600">
                {isHotel ? (hotel.price || '$100-$200') : (hotel.ticketPricing || 'Varies')}
              </div>
            </div>
          </div>

          {/* Best Time / Duration */}
          {!isHotel ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Best Time</div>
                <div className="font-semibold text-gray-700">
                  {hotel.bestTimeToVisit || 'Morning'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                <Star className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Rating</div>
                <div className="font-semibold text-gray-700">
                  {hotel.rating || '4.5'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleViewDetails}
          className="w-full relative group/btn"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75 group-hover/btn:opacity-100 transition duration-500"></div>
          <div className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform group-hover/btn:-translate-y-0.5 flex items-center justify-center gap-2">
            {isHotel ? 'View Details & Book' : 'Add to Day Plan'}
            <ExternalLink className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default TripCard;