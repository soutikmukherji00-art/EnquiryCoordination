/**
 * EnquiryDrawer Component
 * 
 * Mobile/Tablet drawer for enquiry list navigation.
 * Replaces the left sidebar on smaller screens.
 */

import * as React from 'react';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { cn } from '@/app/components/ui/utils';

export interface EnquiryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
}

/**
 * EnquiryDrawer - Left drawer for enquiry list
 * 
 * Features:
 * - Slides in from left
 * - Full height
 * - Backdrop overlay
 * - Swipe to close (via Sheet)
 */
export function EnquiryDrawer({ 
  open, 
  onOpenChange, 
  children,
  title = "Enquiries" 
}: EnquiryDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="w-[85vw] max-w-[400px] p-0 flex flex-col"
        aria-describedby={undefined}
      >
        {/* Visually hidden description for accessibility */}
        <SheetDescription className="sr-only">
          Enquiry list navigation
        </SheetDescription>

        {/* Header */}
        <SheetHeader className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {title}
            </SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * TabletDrawer - Collapsible drawer for tablet
 * 
 * Persistent but collapsible on tablet.
 */
interface TabletDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function TabletDrawer({ open, onOpenChange, children }: TabletDrawerProps) {
  return (
    <div
      className={cn(
        'border-r border-gray-200 bg-white transition-all duration-300 flex-shrink-0',
        open ? 'w-80' : 'w-0 overflow-hidden'
      )}
    >
      {open && (
        <div className="w-80 h-full flex flex-col">
          {/* Toggle Button */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Enquiries</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Collapse drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}