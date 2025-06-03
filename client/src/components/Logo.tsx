
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
            <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Main circle */}
        <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" stroke="#f59e0b" strokeWidth="2"/>
        
        {/* Dollar sign */}
        <path
          d="M50 15 L50 25 M50 75 L50 85 M42 30 Q42 25 47 25 L53 25 Q58 25 58 30 Q58 35 53 35 L47 35 M47 35 L53 35 Q58 35 58 40 Q58 45 53 45 L47 45 Q42 45 42 50 Q42 55 47 55 L53 55 Q58 55 58 60 Q58 65 53 65 L47 65 Q42 65 42 70"
          stroke="url(#textGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Number 25 */}
        <text
          x="50"
          y="78"
          textAnchor="middle"
          fill="url(#textGradient)"
          fontSize="12"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          25
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
