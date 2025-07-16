"use client";
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';
import Loading from '../../../Loading/Loading';

export default function ProfileHeader() {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [image, setImage] = useState("/ceoProfile.png"); // Default placeholder
    const [fullName, setFullName] = useState("Student Name");
    const [uploading, setUploading] = useState(false);

    // Fetch profile data
    const { data: profileResponse, isLoading } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            try {
                const response = await apiGet('/profile/me');
                return response;
            } catch (error) {
                throw error;
            }
        },
    });

    // Update profile picture mutation
    const uploadMutation = useMutation({
        mutationFn: async (formData) => {
            try {
                const response = await apiPost('/profile/upsert', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            } catch (apiError) {
                throw apiError;
            }
        },
        onSuccess: (response) => {
            toast.success('Profile picture updated successfully');
            // Invalidate and refetch profile data
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                error?.response?.message ||
                'Failed to upload profile picture';
            toast.error(errorMessage);
        },
    });

    // Initialize profile data when fetched
    useEffect(() => {
        if (profileResponse?.data) {
            const profileData = profileResponse.data;

            // Set full name
            if (profileData.fullName) {
                setFullName(profileData.fullName);
            }

            // Set profile picture
            if (profileData.filePath) {
                // Construct full image URL
                const baseURL = process.env.NEXT_PUBLIC_API_MAIN_URL || '';
                const imageUrl = `${baseURL}/${profileData.filePath}`;
                setImage(imageUrl);
            } else if (profileData.profilePicture) {
                // Fallback to profilePicture field if filePath is not available
                const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
                const imageUrl = `${baseURL}/uploads/profile/${profileData.profilePicture}`;
                setImage(imageUrl);
            }
        }
    }, [profileResponse]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        // Show preview immediately
        const imageUrl = URL.createObjectURL(file);
        setImage(imageUrl);
        setUploading(true);

        // Prepare FormData
        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            await uploadMutation.mutateAsync(formData);
        } catch (error) {
            // Revert to original image on error
            if (profileResponse?.data?.filePath) {
                const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
                const originalImageUrl = `${baseURL}/${profileResponse.data.filePath}`;
                setImage(originalImageUrl);
            } else {
                setImage("/ceoProfile.png");
            }
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (isLoading) {
        return <Loading />
    }

    return (
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative bg-gray-500 text-white flex items-center justify-center text-4xl font-bold">
                    {uploading ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Icon icon="svg-spinners:3-dots-fade" width="32" height="32" className="text-[#FFCA42]" />
                        </div>
                    ) : image && image !== "/ceoProfile.png" ? (
                        <Image
                            src={image}
                            alt="Profile"
                            fill
                            className="object-cover"
                            onError={() => {
                                // Fallback to default image if API image fails to load
                                setImage("/ceoProfile.png");
                            }}
                        />
                    ) : (
                        <span>{fullName ? fullName.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                </div>

                <button
                    onClick={handleImageClick}
                    disabled={uploading}
                    className="absolute bottom-1 right-1 bg-[#FFCA42] text-[#1B1B1B] p-2 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icon icon="solar:camera-minimalistic-bold" width="20" height="20" />
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    disabled={uploading}
                />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">{fullName}</h2>
            <p className="text-gray-500 text-sm">Update your photo and personal details</p>
        </div>
    );
}
