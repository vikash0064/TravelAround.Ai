import React from 'react';

const About = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[400px] flex items-center justify-center bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-blue-900 to-purple-900 opacity-90"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-5xl font-bold text-white mb-6">About Travel Around</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        We are revolutionizing the way you explore the world. AI-driven itineraries, seamless group planning, and unforgettable memories.
                    </p>
                </div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            </div>

            {/* Mission Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            At Travel Around, we believe that travel should be effortless and personalized. Our mission is to empower travelers with cutting-edge AI technology that crafts the perfect itinerary in seconds, distinctively tailored to your preferences, budget, and companionship.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Whether you're a solo backpacker, a couple seeking romance, or a family on a holiday, we bring your dream trip to life.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-linear-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-30"></div>
                        <img
                            src="/about-hero.png"
                            alt="Team at work"
                            className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gray-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-8 bg-white rounded-2xl shadow-sm">
                            <div className="text-4xl font-bold text-blue-600 mb-2">50k+</div>
                            <div className="text-gray-600">Trips Generated</div>
                        </div>
                        <div className="p-8 bg-white rounded-2xl shadow-sm">
                            <div className="text-4xl font-bold text-purple-600 mb-2">100+</div>
                            <div className="text-gray-600">Destinations Covered</div>
                        </div>
                        <div className="p-8 bg-white rounded-2xl shadow-sm">
                            <div className="text-4xl font-bold text-pink-600 mb-2">4.9/5</div>
                            <div className="text-gray-600">User Rating</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
