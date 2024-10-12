import React, { useState, useEffect } from 'react';
import { Pencil, Eraser, PaintBucket, Trash2, Grid } from 'lucide-react';
import './App.css';

const GridSizeOverlay = ({ onSizeSelect }) => {
  return (
    <div className="overlay">
      <div className="overlay-content">
        <h2>Scegli la dimensione della griglia</h2>
        <div className="size-selector">
          <button onClick={() => onSizeSelect(16)}>
            16x16 - Senza il quadratino del centro
          </button>
          <button onClick={() => onSizeSelect(17)}>
            17x17 - Con il quadratino del centro :)
          </button>
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
  const [palette, setPalette] = useState(['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF']);
  const [showGridlines, setShowGridlines] = useState(true);

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

  const toggleGridlines = () => {
    setShowGridlines(!showGridlines);
  };

  return (
    <div className="pixel-art-maker dark-theme">
      {showOverlay ? (
        <GridSizeOverlay onSizeSelect={handleSizeSelect} />
      ) : (
        <div className="app-container">
          <div className="sidebar">
            <h2>Tavolozza dei colori</h2>
            <div className="color-picker">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
              />
              <span>Selezionato: {currentColor}</span>
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
          <div className="main-area">
            <h1>Disegnini Molto Belli 2</h1>
            <div className="drawing-area">
              <div className="grid-container">
                <div className={`grid ${showGridlines ? 'with-gridlines' : ''}`} style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  width: `${gridSize * 30}px`,
                  height: `${gridSize * 30}px`
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
                  title="Matita"
                >
                  <Pencil size={24} />
                </button>
                <button
                  className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('eraser')}
                  title="Gomma"
                >
                  <Eraser size={24} />
                </button>
                <button
                  className={`tool-btn ${currentTool === 'fill' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('fill')}
                  title="Riempimento"
                >
                  <PaintBucket size={24} />
                </button>
                <button
                  className="tool-btn"
                  onClick={handleClearCanvas}
                  title="Cancella tutto"
                >
                  <Trash2 size={24} />
                </button>
                <button
                  className={`tool-btn ${showGridlines ? 'active' : ''}`}
                  onClick={toggleGridlines}
                  title="Mostra/Nascondi griglia"
                >
                  <Grid size={24} />
                </button>
              </div>
              <button onClick={handleChangeSize} className="change-size-btn">Cambia dimensione griglia</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;