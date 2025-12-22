import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import api from "../service/api";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, LogIn, Sparkles } from "lucide-react";

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });
    const [loginType, setLoginType] = useState("user"); // "user" | "organiser" | "admin"

    const { loading, error, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleClick = async (e) => {
        e.preventDefault();
        dispatch({ type: "LOGIN_START" });
        try {
            const res = await api.post("/auth/login", credentials);

            const userRole = res.data.user.role;

            // Strict Role Validation based on Toggle
            if (loginType === 'admin') {
                if (userRole !== 'admin') {
                    throw new Error("Access Denied: You are not an administrator.");
                }
                dispatch({ type: "LOGIN_SUCCESS", payload: res.data.user });
                // localStorage.setItem("token", res.data.token); // Removed token
                navigate('/admin');
            } else if (loginType === 'organiser') {
                if (userRole !== 'organiser' && userRole !== 'admin') {
                    throw new Error("Access Denied: You are not an organiser.");
                }
                dispatch({ type: "LOGIN_SUCCESS", payload: res.data.user });
                // localStorage.setItem("token", res.data.token); // Removed token
                navigate('/organiser');
            } else {
                // User Login Mode & Strict Check
                if (userRole === 'admin') {
                    throw new Error("Please use Admin Login for administrator accounts.");
                }
                dispatch({ type: "LOGIN_SUCCESS", payload: res.data.user });
                // localStorage.setItem("token", res.data.token); // Removed token
                navigate('/');
            }

        } catch (err) {
            dispatch({ type: "LOGIN_FAILURE", payload: err.response?.data?.message || err.message });
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-12">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-lg relative">
                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50">

                    {/* Role Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                        <button
                            onClick={() => setLoginType("user")}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${loginType === "user"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            User
                        </button>
                        <button
                            onClick={() => setLoginType("organiser")}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${loginType === "organiser"
                                ? "bg-white text-emerald-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Organiser
                        </button>
                        <button
                            onClick={() => setLoginType("admin")}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${loginType === "admin"
                                ? "bg-white text-purple-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Admin
                        </button>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform bg-gradient-to-br 
                            ${loginType === 'admin' ? 'from-purple-600 to-pink-600' :
                                loginType === 'organiser' ? 'from-emerald-500 to-teal-600' :
                                    'from-blue-500 to-cyan-500'
                            }`}>
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className={`text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r 
                        ${loginType === 'admin' ? 'from-purple-600 to-pink-600' :
                            loginType === 'organiser' ? 'from-emerald-600 to-teal-600' :
                                'from-blue-600 to-cyan-600'
                        }`}>
                        {loginType === 'admin' ? 'Admin Portal' :
                            loginType === 'organiser' ? 'Organiser Portal' :
                                'User Login'}
                    </h2>
                    <p className="text-center text-gray-500 mb-8 text-sm">Sign in to continue your journey</p>

                    {/* Form */}
                    <div className="space-y-5">
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
                                placeholder="••••••••"
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
                            className={`w-full text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg 
                                ${loginType === 'admin' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/30' :
                                    loginType === 'organiser' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30' :
                                        'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-blue-500/30'
                                }`}
                        >
                            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        <span className="text-gray-400 text-sm">or</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-gray-600 text-sm">
                            Don't have an account?{" "}
                            <Link
                                to={loginType === 'admin' ? "/register?role=admin" : loginType === 'organiser' ? "/register?role=organiser" : "/register"}
                                className={`font-semibold bg-clip-text text-transparent transition-all ${loginType === 'admin'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                    : loginType === 'organiser' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' :
                                        'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                                    }`}
                            >
                                {loginType === 'admin' ? 'Create Admin Account' : loginType === 'organiser' ? 'Create Organiser Account' : 'Create User Account'}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Bottom text */}
                <p className="text-center mt-6 text-gray-500 text-xs flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Secure login powered by Travel Around
                </p>
            </div>
        </div>
    );
};

export default Login;
