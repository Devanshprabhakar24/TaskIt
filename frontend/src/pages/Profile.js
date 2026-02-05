import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateProfile, updatePassword } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });
    const [profileLoading, setProfileLoading] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        await updateProfile(profileData);
        setProfileLoading(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            return;
        }

        setPasswordLoading(true);
        const result = await updatePassword(
            passwordData.currentPassword,
            passwordData.newPassword,
            passwordData.confirmNewPassword
        );

        if (result.success) {
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
        }
        setPasswordLoading(false);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Profile Settings</h1>
                <p className="page-subtitle">Manage your account settings</p>
            </div>

            <div className="card">
                <div className="card-header" style={{ gap: '1rem' }}>
                    <div className="filters">
                        <button
                            className={`filter-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile Info
                        </button>
                        <button
                            className={`filter-btn ${activeTab === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveTab('password')}
                        >
                            Change Password
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {activeTab === 'profile' ? (
                        <form onSubmit={handleProfileSubmit} style={{ maxWidth: '400px' }}>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="form-control"
                                    value={profileData.name}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-control"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user?.role || ''}
                                    disabled
                                    style={{ backgroundColor: 'var(--gray-100)', textTransform: 'capitalize' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                                {profileLoading ? 'Saving...' : 'Update Profile'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '400px' }}>
                            <div className="form-group">
                                <label htmlFor="currentPassword">Current Password</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    className="form-control"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    className="form-control"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={6}
                                />
                                <small style={{ color: 'var(--gray-500)' }}>
                                    Must be at least 6 characters with at least one number
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    className="form-control"
                                    value={passwordData.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                                {passwordData.newPassword && passwordData.confirmNewPassword &&
                                    passwordData.newPassword !== passwordData.confirmNewPassword && (
                                        <p className="error-text">Passwords do not match</p>
                                    )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={passwordLoading || passwordData.newPassword !== passwordData.confirmNewPassword}
                            >
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-header">
                    <h3 className="card-title">Account Information</h3>
                </div>
                <div className="card-body">
                    <p><strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>User ID:</strong> {user?.id}</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
