import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NominatimAutocomplete from '../components/NominatimAutocomplete'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { SelectBudgetOptions, SelectTravelersList } from '../constants/options'
import { generateTripPlan } from '../service/AIModel'
import { useToast } from '../components/ui/toast'
import { useAuth } from '../context/AuthContext'
import api from '../service/api'
import TravelLoader from '../components/custom/TravelLoader'

function CreateTrip() {
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [selectedTraveler, setSelectedTraveler] = useState(null)
  const [formData, setFormData] = useState({})
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(false)

  // Get toast functions correctly
  const toast = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  useEffect(() => {
    console.log("DEBUG CreateTrip: Form data updated:", formData);
  }, [formData]);

  // ... (keep rest of existing code until GenerateTrip)

  const GenerateTrip = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please log in to generate a trip!", {
        action: {
          label: "Login",
          onClick: () => navigate('/login')
        }
      });
      navigate('/login');
      return;
    }

    console.log("=".repeat(50));
    console.log("DEBUG GenerateTrip: Starting process");
    console.log("DEBUG: Current form data:", formData);

    // Validation
    if (
      !formData?.location ||
      !formData?.budget ||
      !formData?.traveler ||
      !formData?.noOfDays ||
      formData.noOfDays < 1 ||
      formData.noOfDays > 7
    ) {
      toast.error("Please fill all the fields correctly. Days must be between 1 and 7.");
      return;
    }

    setLoading(true); // Start Loader

    // Show loading toast (optional, maybe remove since we have a full screen loader now, but keeping for feedback)
    // const toastId = toast.loading("Generating your trip...");

    try {
      const locationName =
        formData.location.display_name ||
        formData.location.name ||
        formData.location.label ||
        formData.location ||
        "Unknown location";

      console.log("DEBUG: Using location name:", locationName);

      const tripData = await generateTripPlan(
        locationName,
        formData.noOfDays,
        formData.budget,
        formData.traveler
      );

      console.log("DEBUG: Generated trip data:", tripData);

      // Validate response structure
      if (
        !tripData ||
        !Array.isArray(tripData.hotels) ||
        !Array.isArray(tripData.itinerary)
      ) {
        throw new Error("Invalid AI response format - missing required arrays");
      }

      // SAVE TO DATABASE MERN
      const saveResponse = await api.post('/trips', {
        destination: locationName,
        tripData: tripData,
        duration: formData.noOfDays,
        budget: formData.budget,
        requestOrganiser: formData.requestOrganiser || false
      });

      console.log("DEBUG: Full saveResponse:", saveResponse);
      if (saveResponse && saveResponse.data) {
        console.log("DEBUG: saveResponse.data:", saveResponse.data);
        console.log("DEBUG: Trip ID type:", typeof saveResponse.data._id);

        toast.success("Trip generated & saved successfully!");
        setTrip(tripData);
        navigate('/view-trip/' + saveResponse.data._id);
      }

    } catch (err) {
      console.error("DEBUG GenerateTrip: Error caught:", err);
      toast.error(`Failed to generate trip: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false); // Stop Loader
    }
  };


  // ... rest of your JSX code remains exactly the same ...
  return (
    <div className="px-5 sm:px-10 md:px-24 lg:px-48 xl:px-64 py-10">
      {/* Show Loader when loading */}
      {loading && <TravelLoader />}

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="font-bold text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Tell us your travel preferences
        </h1>

        <div className="relative mt-4 max-w-2xl mx-auto">
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-purple-400 rounded-br-lg"></div>

          <p className="mt-3 text-gray-600 text-lg leading-relaxed px-4 py-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm">
            Just provide some basic information, and our trip planner will generate
            a customized itinerary based on your preferences.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
        {/* Destination */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              What is your destination of choice?
            </h2>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white rounded-xl">
              <NominatimAutocomplete
                onChange={(item) => {
                  handleInputChange('location', item)
                }}
              />
            </div>
          </div>
        </div>

        {/* Days */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              How many days are you planning for the trip?
            </h2>
          </div>

          <div className="relative max-w-xs">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative">
              <Input
                type="number"
                min={0}
                placeholder="Ex: 3"
                value={formData.noOfDays ?? ''}
                onChange={(e) => {
                  const value = Math.max(0, Number(e.target.value));
                  handleInputChange('noOfDays', value);
                }}
                className="w-full pl-12 pr-6 py-6 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                days
              </div>
            </div>
          </div>
        </div>

        {/* Budget Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              What is your Budget?
            </h2>
          </div>

          <p className="text-lg text-gray-600 mb-8">
            The budget is exclusively allocated for activities
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SelectBudgetOptions.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedBudget(index);
                  handleInputChange('budget', item.title);
                }}
                className={`p-6 border-2 rounded-2xl flex flex-col gap-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1
                  ${selectedBudget === index
                    ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg shadow-orange-100'
                    : 'border-gray-100 hover:border-orange-200 hover:shadow-xl'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${selectedBudget === index ? 'bg-gradient-to-br from-yellow-400 to-orange-400' : 'bg-gray-100'}`}>
                    <span className={`text-3xl ${selectedBudget === index ? 'text-white' : 'text-gray-700'}`}>
                      {item.icon}
                    </span>
                  </div>
                  {selectedBudget === index && (
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                  )}
                </div>

                <h2 className="font-bold text-xl text-gray-800">
                  {item.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Travelers Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-8 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Who do you plan on traveling with on your next adventure?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SelectTravelersList.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedTraveler(index);
                  handleInputChange('traveler', item.title);
                }}
                className={`p-6 border-2 rounded-2xl flex flex-col gap-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1
                  ${selectedTraveler === index
                    ? 'border-rose-400 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg shadow-pink-100'
                    : 'border-gray-100 hover:border-pink-200 hover:shadow-xl'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${selectedTraveler === index ? 'bg-gradient-to-br from-pink-400 to-rose-400' : 'bg-gray-100'}`}>
                    <span className={`text-3xl ${selectedTraveler === index ? 'text-white' : 'text-gray-700'}`}>
                      {item.icon}
                    </span>
                  </div>
                  {selectedTraveler === index && (
                    <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full animate-pulse"></div>
                  )}
                </div>

                <h2 className="font-bold text-xl text-gray-800">
                  {item.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Organiser Request Section */}
        <div className="mb-12 p-8 bg-blue-50/50 rounded-3xl border border-blue-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-200">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Become the Trip Organiser?</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xl">
                Would you like to manage this trip? As an organiser, you can approve who joins, moderate the group chat, and coordinate with the travelers.
              </p>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-2xl shadow-sm border border-blue-50 transition-all hover:shadow-md">
              <input
                type="checkbox"
                id="requestOrganiser"
                checked={formData.requestOrganiser || false}
                onChange={(e) => handleInputChange('requestOrganiser', e.target.checked)}
                className="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <label htmlFor="requestOrganiser" className="font-bold text-gray-700 cursor-pointer select-none">
                Yes, I want to lead this trip
              </label>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-8 border-t border-gray-100">
          <div className="flex justify-end">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <Button
                onClick={GenerateTrip}
                className="relative px-10 py-7 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transform group-hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  Generate trip
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTrip