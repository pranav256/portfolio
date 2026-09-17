"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Editorial Warm Label — mono uppercase, the "data and labels" voice in the spec.
// Base UI has no Label primitive: native <label>. select-none replaces the old
// primitive's behavior of preventing text selection on double click.

const labelVariants = cva(
  "font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<"label"> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
