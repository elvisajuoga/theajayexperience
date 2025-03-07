import React from 'react';

function ScrollingText() {
  return (
    <div className="scrolling-text">
      <div className="text-container">
        {Array(16).fill().map((_, index) => (
          <span key={index}>Welcome To The Ajay Experience </span>
        ))}
      </div>
    </div>
  );
}

export default ScrollingText; 