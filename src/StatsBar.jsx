import './StatsBar.css'

function StatsBar({ gold, hp }) {
  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-icon">❤️</span>
        <span className="stat-value">{hp}</span>
      </div>
      <div className="stat">
        <span className="stat-icon">💰</span>
        <span className="stat-value">{gold}</span>
      </div>
    </div>
  )
}

export default StatsBar