import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#e0f2fe', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Main circle */}
        <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" stroke="#06b6d4" strokeWidth="2"/>

        {/* PG Letters */}
        <text
          x="35"
          y="58"
          textAnchor="middle"
          fill="url(#textGradient)"
          fontSize="20"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          P
        </text>
        <text
          x="65"
          y="58"
          textAnchor="middle"
          fill="url(#textGradient)"
          fontSize="20"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          G
        </text>

        {/* Prosperity Groups text */}
        <text
          x="50"
          y="78"
          textAnchor="middle"
          fill="url(#textGradient)"
          fontSize="8"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          Groups
        </text>

        {/* Decorative stars */}
        <g fill="url(#textGradient)">
          <polygon points="20,20 22,26 28,26 23,30 25,36 20,32 15,36 17,30 12,26 18,26" />
          <polygon points="80,20 82,26 88,26 83,30 85,36 80,32 75,36 77,30 72,26 78,26" />
        </g>
      </svg>
    </div>
  );
}