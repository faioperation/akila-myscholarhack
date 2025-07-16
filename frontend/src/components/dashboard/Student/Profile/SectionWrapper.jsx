"use client";
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import PrimaryBtn from "@/components/landing/PrimaryBtn";

export default function SectionWrapper({ title, description, children, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Call the save handler (which handles API call)
            if (onSave) {
                await onSave();
            }
            // Close edit mode after successful save
            setIsEditing(false);
        } catch (error) {
            // Error handling is done in the mutation, just reset saving state
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
                </div>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-sm font-semibold text-[#FFCA42] hover:text-[#eeb526] transition-colors"
                    >
                        <Icon icon="solar:pen-new-square-linear" width="18" height="18" />
                        Edit
                    </button>
                )}
            </div>

            <div className={isEditing ? "" : "opacity-90 transition-opacity"}>
                {/* Support both patterns: Direct children or Render Prop */}
                {typeof children === 'function' ? children({ isEditing }) : children}
            </div>

            {isEditing && (
                <div className="flex justify-end pt-6 animate-in fade-in duration-300">
                    <PrimaryBtn
                        title={isSaving ? "Saving..." : "Save Changes"}
                        hendleClick={handleSave}
                        style="rounded-xl px-8"
                    />
                </div>
            )}
        </div>
    );
}
