import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string | number;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
          setHighlightedIndex(-1);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        buttonRef.current?.focus();
        break;
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    onChange(option.value);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleButtonClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className={`relative custom-dropdown ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium
          bg-white/20 border border-white/30 text-white
          focus:outline-none focus:ring-2 focus:ring-genshin-blue
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-between
          transition-all duration-200
          hover:bg-white/30 hover:border-white/40
          backdrop-blur-sm
          ${isOpen ? 'ring-2 ring-genshin-blue bg-white/30' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedOption ? selectedOption.label : placeholder}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="
            absolute z-[9999] w-full mt-1 rounded-lg shadow-xl
            border border-white/30 max-h-60 overflow-auto
            animate-in fade-in-0 zoom-in-95 duration-200
            backdrop-blur-md
          "
          style={{
            // Ensure consistent rendering across platforms
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            // Prevent Windows-specific dropdown issues
            boxSizing: 'border-box',
            // Ensure proper z-index stacking
            isolation: 'isolate',
            // Match website theme with solid background
            background: 'linear-gradient(135deg, rgba(75, 85, 140, 0.95) 0%, rgba(65, 75, 130, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
          role="listbox"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option)}
              className={`
                w-full px-3 py-2 text-left text-sm
                focus:outline-none
                transition-all duration-150 custom-dropdown-option
                first:rounded-t-lg last:rounded-b-lg
                ${option.value === value 
                  ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-white font-medium border-l-2 border-purple-400' 
                  : index === highlightedIndex 
                    ? 'bg-gradient-to-r from-purple-300/40 to-pink-300/40 text-white'
                    : 'text-gray-900 hover:bg-gradient-to-r hover:from-purple-300/40 hover:to-pink-300/40 hover:text-white'
                }
              `}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
