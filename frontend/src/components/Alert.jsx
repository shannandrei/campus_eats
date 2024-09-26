import { useState, useCallback } from 'react'
import './CustomAlert.css'

function Alert({ message, onConfirm, onCancel }) {
  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert">
        <p>{message}</p>
        <div className="custom-alert-buttons">
          <button onClick={onConfirm}>OK</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export function useCustomAlert() {
  const [isVisible, setIsVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [resolveCallback, setResolveCallback] = useState(null)

  const showAlert = useCallback((message) => {
    return new Promise((resolve) => {
      setIsVisible(true)
      setAlertMessage(message)
      setResolveCallback(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setIsVisible(false)
    if (resolveCallback) {
      resolveCallback(true)
    }
  }, [resolveCallback])

  const handleCancel = useCallback(() => {
    setIsVisible(false)
    if (resolveCallback) {
      resolveCallback(false)
    }
  }, [resolveCallback])

  const AlertComponent = useCallback(() => {
    if (!isVisible) return null
    return <Alert message={alertMessage} onConfirm={handleConfirm} onCancel={handleCancel} />
  }, [isVisible, alertMessage, handleConfirm, handleCancel])

  return { showAlert, AlertComponent }
}

export default Alert
