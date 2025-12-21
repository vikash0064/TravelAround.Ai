import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../service/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/toast';
import { User, Mail, Phone, Lock, Save, Camera } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth(); // Assuming setUser updates context state
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // details, security

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        phone: '',
        avatar: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                phone: user.phone || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', formData);
            // Update local user state if context exposes a setter, otherwise we might need to reload or re-fetch
            // Assuming context handles token-based auth, updating the user object in context strictly depends on implementation.
            // For now, let's assume we need to manually update storage or just show success.
            // Ideally AuthContext should have a method to update user data.

            // Updating local storage if that's where user data persists somewhat (though usually it's token based)
            // Ideally we re-fetch user profile in AuthContext.

            toast({ title: "Success", description: "Profile updated successfully!", type: "success" });
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to update profile", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({ title: "Error", description: "New passwords do not match", type: "error" });
            return;
        }
        setLoading(true);
        try {
            await api.put('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast({ title: "Success", description: "Password changed successfully!", type: "success" });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to change password", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="md:flex">
                        {/* Sidebar */}
                        <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-100">
                            <div className="text-center mb-8">
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto bg-gray-200 flex items-center justify-center">
                                        {formData.avatar ? (
                                            <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-16 h-16 text-gray-400" />
                                        )}
                                    </div>
                                    <button className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-sm">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-gray-900">{user?.username}</h2>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>

                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'details'
                                            ? 'bg-blue-50 text-blue-600 font-medium'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <User className="w-5 h-5" />
                                    Personal Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security'
                                            ? 'bg-blue-50 text-blue-600 font-medium'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Lock className="w-5 h-5" />
                                    Security
                                </button>
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="md:w-2/3 p-8">
                            {activeTab === 'details' ? (
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Username</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <Input
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <Input
                                                    value={formData.email}
                                                    disabled
                                                    className="pl-10 bg-gray-50"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Phone</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="pl-10"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Avatar URL</label>
                                            <div className="relative">
                                                <Camera className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <Input
                                                    value={formData.avatar}
                                                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                                    className="pl-10"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Bio</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h3>

                                    <div className="space-y-4 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Current Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <Input
                                                    type="password"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <Input
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <Input
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                            {loading ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
