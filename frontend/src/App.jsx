import { useState } from 'react'
import './App.css'
import TravelForm from './components/TravelForm'
import ResponseDisplay from './components/ResponseDisplay'
import ImageAnalysis from './components/ImageAnalysis'

function App() {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('travel') // 'travel' or 'image'

  const handleFormSubmit = async (destination, lengthOfStay) => {
    setLoading(true)
    setError('')
    setResponse('')
    
    try {
      const response = await fetch(`/api/?destination=${encodeURIComponent(destination)}&length=${encodeURIComponent(lengthOfStay)}`)
      const data = await response.text()
      setResponse(data)
    } catch (err) {
      setError('Failed to fetch itinerary. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

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
            <>
              <TravelForm onSubmit={handleFormSubmit} loading={loading} />
              
              {loading && (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Planning your perfect trip...</p>
                </div>
              )}
              
              {error && (
                <div className="error">
                  <p>{error}</p>
                </div>
              )}
              
              {response && !loading && (
                <ResponseDisplay response={response} />
              )}
            </>
          ) : (
            <ImageAnalysis />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
