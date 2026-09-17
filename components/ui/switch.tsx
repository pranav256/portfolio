"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { springInteraction } from "@/lib/motion"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-[1.5rem] w-[2.75rem] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors [backdrop-filter:var(--glass-blur)] [-webkit-backdrop-filter:var(--glass-blur)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-disabled:cursor-not-allowed data-disabled:opacity-50 data-unchecked:bg-input data-checked:bg-[var(--glass-strong)] data-checked:shadow-[inset_0_0.0938rem_0_oklch(1_0_0_/_0.75),inset_0_-0.0938rem_0_oklch(1_0_0_/_0.25),0_0.0625rem_0.125rem_oklch(0_0_0_/_0.06),0_0.25rem_0.625rem_oklch(0_0_0_/_0.08)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        render={
          <motion.span
            layout
            transition={springInteraction}
            className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 data-checked:translate-x-5 data-unchecked:translate-x-0"
          />
        }
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
