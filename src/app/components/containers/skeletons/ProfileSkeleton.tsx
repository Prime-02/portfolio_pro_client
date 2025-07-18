import React from 'react';

export const ProfileSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      {/* Header/Banner Area */}
      <div className="relative h-48 bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer"></div>
        
        {/* Profile Picture */}
        <div className="absolute bottom-4 left-6">
          <div className="w-20 h-20 bg-gray-600 rounded-full animate-pulse border-4 border-gray-800">
            <div className="w-full h-full bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full animate-shimmer"></div>
          </div>
        </div>

        {/* Camera Icon Placeholder */}
        <div className="absolute top-4 right-4 w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-600 rounded-md w-1/3 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-500 to-transparent animate-shimmer"></div>
          </div>
          
          {/* Job Title */}
          <div className="h-5 bg-gray-700 rounded w-1/4 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer"></div>
          </div>
          
          {/* Username */}
          <div className="h-4 bg-gray-700 rounded w-1/6 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Bio/Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-full animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-gray-700 rounded w-4/5 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Link */}
        <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer"></div>
        </div>

        {/* Location */}
        <div className="h-4 bg-gray-700 rounded w-1/3 animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <div className="h-10 bg-blue-600 rounded-md w-24 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-10 bg-gray-600 rounded-md w-28 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-500 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: trangrayX(-100%); }
          100% { transform: trangrayX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

// Demo component showing multiple skeletons
const SkeletonDemo = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          Profile Card Skeleton Loading States
        </h1>
        
        {/* Single skeleton */}
        <ProfileSkeleton />
        
        {/* Grid of skeletons for different layouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <ProfileSkeleton />
          <ProfileSkeleton />
        </div>
        
        {/* Compact version */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Compact Version</h2>
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-600 rounded-full animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-500 to-transparent animate-shimmer"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-600 rounded w-1/2 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-500 to-transparent animate-shimmer"></div>
                </div>
                <div className="h-3 bg-gray-700 rounded w-1/3 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonDemo;