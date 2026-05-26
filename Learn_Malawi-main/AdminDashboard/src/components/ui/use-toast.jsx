import { useState, useEffect, useCallback } from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 4000

let toastCount = 0
let listeners = []
let memoryState = { toasts: [] }

function dispatch(action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach(l => l(memoryState))
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) }
    case "UPDATE_TOAST":
      return { ...state, toasts: state.toasts.map(t => t.id === action.toast.id ? { ...t, ...action.toast } : t) }
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.map(t => (!action.toastId || t.id === action.toastId) ? { ...t, open: false } : t) }
    case "REMOVE_TOAST":
      return { ...state, toasts: action.toastId ? state.toasts.filter(t => t.id !== action.toastId) : [] }
    default:
      return state
  }
}

export function toast({ ...props }) {
  const id = String(++toastCount)
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })
  dispatch({ type: "ADD_TOAST", toast: { ...props, id, open: true, onOpenChange: open => { if (!open) dismiss() } } })
  setTimeout(() => dispatch({ type: "REMOVE_TOAST", toastId: id }), TOAST_REMOVE_DELAY)
  return { id, dismiss }
}

export function useToast() {
  const [state, setState] = useState(memoryState)
  useEffect(() => {
    listeners.push(setState)
    return () => { listeners = listeners.filter(l => l !== setState) }
  }, [])
  return { ...state, toast, dismiss: id => dispatch({ type: "DISMISS_TOAST", toastId: id }) }
}
