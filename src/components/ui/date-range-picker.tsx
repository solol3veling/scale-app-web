import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateRangePickerProps {
  className?: string
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  presetValue?: string
  onPresetChange?: (preset: string) => void
  placeholder?: string
  disabled?: boolean
}

const presetRanges = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last year", value: "365d" },
  { label: "Custom range", value: "custom" },
]

export function DateRangePicker({
  className,
  value,
  onChange,
  presetValue = "30d",
  onPresetChange,
  placeholder = "Pick a date range",
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(value)

  const handlePresetChange = (preset: string) => {
    if (onPresetChange) {
      onPresetChange(preset)
    }

    if (preset !== "custom") {
      // Calculate date range based on preset
      const now = new Date()
      const days = parseInt(preset.replace('d', ''))
      const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      const range = { from, to: now }
      
      setTempRange(range)
      if (onChange) {
        onChange(range)
      }
      setIsOpen(false)
    }
  }

  const handleRangeSelect = (range: DateRange | undefined) => {
    setTempRange(range)
    if (range?.from && range?.to) {
      if (onChange) {
        onChange(range)
      }
      setIsOpen(false)
    }
  }

  const formatDateRange = () => {
    if (presetValue !== "custom") {
      const preset = presetRanges.find(p => p.value === presetValue)
      return preset?.label || "Last 30 days"
    }

    if (value?.from) {
      if (value.to) {
        return `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`
      }
      return format(value.from, "MMM d, yyyy")
    }
    
    return placeholder
  }

  return (
    <div className={cn("grid gap-2", className)}>
      {presetValue === "custom" ? (
        // Custom date range with calendar popover
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {/* Preset selector at top */}
            <div className="p-3 border-b">
              <Select value={presetValue} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {presetRanges.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Calendar for custom range */}
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={tempRange}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              className="p-3"
            />
            
            {tempRange?.from && tempRange?.to && (
              <div className="p-3 pt-0">
                <Button
                  onClick={() => {
                    if (onChange && tempRange) {
                      onChange(tempRange)
                    }
                    setIsOpen(false)
                  }}
                  className="w-full"
                >
                  Apply Range
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      ) : (
        // Simple preset selector - no nested dropdown
        <Select value={presetValue} onValueChange={handlePresetChange} disabled={disabled}>
          <SelectTrigger 
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select date range">
                {formatDateRange()}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {presetRanges.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}