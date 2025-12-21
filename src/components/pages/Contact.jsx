import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="container mx-auto px-4">

                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
                    <p className="text-gray-600 text-lg">Have a question or just want to say hi? We'd love to hear from you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow">
                            <div className="p-4 bg-blue-100 rounded-xl text-blue-600">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
                                <p className="text-gray-600 mb-1">Our friendly team is here to help.</p>
                                <a href="mailto:support@travelaround.com" className="text-blue-600 font-semibold hover:underline">support@travelaround.com</a>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow">
                            <div className="p-4 bg-purple-100 rounded-xl text-purple-600">
                                <Phone className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
                                <p className="text-gray-600 mb-1">Mon-Fri from 8am to 5pm.</p>
                                <a href="tel:+15550000000" className="text-purple-600 font-semibold hover:underline">+1 (555) 000-0000</a>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow">
                            <div className="p-4 bg-pink-100 rounded-xl text-pink-600">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Office</h3>
                                <p className="text-gray-600 mb-1">Come say hello at our office HQ.</p>
                                <p className="text-gray-900 font-medium">123 Travel Lane, Adventure City, AC 90210</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white p-10 rounded-3xl shadow-lg">
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all" placeholder="Your name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all" placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all" placeholder="How can we help?"></textarea>
                            </div>
                            <button className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
                                Send Message <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
