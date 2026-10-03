"use client";

import * as React from "react";
import { cn } from "@/shared/utils/cn";

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      data-slot="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border/70",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px] self-stretch",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
