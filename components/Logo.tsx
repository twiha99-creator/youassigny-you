import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shield Background */}
    <path 
      d="M 50 5 L 90 20 V 50 C 90 75 50 95 50 95 C 50 95 10 75 10 50 V 20 L 50 5 Z" 
      fill="#0B1E45" 
      stroke="#FFD700" 
      strokeWidth="4" 
    />
    
    {/* Glossy Highlight on Shield */}
    <path 
      d="M 50 10 L 82 22 V 50 C 82 70 50 88 50 88 C 50 88 18 70 18 50 V 22 L 50 10 Z" 
      fill="white" 
      fillOpacity="0.05" 
    />

    {/* Whistle Icon */}
    <g transform="translate(22, 25) scale(0.55)">
        {/* Whistle Body */}
        <path 
            d="M 10 40 L 60 40 L 60 30 L 85 30 C 90 30 95 35 95 40 V 55 C 95 60 90 65 85 65 L 60 65 C 60 85 45 95 30 95 C 15 95 0 80 0 60 C 0 50 5 40 10 40 Z" 
            fill="#FFD700"
        />
        {/* Whistle Hole */}
        <circle cx="30" cy="65" r="10" fill="#0B1E45" />
        {/* Sound lines */}
        <path d="M 80 20 L 90 10" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
        <path d="M 90 35 L 105 30" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

export const LogoFull: React.FC<{ className?: string }> = ({ className = "w-64" }) => (
  <div className={`flex flex-col items-center ${className}`}>
    {/* Ribbon Banner */}
    <div className="relative w-full -mb-10 z-10">
        <svg viewBox="0 0 300 120" className="w-full drop-shadow-lg">
            <defs>
                <path id="textCurve" d="M 40 75 Q 150 35 260 75" />
                <linearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#0B1E45" />
                </linearGradient>
            </defs>
            
            <path d="M 30 70 L 60 65 L 60 95 L 20 90 Z" fill="#061024" />
            <path d="M 270 70 L 240 65 L 240 95 L 280 90 Z" fill="#061024" />

            <path 
                d="M 20 55 Q 150 15 280 55 L 280 95 Q 150 55 20 95 Z" 
                fill="url(#ribbonGrad)" 
                stroke="#FFD700" 
                strokeWidth="0.5"
            />
            
            <text width="300" fontSize="34" fontWeight="900" fontFamily="Inter, sans-serif" fill="#FFD700" textAnchor="middle" letterSpacing="0.5px" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                <textPath href="#textCurve" startOffset="50%">
                    YOU ASSIGN
                </textPath>
            </text>
        </svg>
    </div>
    
    <LogoIcon className="w-44 h-44 drop-shadow-2xl relative z-20" />
  </div>
);

interface RefereeBackgroundProps {
  className?: string;
  opacity?: string;
  theme?: 'dark' | 'light';
}

export const RefereeBackground: React.FC<RefereeBackgroundProps> = ({ 
  className = "", 
  opacity = "opacity-10",
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-navy-900' : 'bg-gray-50';
  
  // Image: Professional soccer player with ball (Low key lighting for professional look)
  const bgImage = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${bgColor} ${className}`}>
      
      {/* Background Image Layer (Visible mainly in dark theme) */}
      {isDark && (
        <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105 opacity-80"
            style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}

      {/* Gradient Overlay - Adjust opacity to let image show through but keep text readable */}
      <div className={`absolute inset-0 z-10 bg-gradient-to-b ${
          isDark 
          ? 'from-navy-900/90 via-navy-900/40 to-navy-900/90' 
          : 'from-gray-50/95 via-white/80 to-gray-50/95'
      }`}></div>

      {/* Tactical Board / Pattern Overlay (Subtle) */}
      <svg className={`absolute top-0 left-0 w-full h-full ${opacity} z-10 mix-blend-overlay`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`tactical-board-${theme}`} x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
             <path d="M 0 20 A 20 20 0 0 0 20 0" fill="none" stroke={isDark ? 'white' : '#0B1E45'} strokeWidth="1" opacity="0.3"/>
             <path d="M 180 0 A 20 20 0 0 0 200 20" fill="none" stroke={isDark ? 'white' : '#0B1E45'} strokeWidth="1" opacity="0.3"/>
             <line x1="0" y1="0" x2="200" y2="200" stroke={isDark ? 'white' : '#0B1E45'} strokeWidth="0.5" opacity="0.1" />
             <line x1="200" y1="0" x2="0" y2="200" stroke={isDark ? 'white' : '#0B1E45'} strokeWidth="0.5" opacity="0.1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#tactical-board-${theme})`} />
      </svg>

      {/* Subtle Texture Noise for Professional Polish */}
      <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
    </div>
  );
};