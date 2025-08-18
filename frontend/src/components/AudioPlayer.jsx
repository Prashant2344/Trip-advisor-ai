import { useState, useRef, useEffect } from 'react'

const AudioPlayer = ({ text, className = '' }) => {
  const [isConverting, setIsConverting] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentVoice, setCurrentVoice] = useState('alloy')
  const [availableVoices, setAvailableVoices] = useState([])
  const [error, setError] = useState('')
  const audioRef = useRef(null)
  const audioBlobRef = useRef(null)

  // Fetch available voices when component mounts
  useEffect(() => {
    fetchAvailableVoices()
  }, [])

  const fetchAvailableVoices = async () => {
    try {
      const response = await fetch('/api/text-to-speech/voices')
      if (response.ok) {
        const voices = await response.json()
        setAvailableVoices(voices)
      }
    } catch (err) {
      console.error('Failed to fetch voices:', err)
    }
  }

  const convertToSpeech = async () => {
    if (!text || text.trim() === '') {
      setError('No text to convert to speech')
      return
    }

    setIsConverting(true)
    setError('')
    
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: currentVoice
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      // Check if response is JSON (fallback response) or audio blob
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        // This is a fallback response
        const fallbackData = await response.json()
        setError(`TTS Service Unavailable: ${fallbackData.message}. ${fallbackData.suggestion}`)
        return
      }

      // Get the audio blob
      const audioBlob = await response.blob()
      audioBlobRef.current = audioBlob
      
      // Create audio URL and set up player
      const audioUrl = URL.createObjectURL(audioBlob)
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.load()
      }
      
    } catch (err) {
      setError(err.message || 'Failed to convert text to speech')
      console.error('Error:', err)
    } finally {
      setIsConverting(false)
    }
  }

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const handleVoiceChange = (e) => {
    setCurrentVoice(e.target.value)
  }

  return (
    <div className={`audio-player ${className}`}>
      <div className="audio-controls">
        <div className="voice-selector">
          <label htmlFor="voice-select" className="voice-label">
            🎤 Voice:
          </label>
          <select
            id="voice-select"
            value={currentVoice}
            onChange={handleVoiceChange}
            className="voice-select"
            disabled={isConverting}
          >
            {availableVoices.map(voice => (
              <option key={voice.id} value={voice.id}>
                {voice.name} - {voice.description}
              </option>
            ))}
          </select>
        </div>

        <div className="control-buttons">
          <button
            onClick={convertToSpeech}
            disabled={isConverting || !text || text.trim() === ''}
            className="convert-btn"
          >
            {isConverting ? 'Converting...' : '🔊 Convert to Speech'}
          </button>

          {audioBlobRef.current && (
            <>
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="play-btn"
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              
              <button
                onClick={handleStop}
                className="stop-btn"
              >
                ⏹️ Stop
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error">
          <p>{error}</p>
          {error.includes('quota') && (
            <div className="quota-help">
              <h4>💡 Alternative Solutions:</h4>
              <ul>
                <li>Use a text-to-speech browser extension</li>
                <li>Copy the text to a TTS app on your device</li>
                <li>Check your OpenAI billing plan</li>
                <li>Try again later when quota resets</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {audioBlobRef.current && (
        <div className="audio-info">
          <p className="audio-ready">✅ Audio ready! Use the controls above to play.</p>
          <audio
            ref={audioRef}
            onEnded={handleAudioEnded}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  )
}

export default AudioPlayer 