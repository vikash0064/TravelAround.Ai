// import React, { useState } from 'react';
// import { Calendar, Clock, Users, Building } from 'lucide-react';

// const BookingForm = ({ hotel, isHotel = true }) => {
//   const [bookingData, setBookingData] = useState({
//     checkIn: '',
//     checkOut: '',
//     checkInTime: '14:00',
//     checkOutTime: '12:00',
//     guests: '2',
//     rooms: '1',
//     specialRequests: ''
//   });

//   const handleChange = (e) => {
//     const { id, value } = e.target;
//     setBookingData(prev => ({
//       ...prev,
//       [id]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Redirect to OYO with booking data
//     redirectToOYO(bookingData);
//   };

//   const redirectToOYO = (data) => {
//     const baseUrl = "https://www.oyorooms.com";
//     const params = new URLSearchParams({
//       location: hotel?.address || hotel?.location || '',
//       checkin: data.checkIn,
//       checkout: data.checkOut,
//       guests: data.guests,
//       rooms: data.rooms
//     });
    
//     window.open(`${baseUrl}/search?${params.toString()}`, '_blank');
//   };

//   // Get today's date in YYYY-MM-DD format for min date
//   const today = new Date().toISOString().split('T')[0];

//   return (
//     <div className="space-y-4 mb-6">
//       {isHotel ? (
//         <form id="bookingForm" onSubmit={handleSubmit} className="space-y-6">
//           {/* Check-in Date & Time */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">
//               <div className="flex items-center gap-2 mb-1">
//                 <Calendar className="w-4 h-4 text-blue-500" />
//                 <span>Check-in Details</span>
//               </div>
//             </label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <label className="text-xs text-gray-500">Date</label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="date"
//                     id="checkIn"
//                     value={bookingData.checkIn}
//                     onChange={handleChange}
//                     min={today}
//                     className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <label className="text-xs text-gray-500">Time</label>
//                 <div className="relative">
//                   <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <select
//                     id="checkInTime"
//                     value={bookingData.checkInTime}
//                     onChange={handleChange}
//                     className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
//                   >
//                     <option value="06:00">6:00 AM</option>
//                     <option value="07:00">7:00 AM</option>
//                     <option value="08:00">8:00 AM</option>
//                     <option value="09:00">9:00 AM</option>
//                     <option value="10:00">10:00 AM</option>
//                     <option value="11:00">11:00 AM</option>
//                     <option value="12:00">12:00 PM</option>
//                     <option value="13:00">1:00 PM</option>
//                     <option value="14:00" selected>2:00 PM (Standard)</option>
//                     <option value="15:00">3:00 PM</option>
//                     <option value="16:00">4:00 PM</option>
//                     <option value="17:00">5:00 PM</option>
//                     <option value="18:00">6:00 PM</option>
//                     <option value="19:00">7:00 PM</option>
//                     <option value="20:00">8:00 PM</option>
//                     <option value="21:00">9:00 PM</option>
//                     <option value="22:00">10:00 PM</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Check-out Date & Time */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">
//               <div className="flex items-center gap-2 mb-1">
//                 <Calendar className="w-4 h-4 text-red-500" />
//                 <span>Check-out Details</span>
//               </div>
//             </label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <label className="text-xs text-gray-500">Date</label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="date"
//                     id="checkOut"
//                     value={bookingData.checkOut}
//                     onChange={handleChange}
//                     min={bookingData.checkIn || today}
//                     className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <label className="text-xs text-gray-500">Time</label>
//                 <div className="relative">
//                   <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <select
//                     id="checkOutTime"
//                     value={bookingData.checkOutTime}
//                     onChange={handleChange}
//                     className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
//                   >
//                     <option value="06:00">6:00 AM</option>
//                     <option value="07:00">7:00 AM</option>
//                     <option value="08:00">8:00 AM</option>
//                     <option value="09:00">9:00 AM</option>
//                     <option value="10:00">10:00 AM</option>
//                     <option value="11:00">11:00 AM</option>
//                     <option value="12:00" selected>12:00 PM (Standard)</option>
//                     <option value="13:00">1:00 PM</option>
//                     <option value="14:00">2:00 PM</option>
//                     <option value="15:00">3:00 PM</option>
//                     <option value="16:00">4:00 PM</option>
//                     <option value="17:00">5:00 PM</option>
//                     <option value="18:00">6:00 PM</option>
//                     <option value="19:00">7:00 PM</option>
//                     <option value="20:00">8:00 PM</option>
//                     <option value="21:00">9:00 PM</option>
//                     <option value="22:00">10:00 PM</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Guests & Rooms */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">
//               <div className="flex items-center gap-2 mb-1">
//                 <Users className="w-4 h-4 text-green-500" />
//                 <span>Guests & Rooms</span>
//               </div>
//             </label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <label className="text-xs text-gray-500">Guests</label>
//                 <div className="relative">
//                   <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <select
//                     id="guests"
//                     value={bookingData.guests}
//                     onChange={handleChange}
//                     className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
//                   >
//                     <option value="1">1 Guest</option>
//                     <option value="2">2 Guests</option>
//                     <option value="3">3 Guests</option>
//                     <option value="4">4 Guests</option>
//                     <option value="5">5 Guests</option>
//                     <option value="6">6 Guests</option>
//                     <option value="7">7 Guests</option>
//                     <option value="8">8+ Guests</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <label className="text-xs text-gray-500">Rooms</label>
//                 <div className="relative">
//                   <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <select
//                     id="rooms"
//                     value={bookingData.rooms}
//                     onChange={handleChange}
//                     className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
//                   >
//                     <option value="1">1 Room</option>
//                     <option value="2">2 Rooms</option>
//                     <option value="3">3 Rooms</option>
//                     <option value="4">4 Rooms</option>
//                     <option value="5">5+ Rooms</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Special Requests */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Special Requests (Optional)
//             </label>
//             <textarea
//               id="specialRequests"
//               value={bookingData.specialRequests}
//               onChange={handleChange}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               rows="3"
//               placeholder="Any special requirements like early check-in, late check-out, non-smoking room, etc."
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
//           >
//             Search on OYO Rooms
//           </button>
//         </form>
//       ) : (
//         {/* Attraction booking form */}
//         <div className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">
//               <div className="flex items-center gap-2 mb-1">
//                 <Calendar className="w-4 h-4 text-blue-500" />
//                 <span>Visit Date & Time</span>
//               </div>
//             </label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <label className="text-xs text-gray-500">Date</label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="date"
//                     min={today}
//                     className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <label className="text-xs text-gray-500">Time Slot</label>
//                 <div className="relative">
//                   <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <select className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none">
//                     <option>Morning (9 AM - 12 PM)</option>
//                     <option>Afternoon (12 PM - 4 PM)</option>
//                     <option>Evening (4 PM - 7 PM)</option>
//                     <option>Full Day (9 AM - 6 PM)</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Number of Visitors
//             </label>
//             <div className="relative">
//               <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <select className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none">
//                 <option>1 Visitor</option>
//                 <option>2 Visitors</option>
//                 <option>3 Visitors</option>
//                 <option>4 Visitors</option>
//                 <option>5+ Visitors</option>
//               </select>
//             </div>
//           </div>

//           <button
//             type="button"
//             className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
//           >
//             Check Availability
//           </button>
//         </div>
//       )}
// export default BookingForm;