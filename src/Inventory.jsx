import { useState } from 'react'
import './Inventory.css'

function Inventory({ items, itemDefs }) {
  const [selectedItem, setSelectedItem] = useState(null)

  function handleClick(itemId) {
    setSelectedItem((prev) => (prev === itemId ? null : itemId))
  }

  // Clear selection if item was removed from inventory
  const activeSelection = selectedItem && items.includes(selectedItem) ? selectedItem : null
  const selected = activeSelection ? itemDefs[activeSelection] : null

  return (
    <div className="inventory">
      <div className="inventory-bar">
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
      {selected && (
        <div className="inventory-popover">
          <strong>{selected.name}</strong>
          <p>{selected.description}</p>
        </div>
      )}
    </div>
  )
}

export default Inventory
