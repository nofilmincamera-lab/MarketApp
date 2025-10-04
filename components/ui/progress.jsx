
import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-[#2B3648]",
      className
    )}
    {...props}
  >
    <div
      className="h-full bg-gradient-to-r from-[#20A4F3] to-[#7D5FFF] transition-all duration-300 ease-in-out"
      style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
