import { useState, useEffect } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

let count = 0

function generateId() {
  return `toast-${++count}`
}

export function useToast() {
  const [toasts, setToasts] = useState([])

  const dismiss = (toastId) => {
    setToasts((toasts) => toasts.filter((t) => t.id !== toastId))
  }

  const toast = ({ ...props }) => {
    const id = props.id || generateId()
    const newToast = { ...props, id }
    
    setToasts((toasts) => {
      const currentToasts = toasts.filter(Boolean)
      return [newToast, ...currentToasts].slice(0, TOAST_LIMIT)
    })

    return {
      id,
      dismiss: () => dismiss(id),
      update: (props) => {
        setToasts((toasts) => {
          const updatedToasts = toasts.map((t) => {
            return t.id === id ? { ...t, ...props } : t
          })
          return updatedToasts
        })
      },
    }
  }

  useEffect(() => {
    const timeouts = []

    toasts.forEach((toast) => {
      if (toast.duration !== Infinity) {
        const timeout = setTimeout(() => {
          dismiss(toast.id)
        }, toast.duration || TOAST_REMOVE_DELAY)

        timeouts.push(timeout)
      }
    })

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [toasts])

  return {
    toasts,
    toast,
    dismiss,
  }
}