import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Compass, MapPin } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Hero() {
    const { user } = useAuth();
    return (
        <section className="relative overflow-hidden px-4 py-20 sm:py-32 lg:py-40">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-linear-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-linear-to-r from-emerald-400/15 to-cyan-400/15 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-linear-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-full blur-3xl"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"></div>
            </div>

            {/* Floating Icons */}
            <div className="absolute top-20 left-5 animate-float">
                <Compass className="w-8 h-8 text-blue-400" />
            </div>
            <div className="absolute top-40 right-10 animate-float" style={{ animationDelay: "1s" }}>
                <Sparkles className="w-10 h-10 text-purple-400" />
            </div>
            <div className="absolute bottom-40 left-20 animate-float" style={{ animationDelay: "2s" }}>
                <MapPin className="w-9 h-9 text-emerald-400" />
            </div>

            {/* Main Content */}
            <div className="relative max-w-6xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-blue-50 to-purple-50 border border-blue-100 mb-8 shadow-sm">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        AI-Powered Travel Planning
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="font-bold text-center">
                    <div className="relative inline-block">
                        <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl bg-linear-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                            Discover Your Next Adventure with AI
                        </span>
                        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-purple-500 rounded-full opacity-50"></div>
                    </div>

                    <span className="block mt-6 text-3xl sm:text-4xl lg:text-5xl text-gray-800 leading-relaxed">
                        Personalized Itineraries at Your Fingertips
                    </span>
                </h1>

                {/* Description */}
                <p className="max-w-2xl mx-auto mt-8 text-xl text-gray-600 leading-relaxed font-medium">
                    Your personal trip planner and travel curator, creating custom
                    itineraries tailored to your interests and budget.
                </p>

                {/* CTA Button */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link to="/create-trip">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                            <Button
                                size="lg"
                                className="relative px-10 py-7 text-lg font-semibold bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl transform group-hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5" />
                                    Get Started — It's Free
                                </div>
                            </Button>
                        </div>
                    </Link>

                    <Link to="#features">
                        <Button
                            variant="outline"
                            size="lg"
                            className="px-8 py-6 text-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Compass className="w-5 h-5" />
                                See How It Works
                            </div>
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                    {[
                        { value: "50K+", label: "Itineraries Created", color: "from-blue-500 to-cyan-500" },
                        { value: "100+", label: "Countries Covered", color: "from-purple-500 to-pink-500" },
                        { value: "98%", label: "User Satisfaction", color: "from-emerald-500 to-green-500" }
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className="relative group"
                        >
                            <div className={`absolute inset-0 bg-linear-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-10 transition duration-500`}></div>
                            <div className="relative bg-white/50 backdrop-blur-sm border border-gray-100 rounded-xl p-6 shadow-sm">
                                <div className={`text-4xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </div>
                                <div className="mt-2 text-gray-600 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Animated Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-linear-to-b from-blue-400 to-purple-400 rounded-full mt-2"></div>
                </div>
            </div>

            {/* Add custom animation for floating icons */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
}