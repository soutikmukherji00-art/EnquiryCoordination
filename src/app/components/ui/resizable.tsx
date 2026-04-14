"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "./utils";

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "group relative flex w-px items-center justify-center bg-gray-200/55",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2",
        "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
        "transition-[width,height,background-color] duration-200 ease-in-out",
        "hover:w-0.5 hover:bg-[#5249D2]",
        "data-[resize-handle-state=drag]:w-0.5 data-[resize-handle-state=drag]:bg-[#5249D2]",
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:top-1/2 data-[panel-group-direction=vertical]:after:h-3 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
        "data-[panel-group-direction=vertical]:hover:h-0.5 data-[panel-group-direction=vertical]:hover:w-full",
        "data-[panel-group-direction=vertical]:data-[resize-handle-state=drag]:h-0.5 data-[panel-group-direction=vertical]:data-[resize-handle-state=drag]:w-full",
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border border-gray-200/70 bg-background/90 opacity-0 transition-all duration-200 group-hover:border-[#5249D2]/50 group-hover:bg-[#5249D2]/10 group-hover:opacity-100 group-data-[resize-handle-state=drag]:border-[#5249D2]/50 group-data-[resize-handle-state=drag]:bg-[#5249D2]/10 group-data-[resize-handle-state=drag]:opacity-100">
          <GripVerticalIcon className="size-2.5 text-muted-foreground group-hover:text-[#5249D2] group-data-[resize-handle-state=drag]:text-[#5249D2]" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
