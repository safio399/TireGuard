import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'min' | 'max' | 'step' | 'onChange'> {
  onValueChange?: (value: number[]) => void
  value?: number[]
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, onValueChange, value, min = 0, max = 100, step = 1, ...props }, ref) => {
    return (
      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value?.[0] ?? 0}
        onChange={(e) => onValueChange?.([parseFloat(e.target.value)])}
        className={cn("w-full cursor-pointer accent-primary flex items-center justify-center h-2 overflow-hidden rounded-full", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"
export { Slider }
