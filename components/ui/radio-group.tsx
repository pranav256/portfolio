"use client"

import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { springInteraction } from "@/lib/motion"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive data-slot="radio-group" className={cn("grid gap-2", className)} {...props} />
  )
}
RadioGroup.displayName = "RadioGroup"

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-border text-foreground/90 ring-offset-background [backdrop-filter:var(--glass-blur)] [-webkit-backdrop-filter:var(--glass-blur)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-checked:border-transparent data-checked:bg-[var(--glass-strong)] data-checked:shadow-[inset_0_0.0938rem_0_oklch(1_0_0_/_0.75),inset_0_-0.0938rem_0_oklch(1_0_0_/_0.25),0_0.0625rem_0.125rem_oklch(0_0_0_/_0.06),0_0.25rem_0.625rem_oklch(0_0_0_/_0.08)]",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        keepMounted
        className="size-full relative flex items-center justify-center"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            <AnimatePresence initial={false}>
              {state.checked && (
                <motion.div
                  key="dot"
                  className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={springInteraction}
                />
              )}
            </AnimatePresence>
          </span>
        )}
      />
    </RadioPrimitive.Root>
  )
}
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
