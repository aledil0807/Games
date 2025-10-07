import { useState, useEffect, useRef } from 'react'
import './App.css'

function randomColor() {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return `rgb(${r}, ${g}, ${b})`
}

export default function App() {
  const [matrixSize, setMatrixSize] = useState(1);
  const [squares, setSquares] = useState([]);
  const [isTrue, setIsTrue] = useState(false);
  const [targetIdx, setTargetIdx] = useState(null); // índice del cuadrado objetivo
  const [score, setScore] = useState(0); // contador de aciertos
  const [hoveredIdx, setHoveredIdx] = useState(null); // índice del cuadrado bajo el cursor
  const containerRef = useRef(null)
  const MAX_MATRIX_SIZE = 27
  const [fixedSize, setFixedSize] = useState(null) // { width, height } en px

  useEffect(() => {
    // calculamos solo la primera vez; usamos rAF para esperar layout estable
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const rect = el.getBoundingClientRect()
      // guardamos el ancho/alto disponibles (en px) para fijarlos después
      setFixedSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      })
    }

    // medir en el siguiente frame (y en caso de width 0, intentarlo otra vez)
    requestAnimationFrame(() => {
      measure()
      // si rect.width es 0 por render inicial, reintentar en 100ms (opcional)
      const rect = el.getBoundingClientRect()
      if (rect.width === 0) {
        setTimeout(measure, 100)
      }
    })
  }, [])

  

  const addMatrixLevel = () => {
    const newSize = Math.min(matrixSize + 1, MAX_MATRIX_SIZE);
    const totalSquares = newSize * newSize;
    setMatrixSize(newSize);
    const newSquares = Array.from({ length: totalSquares }, (_, i) => ({
      id: i + '-' + Date.now() + Math.random(),
      color: randomColor()
    }));
    setSquares(newSquares);
    // Selecciona nuevo objetivo al crecer la matriz
    setTargetIdx(Math.floor(Math.random() * newSquares.length));
  };

  useEffect(() => {
    
    if (!isTrue) return; // No hacer nada si isTrue es false
    const interval = setInterval(() => {
      // Verifica si hoveredIdx coincide con targetIdx
      if (hoveredIdx === targetIdx) {
        addMatrixLevel();
      } else {
        // Detiene el juego y lo reinicia desde cero
        setIsTrue(false);
        setMatrixSize(1);
        setScore(0);
        setSquares([]);
        setTargetIdx(null);
      }
    }, 1300); // Cambia el tamaño cada segundo

    return () => clearInterval(interval); // Limpia el intervalo al desmontar o cambiar matrixSize
  }, [matrixSize, MAX_MATRIX_SIZE, isTrue, hoveredIdx, targetIdx]);

  const handleClick = () => {
    if (!isTrue) {
      setIsTrue(true);
      return;
    }
    if (isTrue) {
      setIsTrue(false);
      return;
    }
  }

    // 1. Crea un array de refs para los cuadrados
  const squareRefs = useRef([]);

  useEffect(() => {
    // Actualiza el array de refs cuando cambia la cantidad de cuadrados
    squareRefs.current = squareRefs.current.slice(0, squares.length);
  }, [squares.length]);

  // Cuando cambia squares, elige un objetivo si no hay
  useEffect(() => {
    if (squares.length > 0 && (targetIdx === null || targetIdx >= squares.length)) {
      setTargetIdx(Math.floor(Math.random() * squares.length));
    }
  }, [squares, targetIdx]);

  
  

  // Handler para hover sobre cuadrado
  // Guardar el índice hovered
  const handleSquareHover = (idx) => {
    setHoveredIdx(idx);
  }

  // Cuando se detiene el juego, limpiar hoveredIdx
  useEffect(() => {
    if (!isTrue) setHoveredIdx(null);
  }, [isTrue]);

  //cálculo de columnas/filas existente
  const computeGrid = () => {
    const cols = matrixSize;
    const rows = matrixSize;
    return { cols, rows }
  }
  const { cols, rows } = computeGrid()

  // En el style de la grid usamos el tamaño fijo si ya lo calculamos
  const INNER_PADDING = 16 // px de separación interior

  const gridStyle = {
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gap: '6px',
    /* si tenemos fixedSize, fijamos width/height en px restando el padding para crear separación sin crecer */
    ...(fixedSize
      ? {
          width: `${Math.max(0, fixedSize.width - INNER_PADDING * 2)}px`,
          height: `${Math.max(0, fixedSize.height - INNER_PADDING * 2)}px`,
        }
      : { width: '100%', height: '100%' }),
  }

  

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Juego de Colores</h1>
        <div className="header-controls">
          <button onClick={handleClick}>
            {isTrue ? 'Detener Juego' : 'Iniciar Juego'}
          </button>
        </div>
        {/* Muestra color objetivo y score */}
        {squares.length > 0 && targetIdx !== null && (
          <div className="target-info">
            <span>Color objetivo:</span>
            <span style={{ background: squares[targetIdx].color, padding: '0 16px', borderRadius: '6px', color: '#fff', marginLeft: '8px' }}>
              {squares[targetIdx].color}
            </span>
            <span style={{ marginLeft: '24px' }}>Aciertos: <b>{score}</b></span>
          </div>
        )}
      </header>

      <main className="app-main">
        {/* ref apunta al contenedor visible; medimos aquí */}
        <div className="app-content" ref={containerRef} role="region" aria-label="Área principal del juego">
          <div className="grid-stack" style={gridStyle}>
            {squares.map((s, i) => (
              <div
                key={s.id}
                className="square"
                style={{
                  background: s.color,
                  cursor: 'pointer',
                  outline: hoveredIdx === i ? '3px solid #222' : 'none'
                }}
                ref={el => squareRefs.current[i] = el}
                onMouseEnter={() => handleSquareHover(i)}
                onMouseLeave={() => hoveredIdx === i && setHoveredIdx(null)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}