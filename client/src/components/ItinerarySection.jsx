import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronRight, ChevronDown, Star, Heart, ExternalLink, Bookmark } from 'lucide-react';
import { Toggle } from "@/components/ui/toggle"

const ItinerarySection = ({ itinerary, tripHotelName }) => {
  const [expandedDays, setExpandedDays] = useState({});
  const [likedPlaces, setLikedPlaces] = useState({});
  const [savedPlaces, setSavedPlaces] = useState({});

  const PlaceCard = ({ place, placeIndex, dayIndex }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLiked = likedPlaces[`${dayIndex}-${placeIndex}`];
    const isSaved = savedPlaces[`${dayIndex}-${placeIndex}`];

    return (
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex">
          <div className="w-16 p-4 flex flex-col items-center justify-center border-r border-gray-200">
            <div className="text-sm font-medium text-gray-500">{place.time || `${9 + placeIndex * 2}:00`}</div>
            <div className="text-xs text-gray-400 mt-1">Stop {placeIndex + 1}</div>
          </div>

          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{place.placeName}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {place.details || 'Experience this amazing attraction'}
                </p>
              </div>
              <button
                onClick={() => setLikedPlaces(prev => ({
                  ...prev,
                  [`${dayIndex}-${placeIndex}`]: !isLiked
                }))}
                className="ml-2"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
              {place.travelTime && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{place.travelTime}</span>
                </div>
              )}

              {place.ticketPricing && (
                <div className="flex items-center">
                  <span className="font-medium text-green-600">{place.ticketPricing}</span>
                  <span className="text-gray-500 ml-1">/person</span>
                </div>
              )}

              {place.rating && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-500 mr-1" />
                  <span>{place.rating}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                <ExternalLink className="w-4 h-4 mr-1" />
                Details
              </button>
              <div className="flex items-center">
                <button
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded text-sm mr-2"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.placeName)}`, '_blank')}
                >
                  View Map
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-2"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              <Toggle
                pressed={isSaved}
                onPressed={() => setSavedPlaces(prev => ({
                  ...prev,
                  [`${dayIndex}-${placeIndex}`]: !isSaved
                }))}
                className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-linear-to-r from-blue-200 to-purple-200 data-[state=on]:bg-blue-200 rounded text-sm font-medium flex items-center"
              >
                <Bookmark className="w-4 h-4" />
                Save
              </Toggle>

            </div>
          </div>
        </div>
      </div>
    );
  };

  const DayHeader = ({ dayPlan, dayIndex, isExpanded }) => {
    return (
      <div
        className="p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 border-b"
        onClick={() => setExpandedDays(prev => ({ ...prev, [dayIndex]: !isExpanded }))}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
              <span className="text-white font-bold">D{dayPlan.day}</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">
                {dayPlan.title || `Day ${dayPlan.day}`}
              </h2>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span className="flex items-center mr-3">
                  <Clock className="w-4 h-4 mr-1" />
                  8h
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {dayPlan.places?.length || 0} stops
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // We navigate to view-details with the first place of the day as context if available
                if (dayPlan.places?.[0]) {
                  const hotel = dayPlan.places[0];
                  window.location.href = `/view-details?tripId=${window.location.pathname.split('/').pop()}`;
                  // Actually, it's better to use useNavigate but this component doesn't have it injected easily without a hook
                }
              }}
              className="px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded text-sm mr-2"
            >
              View Day Plan
            </button>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Travel Itinerary</h1>
              <p className="text-gray-600 text-sm mt-1">
                {itinerary?.length || 0} days • {itinerary?.reduce((acc, day) => acc + (day.places?.length || 0), 0) || 0} experiences
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-2xl hover:bg-gray-100 text-sm">
                Share
              </button>
              <button className="px-3 py-2 bg-blue-600 to-purple-600 text-white rounded hover:bg-linear-to-r from-blue-600 to-purple-600 text-sm  rounded-2xl flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Days List */}
        {itinerary?.map((dayPlan, dayIndex) => {
          const isExpanded = expandedDays[dayIndex];

          return (
            <div key={dayIndex} className="mb-6">
              {/* Day Card */}
              <div className="bg-white rounded-lg border border-gray-200 ">
                <DayHeader
                  dayPlan={dayPlan}
                  dayIndex={dayIndex}
                  isExpanded={isExpanded}
                />

                {isExpanded && (
                  <div className="p-4">
                    {/* Places List */}
                    <div className="space-y-3">
                      {dayPlan.places?.map((place, placeIndex) => (
                        <PlaceCard
                          key={placeIndex}
                          place={place}
                          placeIndex={placeIndex}
                          dayIndex={dayIndex}
                        />
                      ))}
                    </div>

                    {/* Day Summary */}
                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                      <h4 className="font-bold text-gray-900 mb-3">Day {dayPlan.day} Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-500">Time</div>
                          <div className="font-bold">8h</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-500">Stops</div>
                          <div className="font-bold">{dayPlan.places?.length || 0}</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-500">Cost</div>
                          <div className="font-bold text-green-600">$150</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-500">Distance</div>
                          <div className="font-bold">15km</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItinerarySection;