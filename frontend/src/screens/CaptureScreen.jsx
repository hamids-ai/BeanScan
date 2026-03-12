import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { extractOCR, lookupCoffee } from '../lib/api'
import './CaptureScreen.css'

function CaptureScreen() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const fileInputRef = useRef(null)
  const [stage, setStage] = useState('idle') // 'idle' | 'processing'
  const [steps, setSteps] = useState([])
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setCameraError('Camera access was denied. Please allow camera access and reload.')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  function addStep(text, type) {
    setSteps(prev => [...prev, { text, type }])
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => processImage(event.target.result)
    reader.readAsDataURL(file)
  }

  const processImage = useCallback(async (imageBase64) => {
    stopCamera()
    setStage('processing')
    setSteps([])

    addStep('Reading bag label...', 'loading')
    let bagName, roasterName
    try {
      const ocr = await extractOCR(imageBase64)
      bagName = ocr.bagName
      roasterName = ocr.roasterName

      if (bagName && roasterName) {
        setSteps([{ text: `Found "${bagName}" by ${roasterName}`, type: 'success' }])
      } else {
        setSteps([{ text: 'Could not read label clearly — fill in manually', type: 'warning' }])
        navigate('/coffee-form', { state: { source: 'photo', coffeeData: { bagName, roasterName } } })
        return
      }
    } catch (err) {
      console.error('OCR error:', err)
      setSteps([{ text: `Photo scan failed (${err.message ?? err.code ?? 'unknown'}) — fill in manually`, type: 'warning' }])
      await new Promise(r => setTimeout(r, 2000))
      navigate('/coffee-form', { state: { source: 'manual' } })
      return
    }

    addStep('Looking up coffee details...', 'loading')
    try {
      const meta = await lookupCoffee(bagName, roasterName)
      const { source, error: metaError, ...coffeeData } = meta

      if (metaError) {
        setSteps(prev => [prev[0], { text: 'Details lookup failed — fill in manually', type: 'warning' }])
        navigate('/coffee-form', { state: { source: 'photo', coffeeData: { bagName, roasterName } } })
        return
      }

      const fieldsFound = Object.values(coffeeData).filter(v => v != null && v !== '').length
      setSteps(prev => [prev[0], { text: `Details populated — ${fieldsFound} fields filled`, type: 'success' }])
      navigate('/coffee-form', { state: { source: 'photo', coffeeData: { bagName, roasterName, ...coffeeData } } })
    } catch {
      setSteps(prev => [prev[0], { text: 'Details lookup failed — fill in manually', type: 'warning' }])
      navigate('/coffee-form', { state: { source: 'photo', coffeeData: { bagName, roasterName } } })
    }
  }, [navigate])

  async function handleCapture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.85)
    processImage(imageBase64)
  }

  return (
    <div className="screen capture-screen">
      <div className="capture-header">
        <Link to="/add" className="back-btn">← Back</Link>
        <span className="logo logo-sm">BeanScan</span>
        <span style={{ width: '48px' }} />
      </div>

      {stage === 'idle' ? (
        <>
          <h1 className="screen-title">Take Photo</h1>
          <p className="screen-subtitle">Point your camera at the coffee bag label</p>

          <div className="viewfinder">
            <div className="viewfinder-corner corner-tl" />
            <div className="viewfinder-corner corner-tr" />
            <div className="viewfinder-corner corner-bl" />
            <div className="viewfinder-corner corner-br" />

            {cameraError ? (
              <div className="viewfinder-inner">
                <p className="viewfinder-hint" style={{ color: 'var(--color-error)', textAlign: 'center', padding: 'var(--spacing-4)' }}>
                  {cameraError}
                </p>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="viewfinder-video" />
            )}
          </div>

          {/* Hidden canvas used to capture the frame */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div className="capture-footer">
            <button
              className="capture-btn"
              onClick={handleCapture}
              disabled={!!cameraError}
              aria-label="Capture photo"
            />
            <p className="capture-label">Tap to capture</p>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--spacing-3)' }} onClick={() => fileInputRef.current?.click()}>
              Upload photo instead
            </button>
          </div>
        </>
      ) : (
        <div className="processing-container">
          <div className="spinner spinner-lg" style={{ margin: '0 auto var(--spacing-6)' }} />
          <h2 className="processing-title">Analyzing your photo...</h2>
          <div className="processing-steps">
            {steps.map((step, i) => (
              <div key={i} className={`processing-step processing-step-${step.type}`}>
                <span className="processing-step-icon">
                  {step.type === 'success' ? '✓' : step.type === 'warning' ? '!' : '···'}
                </span>
                <span>{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CaptureScreen
