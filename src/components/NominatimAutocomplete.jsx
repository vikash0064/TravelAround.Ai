import { useState, useEffect, useRef } from 'react'
import { Loader2, MapPin } from 'lucide-react'

function NominatimAutocomplete({ onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSelected, setIsSelected] = useState(false) // Track if current query is a selection

  // Debounce logic
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query && query.length > 2 && !isSelected) {
        searchPlaces(query)
      } else if (!query) {
        setResults([]); // Clear results if query is empty
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [query, isSelected])

  const searchPlaces = async (value) => {
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          value
        )}&limit=5`,
        {
          headers: {
            'User-Agent': 'TravelAround/1.0'
          }
        }
      )

      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error("Error fetching places:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    onChange(value) // Correctly pass value to parent so validation passes
    setIsSelected(false) // User is typing, so it's not a selection anymore
  }

  const handleSelect = (item) => {
    onChange(item)
    setQuery(item.display_name)
    setResults([])
    setIsSelected(true) // Mark as selected to prevent auto-search
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search destination..."
          className="w-full p-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          ) : (
            <MapPin className="w-5 h-5" />
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="absolute z-10 bg-white border border-gray-100 w-full mt-2 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {results.map((item) => (
            <div
              key={item.place_id}
              className="p-3 hover:bg-blue-50 cursor-pointer flex items-start gap-3 transition-colors border-b border-gray-50 last:border-0"
              onClick={() => handleSelect(item)}
            >
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div className="text-sm text-gray-700 leading-snug">
                {item.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NominatimAutocomplete
