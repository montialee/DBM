import React, { useState, useEffect } from 'react';
import { Pencil, Eraser, PaintBucket, Trash2 } from 'lucide-react';
import './App.css';

const GridSizeOverlay = ({ onSizeSelect }) => {
  const [size, setSize] = useState(16);

  return (
    <div className="overlay">
      <div className="overlay-content">
        <h2>Choose Grid Size</h2>
        <div className="size-selector">
          <input
            type="number"
            min="1"
            max="32"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value, 10))}
          />
          <button onClick={() => onSizeSelect(size)}>Start Drawing</button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [gridSize, setGridSize] = useState(16);
  const [grid, setGrid] = useState([]);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentTool, setCurrentTool] = useState('pencil');
  const [palette, setPalette] = useState(['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF']);

  useEffect(() => {
    setGrid(Array(gridSize).fill().map(() => Array(gridSize).fill('#FFFFFF')));
  }, [gridSize]);

  const handleSizeSelect = (size) => {
    setGridSize(size);
    setShowOverlay(false);
  };

  const handleCellClick = (rowIndex, colIndex) => {
    const newGrid = [...grid];

    if (currentTool === 'pencil') {
      newGrid[rowIndex][colIndex] = currentColor;
    } else if (currentTool === 'eraser') {
      newGrid[rowIndex][colIndex] = '#FFFFFF';
    } else if (currentTool === 'fill') {
      const targetColor = grid[rowIndex][colIndex];
      if (targetColor !== currentColor) {
        floodFill(newGrid, rowIndex, colIndex, targetColor, currentColor);
      }
    }

    setGrid(newGrid);
  };

  const floodFill = (grid, row, col, targetColor, replacementColor) => {
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return;
    if (grid[row][col] !== targetColor) return;

    grid[row][col] = replacementColor;

    floodFill(grid, row + 1, col, targetColor, replacementColor);
    floodFill(grid, row - 1, col, targetColor, replacementColor);
    floodFill(grid, row, col + 1, targetColor, replacementColor);
    floodFill(grid, row, col - 1, targetColor, replacementColor);
  };

  const handleClearCanvas = () => {
    setGrid(Array(gridSize).fill().map(() => Array(gridSize).fill('#FFFFFF')));
  };

  const handleChangeSize = () => {
    setShowOverlay(true);
  };

  const handleColorChange = (color) => {
    setCurrentColor(color);
    if (!palette.includes(color)) {
      setPalette([...palette, color]);
    }
  };

  return (
    <div className="pixel-art-maker">
      {showOverlay ? (
        <GridSizeOverlay onSizeSelect={handleSizeSelect} />
      ) : (
        <>
          <div className="top-bar">
            <h1>Pixel Art Maker</h1>
          </div>
          <div className="main-content">
            <div className="sidebar">
              <h2>Color Palette</h2>
              <div className="color-picker">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                />
                <span>Selected: {currentColor}</span>
              </div>
              <div className="palette">
                {palette.map((color, index) => (
                  <div
                    key={index}
                    className={`color-swatch ${color === currentColor ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="drawing-area">
              <div className="grid-container">
                <div className="grid" style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  width: `${gridSize * 20}px`,
                  height: `${gridSize * 20}px`
                }}>
                  {grid.map((row, rowIndex) => 
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="cell"
                        style={{ backgroundColor: cell }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      />
                    ))
                  )}
                </div>
              </div>
              <div className="tools">
                <button
                  className={`tool-btn ${currentTool === 'pencil' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('pencil')}
                >
                  <Pencil size={24} />
                </button>
                <button
                  className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('eraser')}
                >
                  <Eraser size={24} />
                </button>
                <button
                  className={`tool-btn ${currentTool === 'fill' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('fill')}
                >
                  <PaintBucket size={24} />
                </button>
                <button
                  className="tool-btn"
                  onClick={handleClearCanvas}
                >
                  <Trash2 size={24} />
                </button>
              </div>
              <button onClick={handleChangeSize} className="change-size-btn">Change Grid Size</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;