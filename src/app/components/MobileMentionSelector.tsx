/**
 * MobileMentionSelector Component
 * 
 * Full-screen mention selector for mobile.
 * Replaces PersonaMentionDropdown on small screens.
 */

import * as React from 'react';
import { X, Search, User, Zap } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/components/ui/utils';
import { Persona } from '@/domain/enquiry/enquiry.types';

export interface MobileMentionItem {
  type: 'person' | 'command';
  id: string;
  label: string;
  subtitle?: string;
  persona?: Persona;
  icon?: React.ReactNode;
  badge?: string;
}

export interface MobileMentionGroup {
  title: string;
  items: MobileMentionItem[];
}

interface MobileMentionSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: MobileMentionGroup[];
  onSelect: (item: MobileMentionItem) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

/**
 * MobileMentionSelector - Full-screen @ mention picker
 * 
 * Features:
 * - Search at top
 * - Grouped sections
 * - Large touch targets (56px)
 * - Clear section headers
 */
export function MobileMentionSelector({
  open,
  onOpenChange,
  groups,
  onSelect,
  searchValue,
  onSearchChange,
}: MobileMentionSelectorProps) {
  const handleSelect = (item: MobileMentionItem) => {
    onSelect(item);
    onOpenChange(false);
  };
  
  // Filter groups based on search
  const filteredGroups = React.useMemo(() => {
    if (!searchValue.trim()) {
      return groups;
    }
    
    const query = searchValue.toLowerCase();
    return groups
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(query) ||
          item.subtitle?.toLowerCase().includes(query)
        ),
      }))
      .filter(group => group.items.length > 0);
  }, [groups, searchValue]);
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom"
        className="p-0 flex flex-col h-[90vh] rounded-t-2xl"
        aria-describedby={undefined}
      >
        {/* Visually hidden title for accessibility */}
        <SheetTitle className="sr-only">
          Mention selector
        </SheetTitle>
        <SheetDescription className="sr-only">
          Select a person or command to mention
        </SheetDescription>

        {/* Header */}
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Mention
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search people or commands..."
              className="pl-10 h-11"
              autoFocus
            />
          </div>
        </SheetHeader>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No matches found
            </div>
          ) : (
            filteredGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Group Header */}
                <div className="px-4 py-2 bg-gray-50">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {group.title}
                  </h3>
                </div>
                
                {/* Group Items */}
                <div>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-4 py-3 min-h-[56px] hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {item.icon || (
                          item.type === 'person' ? (
                            <User className="w-5 h-5 text-gray-600" />
                          ) : (
                            <Zap className="w-5 h-5 text-blue-600" />
                          )
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-medium text-gray-900 truncate">
                            {item.label}
                          </span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.subtitle && (
                          <p className="text-sm text-gray-500 truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      
                      {/* Chevron */}
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}