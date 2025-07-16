"use client";
import React, { useState } from 'react';
import ProfileTabs from '@/components/dashboard/Student/Profile/ProfileTabs';
import ProfileHeader from '@/components/dashboard/Student/Profile/ProfileHeader';
// Import all section components
import BasicInfo from '@/components/dashboard/Student/Profile/Sections/BasicInfo';
import AcademicInterests from '@/components/dashboard/Student/Profile/Sections/AcademicInterests';
import ExtraCurricular from '@/components/dashboard/Student/Profile/Sections/ExtraCurricular';
import CommunityService from '@/components/dashboard/Student/Profile/Sections/CommunityService';
import FamilyBackground from '@/components/dashboard/Student/Profile/Sections/FamilyBackground';
import UniqueExperiences from '@/components/dashboard/Student/Profile/Sections/UniqueExperiences';
import DiversityIdentity from '@/components/dashboard/Student/Profile/Sections/DiversityIdentity';
import ScholarshipInfo from '@/components/dashboard/Student/Profile/Sections/ScholarshipInfo';
import AnythingElse from '@/components/dashboard/Student/Profile/Sections/AnythingElse';
import EssayQuestions from '@/components/dashboard/Student/Profile/Sections/EssayQuestions';

const TABS = [
    { id: 'basic', label: 'Basic Information', component: BasicInfo },
    { id: 'academic', label: 'Academic Interests', component: AcademicInterests },
    { id: 'extracurricular', label: 'Extra Curricular Activities', component: ExtraCurricular },
    { id: 'community', label: 'Community Service (Volunteer Work)', component: CommunityService },
    { id: 'family', label: 'Family Background', component: FamilyBackground },
    { id: 'experiences', label: 'Unique Experiences', component: UniqueExperiences },
    { id: 'identity', label: 'Diversity and Identity', component: DiversityIdentity },
    { id: 'scholarship', label: 'Scholarship Specific Info', component: ScholarshipInfo },
    { id: 'essay', label: 'Essay Story Questions', component: EssayQuestions },
    { id: 'misc', label: 'Anything Else', component: AnythingElse },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('basic');

    const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || BasicInfo;

    return (
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            <div className="mb-0">
                {/* <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Profile</h1>
                <p className="text-gray-500 mt-2">Complete your profile to get better scholarship matches and AI-generated essays.</p> */}
                <ProfileHeader />
            </div>

            <ProfileTabs
                currentTab={activeTab}
                onTabChange={setActiveTab}
                tabs={TABS}
            />

            <div className="mt-4">
                <ActiveComponent />
            </div>
        </div>
    );
}
