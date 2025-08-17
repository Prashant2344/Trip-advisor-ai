const ResponseDisplay = ({ response }) => {
  // Extract the actual text content from the response
  const getDisplayText = (response) => {
    if (response.includes('Generated text:')) {
      return response.replace('Generated text:', '').trim()
    }
    return response
  }

  const displayText = getDisplayText(response)

  return (
    <div className="response-container">
      <div className="response-header">
        <h2>🎯 Your Travel Itinerary</h2>
        <div className="response-badge">AI Generated</div>
      </div>
      
      <div className="response-content">
        {displayText ? (
          <div className="itinerary-text">
            {displayText.split('\n').map((line, index) => (
              <p key={index} className="itinerary-line">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="no-content">No itinerary content available</p>
        )}
      </div>
      
      <div className="response-footer">
        <p className="disclaimer">
          💡 This itinerary is AI-generated and should be used as a starting point. 
          Always verify details and check local conditions before your trip.
        </p>
      </div>
    </div>
  )
}

export default ResponseDisplay 