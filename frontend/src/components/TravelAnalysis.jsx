import { useState } from 'react'
import TravelForm from './TravelForm'
import ResponseDisplay from './ResponseDisplay'
import AudioPlayer from './AudioPlayer'

const TravelAnalysis = () => {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFormSubmit = async (destination, lengthOfStay) => {
    setLoading(true)
    setError('')
    setResponse('')
    
    try {
      const response = await fetch(`/api/trip-planner/?destination=${encodeURIComponent(destination)}&length=${encodeURIComponent(lengthOfStay)}`)
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
    <div className="travel-analysis-container">
      <div className="travel-analysis-header">
        <h2>🗺️ AI Travel Planner</h2>
        <p>Get personalized travel itineraries powered by AI for any destination</p>
      </div>
      
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
        <>
          <ResponseDisplay response={response} />
          <AudioPlayer text={response} className="travel-audio" />
        </>
      )}
    </div>
  )
}

export default TravelAnalysis 