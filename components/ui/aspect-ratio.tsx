"use client"

import * as React from "react"

// Luxe AspectRatio: use ratio prop (e.g., 16/9, 4/3, 1) to constrain proportions.
// Base UI has no AspectRatio primitive: plain div with CSS aspect-ratio.
// position: relative + width: 100% mirror the old primitive's root box so
// absolutely positioned children (e.g. next/image fill) keep working.

export interface AspectRatioProps
  extends React.ComponentPropsWithoutRef<"div"> {
  ratio?: number
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: String(ratio),
        ...style,
      }}
      {...props}
    />
  )
)
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
