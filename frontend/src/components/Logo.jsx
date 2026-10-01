import React from 'react';

const Logo = ({ size = 40, animated = true, className = '' }) => {
  return (
    <div
      data-testid="logo"
      className={`logo-mark ${className}`}
      style={{ width: size, height: size, flex: '0 0 auto' }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? 'logo-svg' : 'logo-svg logo-svg-still'}
      >
        <circle cx="32" cy="32" r="30" fill="#C6A15B" />
        <circle cx="32" cy="32" r="24.5" fill="#141816" />
        <path
          d="M22 42.5c1.2-13.5 6.2-21 10-21s8.8 7.5 10 21"
          fill="none"
          stroke="#C6A15B"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path d="M32 16.5v17" stroke="#E7D3A1" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="32" cy="38.5" r="2.1" fill="#C6A15B" />
      </svg>
    </div>
  );
};

export default Logo;
