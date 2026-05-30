import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserService from '../services/UserService';
import Button from '../components/Button';
import InputField from '../components/InputField';
import ProfileImage from '../components/ProfileImage';

const Settings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState('');

    // State for the inputs
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });

    const [originalData, setOriginalData] = useState(null);

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            const currentId = user?.userId || user?.id || user?._id;

            if (!currentId) {
                setMessage({ type: 'error', text: 'System Error: User ID not found. Please log out and log in again.' });
                return;
            }

            try {
                const response = await UserService.getById(currentId);

                let userData = response.data?.data;

                // Safety check just in case the server structure changes
                if (Array.isArray(userData)) {
                    userData = userData[0];
                } else if (userData?.user) {
                    userData = userData.user;
                }

                console.log("Successfully extracted data from server:", userData);

                const fetchedData = {
                    firstName: userData?.firstName || '',
                    lastName: userData?.lastName || '',
                    phoneNumber: userData?.phoneNumber || ''
                };

                setFormData(fetchedData);
                setOriginalData(fetchedData);

                if (userData?.picturePath) {
                    setAvatarUrl(userData.picturePath);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                const errorDetails = err.response?.data?.message || err.message || 'Unknown error';
                setMessage({ type: 'error', text: `Failed to load data: ${errorDetails}` });
            }
        };

        // Only attempt to fetch if there's a user object in context
        if (user) {
            fetchUserData();
        } else {
            setMessage({ type: 'error', text: 'Not logged in. Please navigate to the login page.' });
        }
    }, [user]);

    const handleChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend Validation: Prevent empty or single-character names
        if (formData.firstName.trim().length < 2) {
            setMessage({ type: 'error', text: 'First Name must be at least 2 characters long.' });
            return;
        }
        if (formData.lastName.trim().length < 2) {
            setMessage({ type: 'error', text: 'Last Name must be at least 2 characters long.' });
            return;
        }

        // Frontend Validation: Strictly 10 digits starting with 05 for phone number
        if (formData.phoneNumber) {
            const phoneRegex = /^05\d{8}$/;
            if (!phoneRegex.test(formData.phoneNumber)) {
                setMessage({ type: 'error', text: 'Invalid phone number. Must be exactly 10 digits starting with 05.' });
                return;
            }
        }

        // Track which fields were actually changed
        const changedFields = [];
        if (originalData) {
            if (formData.firstName !== originalData.firstName) changedFields.push('First Name');
            if (formData.lastName !== originalData.lastName) changedFields.push('Last Name');
            if (formData.phoneNumber !== originalData.phoneNumber) changedFields.push('Phone Number');
        }

        // Prevent unnecessary server requests if data hasn't changed at all
        if (changedFields.length === 0) {
            setMessage({ type: 'info', text: 'No changes detected. Update cancelled.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const currentId = user?.userId || user?.id || user?._id;
            await UserService.updateSettings(currentId, formData);

            // Build a dynamic success message showing exactly what was updated
            const successText = `Profile updated successfully! (Changes: ${changedFields.join(', ')})`;
            setMessage({ type: 'success', text: successText });

            // Update the original data state to the newly saved data
            setOriginalData({ ...formData });
        } catch (err) {
            console.error("Error updating profile:", err);
            const errorMsg = err.data?.error?.message || err.message || 'Failed to update profile. Please try again.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const getMessageStyle = (type) => {
        if (type === 'success') return { color: '#10B981', bg: '#D1FAE5' };
        if (type === 'error') return { color: '#EF4444', bg: '#FEE2E2' };
        if (type === 'info') return { color: '#3B82F6', bg: '#DBEAFE' };
        return { color: 'black', bg: 'transparent' };
    };

    return (
        <div className="create-event-container">
            <div className="create-event-card">
                <Button variant="text" onClick={() => navigate(-1)} className="back-btn">
                    &larr; Back
                </Button>

                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Profile Settings</h2>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                    <ProfileImage
                        src={avatarUrl && !avatarUrl.startsWith('..') ? avatarUrl : null}
                        fallbackText={formData.firstName || '?'}
                        size="120px"
                    />
                </div>

                {message && (
                    <div style={{
                        color: getMessageStyle(message.type).color,
                        backgroundColor: getMessageStyle(message.type).bg,
                        padding: '10px', borderRadius: '6px', textAlign: 'center',
                        marginBottom: '20px', fontWeight: '500'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="event-form">
                    <InputField
                        label="First Name"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                    />

                    <InputField
                        label="Last Name"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                    />

                    <InputField
                        label="Phone Number"
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    />

                    <Button variant="primary" type="submit" disabled={loading} className="submit-btn" style={{ marginTop: '30px', width: '100%' }}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Settings;