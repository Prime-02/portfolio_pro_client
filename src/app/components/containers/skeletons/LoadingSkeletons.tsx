import React from 'react';

const LoadingSkeletons = ({ count = 6, isListView = false, className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white rounded-xl shadow-md overflow-hidden animate-pulse ${
            isListView ? 'flex flex-row h-32' : 'flex flex-col'
          } ${className}`}
        >
          {/* Image Skeleton */}
          <div className={`bg-gray-200 ${
            isListView ? 'w-48 flex-shrink-0' : 'aspect-video'
          }`} />
          
          {/* Content Skeleton */}
          <div className="p-4 flex-1">
            {/* Title */}
            <div className="h-4 bg-gray-200 rounded mb-2" />
            
            {/* Subtitle */}
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
            
            {/* Author Info */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-20 mb-1" />
                <div className="h-2 bg-gray-200 rounded w-16" />
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex justify-between">
              <div className="h-2 bg-gray-200 rounded w-16" />
              <div className="h-2 bg-gray-200 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingSkeletons;