import { useState, useRef } from 'react'

const ImageAnalysis = () => {
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('upload') // 'upload' or 'url'
  const fileInputRef = useRef(null)

  // Compress image function
  const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(resolve, 'image/jpeg', quality)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileUpload = async (file) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // Check file size first
        const fileSizeMB = file.size / (1024 * 1024)
        if (fileSizeMB > 10) {
          setError('Image file is too large. Please select an image smaller than 10MB.')
          return
        }

        // Compress image if it's larger than 1MB
        let processedFile = file
        if (fileSizeMB > 1) {
          processedFile = await compressImage(file)
        }

        setImageFile(processedFile)
        setImageUrl('')
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target.result)
        }
        reader.readAsDataURL(processedFile)
        
        setError('') // Clear any previous errors
      } catch (err) {
        setError('Error processing image. Please try again.')
        console.error('Error processing image:', err)
      }
    } else {
      setError('Please select a valid image file')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!imageUrl.trim() && !imageFile) {
      setError('Please provide an image URL or upload an image file')
      return
    }

    setLoading(true)
    setError('')
    setAnalysis('')
    
    try {
      let requestBody = {}
      
      if (imageFile) {
        // Convert file to base64
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = e.target.result.split(',')[1] // Remove data:image/...;base64, prefix
          requestBody = { imageBase64: base64 }
          
          try {
            const response = await fetch('/api/image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            })
            
            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(errorText)
            }
            
            const data = await response.text()
            setAnalysis(data)
          } catch (err) {
            setError(err.message || 'Failed to analyze image. Please try again.')
            console.error('Error:', err)
          } finally {
            setLoading(false)
          }
        }
        reader.readAsDataURL(imageFile)
      } else {
        // Use URL
        requestBody = { imageUrl: imageUrl.trim() }
        
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText)
        }
        
        const data = await response.text()
        setAnalysis(data)
        setLoading(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze image. Please try again.')
      console.error('Error:', err)
      setLoading(false)
    }
  }

  const handleSampleImage = () => {
    setActiveTab('url')
    setImageUrl('https://github.com/vercel/ai/blob/main/examples/ai-core/data/comic-cat.png?raw=true')
    setImageFile(null)
    setImagePreview('')
    setError('')
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview('')
    setImageUrl('')
    setAnalysis('')
    setError('')
  }

  return (
    <div className="image-analysis-container">
      <div className="image-analysis-header">
        <h2>🔍 AI Image Analysis</h2>
        <p>Upload an image or provide a URL to get AI-powered analysis and travel insights</p>
      </div>
      
      <div className="input-tabs">
        <button 
          className={`input-tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📁 Upload Image
        </button>
        <button 
          className={`input-tab ${activeTab === 'url' ? 'active' : ''}`}
          onClick={() => setActiveTab('url')}
        >
          🔗 Image URL
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="image-form">
        {activeTab === 'upload' ? (
          <div className="upload-section">
            <div 
              className="drop-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="uploaded-image" />
                  <div className="image-info">
                    <span className="file-size">
                      {imageFile && `Size: ${(imageFile.size / (1024 * 1024)).toFixed(2)} MB`}
                    </span>
                    <button 
                      type="button" 
                      className="clear-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearImage()
                      }}
                    >
                      ❌ Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="drop-zone-content">
                  <div className="upload-icon">📁</div>
                  <p className="drop-zone-text">Click to upload or drag & drop</p>
                  <p className="drop-zone-subtext">Supports: JPG, PNG, GIF, WebP (Max: 10MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        ) : (
          <div className="url-section">
            <div className="form-group">
              <label htmlFor="imageUrl" className="form-label">
                📷 Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="form-input"
                required={activeTab === 'url'}
                disabled={loading}
              />
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="analyze-btn"
            disabled={loading || (!imageUrl.trim() && !imageFile)}
          >
            {loading ? 'Analyzing...' : '🔍 Analyze Image'}
          </button>
          
          <button 
            type="button" 
            className="sample-btn"
            onClick={handleSampleImage}
            disabled={loading}
          >
            🎯 Try Sample Image
          </button>
        </div>
      </form>
      
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>AI is analyzing your image...</p>
        </div>
      )}
      
      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}
      
      {analysis && !loading && (
        <div className="analysis-result">
          <div className="result-header">
            <h3>📋 Analysis Result</h3>
            <div className="result-badge">AI Generated</div>
          </div>
          
          <div className="result-content">
            <div className="image-preview">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Analyzed image" 
                  className="preview-image"
                />
              ) : (
                <img 
                  src={imageUrl} 
                  alt="Analyzed image" 
                  className="preview-image"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
              )}
              <div className="image-error" style={{ display: 'none' }}>
                <p>🖼️ Image preview unavailable</p>
              </div>
            </div>
            
            <div className="analysis-text">
              {analysis.replace('Image Analysis: ', '').split('\n').map((line, index) => (
                <p key={index} className="analysis-line">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageAnalysis 