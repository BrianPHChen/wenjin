import { createRoot } from 'react-dom/client'
import { MayorFigure } from './components/MayorFigure'
import './styles.css'
import './mascot.css'
const acts: [string, string][] = [['idle','0s'],['wave','-0.35s'],['fist','-0.5s'],['bow','-0.6s'],['nod','-0.6s'],['point','-0.5s'],['jump','-0.3s'],['dragged','0s']]
createRoot(document.getElementById('root')!).render(
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, padding: 30 }}>
    <style>{`.pv * { animation-play-state: paused !important; }`}</style>
    {acts.map(([a, d]) => (
      <div key={a} className={`pv mascot ${a === 'dragged' ? 'is-dragged' : 'act-' + a}`} style={{ position: 'static', width: 200, ['--d' as string]: d }}>
        <style>{`.act-${a} * { animation-delay: ${d} !important; }`}</style>
        <MayorFigure /><p style={{ textAlign: 'center' }}>{a}</p>
      </div>
    ))}
  </div>,
)
