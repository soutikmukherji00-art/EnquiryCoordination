/**
 * ProfileBottomSheet Component
 * 
 * Bottom sheet for displaying entity profiles on mobile.
 * Replaces the right panel StructuredPanel/EntityProfileCard.
 */

import * as React from 'react';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { cn } from '@/app/components/ui/utils';

export interface ProfileBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  fullScreen?: boolean;
}

/**
 * ProfileBottomSheet - Bottom sheet for profiles and structured data
 * 
 * Features:
 * - Slides up from bottom
 * - Can be full-screen or partial (80vh)
 * - Drag handle for native feel
 * - Scrollable content
 */
export function ProfileBottomSheet({ 
  open, 
  onOpenChange, 
  children,
  title,
  fullScreen = false
}: ProfileBottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom"
        className={cn(
          'p-0 flex flex-col rounded-t-2xl',
          fullScreen ? 'h-[100vh]' : 'h-[85vh]'
        )}
        aria-describedby={undefined}
      >
        {/* Visually hidden title for accessibility */}
        <SheetTitle className="sr-only">
          {title || "Bottom Sheet"}
        </SheetTitle>
        <SheetDescription className="sr-only">
          Content panel
        </SheetDescription>

        {/* Drag Handle */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <SheetHeader className="px-4 pb-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </SheetHeader>
        )}
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * ActionSheet - Bottom sheet for action menus
 * 
 * Shorter height, used for contextual actions.
 */
interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
}

export function ActionSheet({ open, onOpenChange, title, children }: ActionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom"
        className="p-0 flex flex-col rounded-t-2xl h-auto max-h-[60vh]"
        aria-describedby={undefined}
      >
        {/* Visually hidden title for accessibility */}
        <SheetTitle className="sr-only">
          {title || "Action Sheet"}
        </SheetTitle>
        <SheetDescription className="sr-only">
          Action menu
        </SheetDescription>

        {/* Drag Handle */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Title */}
        {title && (
          <div className="px-4 pb-3">
            <h3 className="text-base font-semibold text-gray-900">
              {title}
            </h3>
          </div>
        )}
        
        {/* Actions */}
        <div className="pb-safe">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * ActionSheetItem - Individual action item
 */
interface ActionSheetItemProps {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

export function ActionSheetItem({ 
  icon, 
  label, 
  onClick, 
  variant = 'default',
  disabled = false 
}: ActionSheetItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-4 min-h-[56px] hover:bg-gray-50 active:bg-gray-100 transition-colors',
        variant === 'destructive' && 'text-red-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon && (
        <div className={cn(
          'w-5 h-5 flex items-center justify-center',
          variant === 'destructive' ? 'text-red-600' : 'text-gray-600'
        )}>
          {icon}
        </div>
      )}
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}