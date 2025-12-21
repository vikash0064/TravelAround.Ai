import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../service/api";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Loader2, UserPlus, Sparkles, CheckCircle2 } from "lucide-react";

const Register = () => {
    const [credentials, setCredentials] = useState({
        username: "",
        email: "",
        password: "",
    });

    // Get role from URL if present
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get("role") === "admin" ? "admin" : "user";
    const [role, setRole] = useState(initialRole);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    // Update role if URL changes
    useEffect(() => {
        const urlRole = searchParams.get("role");
        if (urlRole === "admin") setRole("admin");
        else if (urlRole === "user") setRole("user");
    }, [searchParams]);

    const handleChange = (e) => {
        setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleClick = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await api.post("/auth/register", {
                ...credentials,
                role: role // Send selected role
            });
            setSuccess(`Registration successful! Please wait for admin approval for your ${role} account.`);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-12">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative">
                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50">

                    {/* Role Toggle */}
                    {!success && (
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                            <button
                                onClick={() => setRole("user")}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${role === "user"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                User
                            </button>
                            <button
                                onClick={() => setRole("organiser")}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${role === "organiser"
                                    ? "bg-white text-emerald-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Organiser
                            </button>
                            <button
                                onClick={() => setRole("admin")}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${role === "admin"
                                    ? "bg-white text-purple-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Admin
                            </button>
                        </div>
                    )}

                    {success ? (
                        // Success State
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Registration Successful!
                            </h2>
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl mb-6">
                                <p className="text-sm">{success}</p>
                            </div>
                            <Link
                                to="/login"
                                className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg"
                            >
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        // Registration Form
                        <>
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform bg-gradient-to-br ${role === 'admin' ? 'from-purple-600 to-pink-600' : 'from-blue-500 to-purple-600'
                                    }`}>
                                    <UserPlus className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className={`text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r ${role === 'admin' ? 'from-purple-600 to-pink-600' : 'from-blue-600 to-purple-600'
                                }`}>
                                {role === 'admin' ? 'Create Admin Account' : 'Create User Account'}
                            </h2>
                            <p className="text-center text-gray-500 mb-8 text-sm">Join us and start planning your perfect trip</p>

                            {/* Form */}
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="Choose a username"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="Create a strong password"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleClick}
                                    disabled={loading}
                                    className={`w-full text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg mt-2 ${role === 'admin'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/30'
                                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/30'
                                        }`}
                                >
                                    {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                                    {loading ? "Creating Account..." : "Create Account"}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                <span className="text-gray-400 text-sm">or</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            </div>

                            {/* Login Link */}
                            <div className="text-center">
                                <p className="text-gray-600 text-sm">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                                    >
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Bottom text */}
                <p className="text-center mt-6 text-gray-500 text-xs flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Secure registration powered by Travel Around
                </p>
            </div>
        </div>
    );
};

export default Register;
