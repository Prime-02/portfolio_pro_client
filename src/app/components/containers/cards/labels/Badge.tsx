// components/Badge.tsx
import React from 'react';

interface BadgeProps {
  text: string;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
}

export const Badge = ({ text, color = 'primary' }: BadgeProps) => {
  const colorClasses = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    danger: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}
    >
      {text}
    </span>
  );
};