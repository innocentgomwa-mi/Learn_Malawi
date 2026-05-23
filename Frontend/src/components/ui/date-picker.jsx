import * as React from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"

function formatDate(d) {
  if (!d) return ""
  const pad = (n) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

const DatePicker = React.forwardRef(({ value, onChange, className, ...props }, ref) => {
  const parse = (v) => {
    if (!v) return undefined
    const parts = v.split("/")
    if (parts.length !== 3) return undefined
    const [dd, mm, yyyy] = parts.map(Number)
    if (!dd || !mm || !yyyy) return undefined
    return new Date(yyyy, mm - 1, dd)
  }

  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState(parse(value))

  React.useEffect(() => {
    setSelected(parse(value))
  }, [value])

  const handleSelect = (d) => {
    setSelected(d)
    const formatted = formatDate(d)
    onChange && onChange(formatted)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          readOnly
          ref={ref}
          value={selected ? formatDate(selected) : value || ""}
          onClick={() => setOpen(true)}
          className={className}
          {...props}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
})

DatePicker.displayName = "DatePicker"

export { DatePicker }
