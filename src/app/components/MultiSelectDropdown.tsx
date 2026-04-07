/**
 * MultiSelectDropdown Component
 * 
 * A reusable multi-select dropdown with checkbox support
 */

import { useState, useRef, useEffect, memo } from "react";
import { Check, ChevronDown, X } from "lucide-react";

interface MultiSelectDropdownProps<T extends string> {
  options: readonly T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  placeholder?: string;
  label?: string;
}

export const MultiSelectDropdown = memo(function MultiSelectDropdown<T extends string>({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  label,
}: MultiSelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: T) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: T, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== option));
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between gap-2"
      >
        <div className="flex-1 flex flex-wrap gap-1.5">
          {selected.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            selected.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm"
              >
                {item}
                <span
                  onClick={(e) => removeOption(item, e)}
                  className="hover:bg-blue-200 rounded-full p-0.5 cursor-pointer"
                  role="button"
                  aria-label={`Remove ${item}`}
                >
                  <X className="size-3" />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className={`size-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between gap-2 transition-colors"
              >
                <span className={isSelected ? "font-medium text-blue-600" : "text-gray-700"}>
                  {option}
                </span>
                {isSelected && (
                  <div className="size-5 bg-blue-500 rounded flex items-center justify-center">
                    <Check className="size-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});