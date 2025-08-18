import React from 'react';

export const PostsSVG = () => (
  <svg className="w-8 h-5" viewBox="0 0 40 20" fill="none">
    <path d="M2 8h6v8H2V8zM12 4h6v12h-6V4zM22 6h6v10h-6V6zM32 2h6v14h-6V2z" 
          fill="currentColor" className="text-blue-200" />
    <circle cx="5" cy="6" r="1" fill="currentColor" className="text-blue-500" />
    <circle cx="15" cy="2" r="1" fill="currentColor" className="text-blue-500" />
    <circle cx="25" cy="4" r="1" fill="currentColor" className="text-blue-500" />
    <circle cx="35" cy="1" r="1" fill="currentColor" className="text-blue-500" />
  </svg>
);

export const ReachSVG = () => (
  <svg className="w-8 h-5" viewBox="0 0 40 20" fill="none">
    <circle cx="20" cy="10" r="8" stroke="currentColor" strokeWidth="1" 
            fill="none" className="text-green-300" />
    <circle cx="20" cy="10" r="5" stroke="currentColor" strokeWidth="1" 
            fill="none" className="text-green-400" />
    <circle cx="20" cy="10" r="2" fill="currentColor" className="text-green-500" />
    <path d="M12 10L8 6M12 10L8 14M28 10L32 6M28 10L32 14" 
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" 
          className="text-green-400" />
  </svg>
);

export const EngagementSVG = () => (
  <svg className="w-8 h-5" viewBox="0 0 40 20" fill="none">
    <path d="M20 3L22 8h5l-4 3 1.5 5L20 14l-4.5 2L17 11l-4-3h5l2-5z" 
          fill="currentColor" className="text-pink-300" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" className="text-pink-400" />
    <circle cx="32" cy="12" r="1.5" fill="currentColor" className="text-pink-400" />
    <circle cx="6" cy="14" r="1" fill="currentColor" className="text-pink-300" />
    <circle cx="34" cy="6" r="1" fill="currentColor" className="text-pink-300" />
  </svg>
);

export const AccountsSVG = () => (
  <svg className="w-8 h-5" viewBox="0 0 40 20" fill="none">
    <circle cx="10" cy="10" r="3" fill="currentColor" className="text-purple-400" />
    <circle cx="20" cy="10" r="3" fill="currentColor" className="text-purple-500" />
    <circle cx="30" cy="10" r="3" fill="currentColor" className="text-purple-400" />
    <path d="M13 10c0 3 3 5 7 5s7-2 7-5M3 10c0 3 3 5 7 5M30 15c4 0 7-2 7-5" 
          stroke="currentColor" strokeWidth="1" fill="none" className="text-purple-300" />
  </svg>
);

// Empty state SVG for recent posts
export const EmptyPostsSVG = () => (
  <svg
    viewBox="0 0 400 300"
    className="w-32 h-24 mx-auto opacity-60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background */}
    <circle cx="200" cy="150" r="80" fill="currentColor" className="text-gray-100" />
    
    {/* Document/Post icons */}
    <g className="text-gray-300">
      <rect x="160" y="120" width="30" height="40" rx="4" fill="currentColor" />
      <rect x="165" y="130" width="20" height="2" fill="white" />
      <rect x="165" y="135" width="15" height="2" fill="white" />
      <rect x="165" y="140" width="18" height="2" fill="white" />
      
      <rect x="200" y="110" width="30" height="40" rx="4" fill="currentColor" />
      <rect x="205" y="120" width="20" height="2" fill="white" />
      <rect x="205" y="125" width="15" height="2" fill="white" />
      <rect x="205" y="130" width="18" height="2" fill="white" />
    </g>
    
    {/* Pen/Write icon in center */}
    <circle cx="200" cy="180" r="12" fill="currentColor" className="text-blue-100" />
    <path 
      d="M195 175 L205 175 L202 185 Z" 
      fill="currentColor"
      className="text-blue-400"
    />
    <line x1="198" y1="175" x2="202" y2="175" stroke="currentColor" strokeWidth="1" className="text-blue-400" />
  </svg>
);

// Beautiful Empty State SVG Component
export const EmptyStateSVG = () => (
  <svg
    viewBox="0 0 400 300"
    className="w-32 h-24 mx-auto opacity-60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background elements */}
    <circle cx="200" cy="150" r="100" fill="currentColor" className="text-gray-100" />
    <circle cx="200" cy="150" r="60" fill="currentColor" className="text-gray-50" />
    
    {/* Social media icons floating */}
    <g className="text-gray-300">
      {/* Instagram icon */}
      <rect x="160" y="110" width="20" height="20" rx="6" fill="currentColor" />
      <circle cx="170" cy="120" r="6" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="175" cy="115" r="1" fill="white" />
      
      {/* Twitter/X icon */}
      <path 
        d="M230 110 L245 125 L250 120 L235 105 L230 110 Z M235 125 L250 140 L245 145 L230 130 L235 125 Z" 
        fill="currentColor" 
      />
      
      {/* Facebook icon */}
      <rect x="160" y="160" width="20" height="20" rx="3" fill="currentColor" />
      <path d="M168 165 L168 175 M165 170 L175 170" stroke="white" strokeWidth="2" />
      
      {/* LinkedIn icon */}
      <rect x="220" y="160" width="20" height="20" rx="3" fill="currentColor" />
      <circle cx="225" cy="165" r="2" fill="white" />
      <rect x="223" y="170" width="4" height="7" fill="white" />
      <rect x="230" y="168" width="4" height="9" fill="white" />
      <rect x="235" y="165" width="4" height="12" fill="white" />
    </g>
    
    {/* Plus icon in center */}
    <circle cx="200" cy="150" r="15" fill="currentColor" className="text-blue-100" />
    <path 
      d="M200 140 L200 160 M190 150 L210 150" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
      className="text-blue-400"
    />
    
    {/* Connecting lines */}
    <g className="text-gray-200" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3">
      <line x1="180" y1="130" x2="190" y2="140" />
      <line x1="220" y1="130" x2="210" y2="140" />
      <line x1="180" y1="170" x2="190" y2="160" />
      <line x1="220" y1="170" x2="210" y2="160" />
    </g>
  </svg>
);
