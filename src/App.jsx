import { useConfig } from './useConfig.js'
import Journey from './Journey.jsx'
import './App.css'

function App() {
  const config = useConfig()
  return <Journey language={config.language} />
}

export default App