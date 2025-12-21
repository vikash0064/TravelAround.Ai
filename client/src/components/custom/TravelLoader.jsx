import React from 'react';
import { Plane, MapPin, Loader2 } from 'lucide-react';

const TravelLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md">
            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Central Map Pin */}
                <div className="absolute z-10 animate-bounce">
                    <MapPin className="w-16 h-16 text-rose-500 fill-rose-100" />
                </div>

                {/* Orbiting Ring 1 */}
                <div className="absolute inset-0 border-4 border-dashed border-blue-200 rounded-full animate-[spin_8s_linear_infinite]" />

                {/* Orbiting Ring 2 */}
                <div className="absolute inset-4 border-4 border-dashed border-purple-200 rounded-full animate-[spin_6s_linear_infinite_reverse]" />

                {/* Orbiting Plane */}
                <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform -rotate-45">
                        <Plane className="w-10 h-10 text-blue-600 fill-blue-100" />
                    </div>
                </div>
            </div>

            {/* Text Content */}
            <div className="mt-12 text-center space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 bg-clip-text text-transparent animate-pulse">
                    Crafting Your Perfect Trip
                </h2>
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <p className="text-lg">Analyzing preferences...</p>
                    <p className="text-sm opacity-75">Curating hotels, itineraries, and hidden gems</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8 w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 animate-[loading_2s_ease-in-out_infinite]" />
            </div>

            <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default TravelLoader;
