import { useState } from 'react'
import './App.css'
import TravelAnalysis from './components/TravelAnalysis'
import ImageAnalysis from './components/ImageAnalysis'

function App() {
  const [activeTab, setActiveTab] = useState('travel') // 'travel' or 'image'

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🌍 AI Travel Assistant</h1>
          <p>Plan your trips and analyze travel images with AI</p>
        </header>
        
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'travel' ? 'active' : ''}`}
            onClick={() => setActiveTab('travel')}
          >
            🗺️ Travel Planner
          </button>
          <button 
            className={`nav-tab ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => setActiveTab('image')}
          >
            🔍 Image Analysis
          </button>
        </nav>
        
        <main className="main-content">
          {activeTab === 'travel' ? (
            <TravelAnalysis />
          ) : (
            <ImageAnalysis />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
