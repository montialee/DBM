import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Eraser, PaintBucket, Trash2, Grid, Undo, Redo, Pipette, Plus, Minus } from 'lucide-react';
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
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [symmetryMode, setSymmetryMode] = useState('none');
  const [lineStart, setLineStart] = useState(null);

  useEffect(() => {
    const initialGrid = Array(gridSize).fill().map(() => Array(gridSize).fill('#FFFFFF'));
    setGrid(initialGrid);
    setHistory([initialGrid]);
    setHistoryIndex(0);
  }, [gridSize]);

  const updateGridWithHistory = useCallback((newGrid) => {
    setGrid(newGrid);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newGrid);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleSizeSelect = (size) => {
    setGridSize(size);
    setShowOverlay(false);
  };

  const applySymmetry = (newGrid, rowIndex, colIndex, color) => {
    newGrid[rowIndex][colIndex] = color;

    if (symmetryMode === 'horizontal' || symmetryMode === 'quad') {
      newGrid[gridSize - 1 - rowIndex][colIndex] = color;
    }
    if (symmetryMode === 'vertical' || symmetryMode === 'quad') {
      newGrid[rowIndex][gridSize - 1 - colIndex] = color;
    }
    if (symmetryMode === 'quad') {
      newGrid[gridSize - 1 - rowIndex][gridSize - 1 - colIndex] = color;
    }
  };

  const handleCellClick = (rowIndex, colIndex) => {
    if (currentTool === 'line') {
      if (!lineStart) {
        setLineStart({ row: rowIndex, col: colIndex });
      } else {
        const newGrid = grid.map(row => [...row]);
        drawLine(newGrid, lineStart.row, lineStart.col, rowIndex, colIndex);
        setLineStart(null);
        updateGridWithHistory(newGrid);
      }
    } else {
      const newGrid = grid.map(row => [...row]);

      if (currentTool === 'eyedropper') {
        setCurrentColor(grid[rowIndex][colIndex]);
        setCurrentTool('pencil');
        return;
      }

      if (currentTool === 'pencil') {
        applySymmetry(newGrid, rowIndex, colIndex, currentColor);
      } else if (currentTool === 'eraser') {
        applySymmetry(newGrid, rowIndex, colIndex, '#FFFFFF');
      } else if (currentTool === 'fill') {
        const targetColor = grid[rowIndex][colIndex];
        if (targetColor !== currentColor) {
          floodFill(newGrid, rowIndex, colIndex, targetColor, currentColor);
        }
      }

      updateGridWithHistory(newGrid);
    }
  };

  const drawLine = (grid, x0, y0, x1, y1) => {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      applySymmetry(grid, x0, y0, currentColor);

      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
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
    const newGrid = Array(gridSize).fill().map(() => Array(gridSize).fill('#FFFFFF'));
    updateGridWithHistory(newGrid);
  };

  const handleChangeSize = () => {
    setShowOverlay(true);
  };

  const handleColorChange = (color) => {
    setCurrentColor(color);
  };

  const handleSaveColor = () => {
    if (!palette.includes(currentColor)) {
      setPalette([...palette, currentColor]);
    }
  };

  const toggleGridlines = () => {
    setShowGridlines(!showGridlines);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setGrid(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setGrid(history[historyIndex + 1]);
    }
  };

  const toggleSymmetryMode = () => {
    const modes = ['none', 'horizontal', 'vertical', 'quad'];
    const currentIndex = modes.indexOf(symmetryMode);
    setSymmetryMode(modes[(currentIndex + 1) % modes.length]);
  };

  const renderSymmetryLines = () => {
    switch (symmetryMode) {
      case 'horizontal':
        return <div className="symmetry-line horizontal" />;
      case 'vertical':
        return <div className="symmetry-line vertical" />;
      case 'quad':
        return (
          <>
            <div className="symmetry-line horizontal" />
            <div className="symmetry-line vertical" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pixel-art-maker dark-theme">
      {showOverlay ? (
        <GridSizeOverlay onSizeSelect={handleSizeSelect} />
      ) : (
        <div className="app-container">
          <div className="sidebar">
            <h2>Palette Colori</h2>
            <div className="color-picker">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
              />
              <span>Selezionato: {currentColor}</span>
              <button onClick={handleSaveColor} className="save-color-btn">Salva Colore</button>
            </div>
            <div className="saved-colors-box">
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
          </div>
          <div className="main-area">
            <h1>Disegnini Molto Belli 2</h1>
            <div className="drawing-area">
              <div className="grid-container">
                <div 
                  className={`grid ${showGridlines ? 'with-gridlines' : ''}`} 
                  style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    width: `${gridSize * 25}px`,
                    height: `${gridSize * 25}px`
                  }}
                >
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
                  {renderSymmetryLines()}
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
                  className={`tool-btn ${currentTool === 'eyedropper' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('eyedropper')}
                  title="Contagocce"
                >
                  <Pipette size={24} />
                </button>
                <button
                  className={`tool-btn ${currentTool === 'line' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('line')}
                  title="Linea"
                >
                  <Minus size={32} />
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
                <button
                  className="tool-btn"
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                  title="Annulla"
                >
                  <Undo size={24} />
                </button>
                <button
                  className="tool-btn"
                  onClick={handleRedo}
                  disabled={historyIndex === history.length - 1}
                  title="Ripeti"
                >
                  <Redo size={24} />
                </button>
                <button
                  className={`tool-btn ${symmetryMode !== 'none' ? 'active' : ''}`}
                  onClick={toggleSymmetryMode}
                  title="Simmetria"
                >
                  <Plus size={24} />
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