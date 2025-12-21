import React from 'react';
import { Search } from 'lucide-react';

const TripFilters = ({ filters, setFilters }) => {
    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    name="query"
                    placeholder="Search destinations..."
                    value={filters.query}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            <select
                name="budget"
                value={filters.budget}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
                <option value="">All Budgets</option>
                <option value="Cheap">Cheap</option>
                <option value="Moderate">Moderate</option>
                <option value="Luxury">Luxury</option>
            </select>

            <div className="flex items-center gap-2">
                <input
                    type="number"
                    name="minDays"
                    placeholder="Min Days"
                    value={filters.minDays}
                    onChange={handleChange}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input
                    type="number"
                    name="maxDays"
                    placeholder="Max Days"
                    value={filters.maxDays}
                    onChange={handleChange}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
            </div>
        </div>
    );
};

export default TripFilters;
