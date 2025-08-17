import { useState } from 'react'

const TravelForm = ({ onSubmit, loading }) => {
  const [destination, setDestination] = useState('')
  const [lengthOfStay, setLengthOfStay] = useState('3')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (destination.trim() && lengthOfStay.trim()) {
      onSubmit(destination.trim(), lengthOfStay.trim())
    }
  }

  return (
    <div className="travel-form-container">
      <form onSubmit={handleSubmit} className="travel-form">
        <div className="form-group">
          <label htmlFor="destination" className="form-label">
            🗺️ Destination
          </label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Tokyo, Japan"
            className="form-input"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lengthOfStay" className="form-label">
            📅 Length of Stay (days)
          </label>
          <select
            id="lengthOfStay"
            value={lengthOfStay}
            onChange={(e) => setLengthOfStay(e.target.value)}
            className="form-select"
            disabled={loading}
          >
            <option value="1">1 day</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
            <option value="4">4 days</option>
            <option value="5">5 days</option>
            <option value="6">6 days</option>
            <option value="7">7 days</option>
            <option value="10">10 days</option>
            <option value="14">2 weeks</option>
            <option value="21">3 weeks</option>
            <option value="30">1 month</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || !destination.trim()}
        >
          {loading ? 'Planning...' : '🚀 Plan My Trip!'}
        </button>
      </form>
    </div>
  )
}

export default TravelForm 