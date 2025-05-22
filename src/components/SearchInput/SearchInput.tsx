import React from 'react';

// Props for the SearchInput component
interface SearchInputProps {
    value: string; // Current input value
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Handler for input value change
    placeholder?: string; // Optional placeholder text
    disabled?: boolean; // Indicates if the input is disabled
}

// SearchInput functional component
const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = "Пошук...", disabled }) => {

    return (
        // Container for the input and icon with relative positioning
        <div className="relative w-full max-w-xs">
            {/* Input field */}
            <input
                type="text"
                data-testid="search-input" // For testing
                placeholder={placeholder} // Use placeholder from props
                value={value} // Controlled component value
                onChange={onChange} // Change handler
                disabled={disabled} // Disabled state
                className="
                    w-full
                    pl-4 pr-10 // Padding for text (left) and icon space (right)
                    py-2
                    border
                    border-gray-300
                    rounded-md
                    bg-white
                    text-gray-900
                    placeholder-gray-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-transparent
                    dark:bg-gray-700
                    dark:border-gray-600
                    dark:placeholder-gray-400
                    dark:text-white
                    dark:focus:ring-blue-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                "
            />
            {/* Icon container with absolute positioning */}
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {/* Icon */}
                {/* <img src={searchIcon} alt="Search Icon" className="h-5 w-5 text-gray-400 dark:text-gray-300" /> */}
            </span>
        </div>
    );
}

export default SearchInput;