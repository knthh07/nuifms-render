import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Avatar, IconButton, TextField, Button, CircularProgress, Skeleton, Modal,  Typography } from "@mui/material";
import { PhotoCamera, Lock } from "@mui/icons-material";
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { profile } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({
        firstName: "Loading...",
        lastName: "Loading...",
        dept: "Loading...",
        idNum: "Loading...",
        email: "Loading...",
        profilePicture: ""
    });
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [loading, setLoading] = useState(true);

    // Change Password State
    const [modalOpen, setModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/api/profile', { withCredentials: true });
                if (response.status === 200) {
                    setProfileData(response.data);
                    setFormData(response.data);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [profile]);

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            if (profilePicture) {
                await handleUpload();
            }
            await axios.put("/api/updateProfile", formData, { withCredentials: true });
            setProfileData(formData);
            setEditMode(false);
            setProfilePicturePreview(null);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        setProfilePicturePreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!profilePicture) {
            console.error("No profile picture selected.");
            return;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('profilePicture', profilePicture);

        try {
            const response = await axios.post(
                '/api/uploadProfilePictureUser',
                uploadFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            if (response.status === 200) {
                setProfileData(prevData => ({
                    ...prevData,
                    profilePicture: response.data.profilePicture
                }));
                setProfilePicture(null);
                setProfilePicturePreview(null);
            } else {
                console.error("Unexpected response status:", response.status);
            }
        } catch (error) {
            console.error("Error uploading profile picture:", error);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setProfilePicture(null);
        setProfilePicturePreview(null);
    };

    // Handle change password
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        try {
            const response = await axios.put('/api/changePassword', {
                currentPassword,
                newPassword,
            });

            // Check if there is an error in the response
            if (response.data.error) {
                toast.error(response.data.error);
            } else {
                toast.success(response.data.message);
                // Clear the password fields after a successful change
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setModalOpen(false); // Close the modal
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div className="flex">
            <div className="flex flex-col w-full">
                <div className="w-[77%] ml-[21.5%]">
                    <div className="bg-[#403993] text-white rounded-lg shadow-lg p-6 mb-8 mt-4">
                        <div className="flex items-center">
                            <div className="relative">
                                {loading ? (
                                    <Skeleton variant="circular" width={100} height={100} />
                                ) : (
                                    <Avatar
                                        src={profilePicturePreview || profileData.profilePicture || ""}
                                        alt="Profile"
                                        sx={{ width: 100, height: 100 }}
                                    />
                                )}
                                {editMode && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="icon-button-file"
                                            type="file"
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="icon-button-file">
                                            <IconButton
                                                aria-label="upload picture"
                                                component="span"
                                                sx={{ color: 'white' }}
                                            >
                                                <PhotoCamera />
                                            </IconButton>
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="ml-4 flex flex-col justify-center">
                                <h2 className="text-xl font-semibold">{loading ? <Skeleton width={120} /> : `${profileData.firstName} ${profileData.lastName}`}</h2>
                                <p className="text-gray-300">{loading ? <Skeleton width={80} /> : profileData.position}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-center mb-8 text-[#4a90e2]">Profile</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                label="First Name"
                                name="firstName"
                                value={formData.firstName || ''}
                                onChange={handleChange}
                                disabled
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName || ''}
                                onChange={handleChange}
                                disabled
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Department"
                                name="dept"
                                value={formData.dept || ''}
                                onChange={handleChange}
                                disabled={!editMode || loading}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="ID Number"
                                name="idNum"
                                value={formData.idNum || ''}
                                disabled
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Email"
                                name="email"
                                value={formData.email || ''}
                                disabled
                                fullWidth
                                size="small"
                            />
                            <div className="flex items-center">
                                <Lock
                                    sx={{ color: editMode ? 'black' : 'gray', cursor: editMode ? 'pointer' : 'default' }}
                                    onClick={() => editMode && setModalOpen(true)} // Open modal on lock icon click
                                />
                                <Typography
                                    variant="body2" // Adjust the variant as needed
                                    sx={{ marginLeft: 1, cursor: editMode ? 'pointer' : 'default' }} // Add margin for spacing
                                    onClick={() => editMode && setModalOpen(true)} // Make label clickable to open modal
                                >
                                    Change Password
                                </Typography>
                            </div>

                        </div>

                        <div className="text-center mt-8">
                            {loading ? (
                                <CircularProgress />
                            ) : editMode ? (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSave}
                                        sx={{ mr: 2 }}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleEditClick}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <div className="flex items-center justify-center h-full">
                    <div className="bg-white rounded-lg p-4 shadow-lg w-96">
                        <h2 id="modal-title" className="text-center mb-4 text-[#4a90e2]">Change Password</h2>
                        <TextField
                            label="Current Password"
                            type="password"
                            fullWidth
                            size="small"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <TextField
                            label="New Password"
                            type="password"
                            fullWidth
                            size="small"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            fullWidth
                            size="small"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <div className="text-center mt-4">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleChangePassword}
                            >
                                Change Password
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => setModalOpen(false)}
                                sx={{ ml: 2 }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Profile;

