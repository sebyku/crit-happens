import { useState } from 'react'
import './Inventory.css'

function Inventory({ items, itemDefs, gold, hp }) {
  const [selectedItem, setSelectedItem] = useState(null)

  function handleClick(itemId) {
    setSelectedItem((prev) => (prev === itemId ? null : itemId))
  }

  const activeSelection = selectedItem && items.includes(selectedItem) ? selectedItem : null
  const selected = activeSelection ? itemDefs[activeSelection] : null

  return (
    <div className="inventory">
      <div className="inventory-bar">
        <div className="inventory-items">
          {items.map((itemId) => {
            const def = itemDefs[itemId]
            if (!def) return null
            return (
              <button
                key={itemId}
                className={`inventory-slot${activeSelection === itemId ? ' selected' : ''}`}
                onClick={() => handleClick(itemId)}
                title={def.name}
              >
                {def.iconUrl && (
                  <img src={def.iconUrl} alt={def.name} className="inventory-icon" />
                )}
              </button>
            )
          })}
        </div>
        <div className="inventory-stats">
          <div className="stat">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{hp}</span>
          </div>
          <div className="stat">
            <span className="stat-icon">💰</span>
            <span className="stat-value">{gold}</span>
          </div>
        </div>
      </div>

      {selected && (
        <div className="item-dialog-overlay" onClick={() => setSelectedItem(null)}>
          <div className="item-card" onClick={(e) => e.stopPropagation()}>
            {selected.iconUrl && (
              <img src={selected.iconUrl} alt={selected.name} className="item-card-icon" />
            )}
            <div className="item-card-divider" />
            <h2 className="item-card-name">{selected.name}</h2>
            <p className="item-card-description">{selected.description}</p>
            <button className="item-card-close" onClick={() => setSelectedItem(null)}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory