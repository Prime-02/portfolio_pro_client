import React from 'react';

interface EmptyStateProps {
  message?: string;
  description?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = "No items found",
  description = "There are no items to display",
  className = '' 
}) => (
  <div className={`flex justify-center items-center py-12 ${className}`}>
    <div className="text-center">
      <div className="text-lg font-medium mb-2">{message}</div>
      <div className="text-sm opacity-80">{description}</div>
    </div>
  </div>
);
