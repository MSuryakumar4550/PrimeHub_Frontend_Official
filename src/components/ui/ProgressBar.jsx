import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress, color = 'var(--accent-cyan)' }) => {
  return (
    <div className="progress-track">
      <div 
        className="progress-fill" 
        style={{ 
          width: `${progress}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}80` 
        }} 
      />
    </div>
  );
};

export default ProgressBar;
