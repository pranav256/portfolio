"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { motion, useMotionValue, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: CheckboxPrimitive.Root.Props) {
  // Controlled parents own the value: the tick must follow the checked prop,
  // not an internal mirror that flips even when the parent rejects the change.
  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = React.useState(
    defaultChecked ?? false
  )
  const isChecked = isControlled ? !!checked : internalChecked
  const pathLength = useMotionValue(isChecked ? 1 : 0)
  const strokeLinecap = useTransform(() =>
    pathLength.get() === 0 ? "none" : "round"
  )

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-border ring-offset-background [backdrop-filter:var(--glass-blur)] [-webkit-backdrop-filter:var(--glass-blur)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-transparent data-checked:bg-[var(--glass-strong)] data-checked:text-foreground/90 data-checked:shadow-[inset_0_0.0938rem_0_oklch(1_0_0_/_0.75),inset_0_-0.0938rem_0_oklch(1_0_0_/_0.25),0_0.0625rem_0.125rem_oklch(0_0_0_/_0.06),0_0.25rem_0.625rem_oklch(0_0_0_/_0.08)]",
        className
      )}
      checked={isChecked}
      onCheckedChange={(value, eventDetails) => {
        if (!isControlled) setInternalChecked(value)
        onCheckedChange?.(value, eventDetails)
      }}
      nativeButton
      render={
        <motion.button
          className="flex items-center justify-center p-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
      }
      {...props}
    >
      <CheckboxPrimitive.Indicator
        keepMounted
        data-slot="checkbox-indicator"
        className="grid size-full place-items-center text-current"
      >
        <svg
          viewBox="0 0 14 14"
          className="h-4 w-4"
          fill="none"
          strokeWidth={2}
          stroke="currentColor"
          strokeLinejoin="round"
        >
          <motion.path
            d="M2 6l4 4 6-6"
            animate={{ pathLength: isChecked ? 1 : 0 }}
            transition={{
              type: "spring",
              bounce: 0,
              duration: isChecked ? 0.3 : 0.1,
            }}
            style={{ pathLength, strokeLinecap }}
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
Checkbox.displayName = "Checkbox"

export { Checkbox }
