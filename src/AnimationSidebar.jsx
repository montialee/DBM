import React from 'react';
import { Play, Pause, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

const AnimationSidebar = ({ frames, currentFrame, onAddFrame, onDeleteFrame, onPlayPause, isPlaying, onFrameChange, fps, onFpsChange }) => {
  return (
    <div className="animation-sidebar">
      <h2>Animazione</h2>
      <div className="frame-controls">
        <button className="tool-btn add-frame" onClick={onAddFrame} title="Add Frame">
          <Plus size={24} />
        </button>
        <div className="frame-navigation">
          <button className="tool-btn" onClick={() => onFrameChange(Math.max(0, currentFrame - 1))} title="Previous Frame" disabled={currentFrame === 0}>
            <ChevronLeft size={24} />
          </button>
          <button className="tool-btn" onClick={() => onFrameChange(Math.min(frames.length - 1, currentFrame + 1))} title="Next Frame" disabled={currentFrame === frames.length - 1}>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      <div className="frame-list">
        {frames.map((frame, index) => (
          <div key={index} className="frame-item">
            <div
              className={`frame-thumbnail ${index === currentFrame ? 'active' : ''}`}
              onClick={() => onFrameChange(index)}
            >
              Frame {index + 1}
            </div>
            <button 
              className="tool-btn delete-frame" 
              onClick={() => onDeleteFrame(index)} 
              title="Delete Frame"
              disabled={frames.length <= 1}
            >
              <X size={24} />
            </button>
          </div>
        ))}
      </div>
      <div className="animation-controls">
        <button className="tool-btn play-pause" onClick={onPlayPause} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <div className="fps-control">
          <label htmlFor="fps">FPS:</label>
          <input
            type="number"
            id="fps"
            min="1"
            max="30"
            value={fps}
            onChange={(e) => onFpsChange(parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimationSidebar;