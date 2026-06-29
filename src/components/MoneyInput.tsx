import { useRef, useEffect } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}

function formatDisplay(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('es-AR')
}

export default function MoneyInput({ value, onChange, placeholder, required, className = '' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cursorRef = useRef<number>(0)

  const display = formatDisplay(value)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current)
    }
  }, [display])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const formatted = formatDisplay(raw)
    const diff = formatted.length - e.target.value.length
    cursorRef.current = e.target.selectionStart ?? 0
    if (diff > 0) cursorRef.current += diff
    if (cursorRef.current < 0) cursorRef.current = 0
    onChange(raw)
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  )
}
