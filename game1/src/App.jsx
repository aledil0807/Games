import { useState, useEffect, useRef } from 'react'
import './App.css'

function randomColor() {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return `rgb(${r}, ${g}, ${b})`
}

export default function App() {
  const [squares, setSquares] = useState([])
  const containerRef = useRef(null)

  // --- NUEVO: tamaño fijo en px calculado la PRIMERA vez ---
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
    // NOTA: no añadimos listener de resize porque quieres que se quede fijo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Añadir un cuadrado
  const addSquare = () => {
    setSquares((prev) => [...prev, { id: Date.now() + Math.random(), color: randomColor() }])
  }

  // tu cálculo de columnas/filas existente (no lo toco)
  const computeGrid = () => {
    const n = squares.length || 1
    const cols = Math.ceil(Math.sqrt(n))
    const rows = Math.ceil(n / cols)
    return { cols, rows }
  }
  const { cols, rows } = computeGrid()

  // En el style de la grid usamos el tamaño fijo si ya lo calculamos
  const INNER_PADDING = 16 // px de separación interior; ajustar si lo deseas

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
          <button onClick={addSquare}>Añadir cuadrado</button>
        </div>
      </header>

      <main className="app-main">
        {/* ref apunta al contenedor visible; medimos aquí */}
        <div className="app-content" ref={containerRef} role="region" aria-label="Área principal del juego">
          <div className="grid-stack" style={gridStyle}>
            {squares.map((s) => (
              <div key={s.id} className="square" style={{ background: s.color }} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}