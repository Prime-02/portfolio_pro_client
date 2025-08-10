import React from 'react';

interface ErrorStateProps {
  error: any;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, className = '' }) => (
  <div className={`flex justify-center items-center py-8 text-red-500 ${className}`}>
    <div className="text-center">
      <div className="text-lg font-semibold mb-2">Error loading data</div>
      <div className="text-sm opacity-80">{error?.message || 'Something went wrong'}</div>
    </div>
  </div>
);