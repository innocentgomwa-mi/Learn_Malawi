import * as React from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

const pad = (n) => String(n).padStart(2, "0")

function formatTime(h, m) {
  if (h == null || m == null) return ""
  return `${pad(h)}:${pad(m)}`
}

const TimePicker = React.forwardRef(({ value, onChange, className, ...props }, ref) => {
  const parse = (v) => {
    if (!v) return [null, null]
    const parts = v.split(":")
    if (parts.length !== 2) return [null, null]
    const [hh, mm] = parts.map(Number)
    if (Number.isNaN(hh) || Number.isNaN(mm)) return [null, null]
    return [hh, mm]
  }

  const [open, setOpen] = React.useState(false)
  const [hour, minute] = React.useMemo(() => parse(value), [value])
  const [selectedHour, setSelectedHour] = React.useState(hour ?? new Date().getHours())

  React.useEffect(() => {
    const [h] = parse(value)
    setSelectedHour(h ?? new Date().getHours())
  }, [value])

  const minutes = [0, 15, 30, 45]

  const handlePick = (h, m) => {
    const formatted = formatTime(h, m)
    onChange && onChange(formatted)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          readOnly
          ref={ref}
          value={value || ""}
          onClick={() => setOpen(true)}
          className={className}
          {...props}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
            {Array.from({ length: 24 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedHour(i)}
                className={`px-2 py-1 rounded text-sm ${selectedHour === i ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                {pad(i)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {minutes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handlePick(selectedHour ?? new Date().getHours(), m)}
                className="px-3 py-2 rounded bg-secondary/5 hover:bg-secondary">
                {pad(m)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePick(new Date().getHours(), new Date().getMinutes())}
              className="ml-auto px-3 py-2 rounded hover:bg-muted">
              Now
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})

TimePicker.displayName = "TimePicker"

export { TimePicker }
