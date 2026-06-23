import Habits from '@src/views/Habits/index.jsx'

export default function App() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg, #0a0a0f)', color: 'var(--text, #e2e8f0)', fontFamily: 'system-ui, sans-serif' }}>
      <Habits />
    </div>
  )
}
