import React from 'react';
import { SortOption } from '../../types';

// Props for the SortSelect component
interface SortSelectProps {
    options: SortOption[]; // Array of sorting options { value: string, label: string }
    value: string; // Current selected value
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void; // Handler for selection change
    disabled?: boolean; // Indicates if the select is disabled
}

const SortSelect: React.FC<SortSelectProps> = ({ options, value, onChange, disabled }) => {
    return (
        // Select element for sorting options
        <select
            data-testid="sort-select" // For testing
            value={value} // Controlled component value
            onChange={onChange} // Change handler
            disabled={disabled} // Disable state
            className="
                px-3 py-2
                border border-gray-600
                rounded-md
                bg-gray-700
                text-white
                focus:outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                min-w-[150px]
                disabled:opacity-50 disabled:cursor-not-allowed
            "
        >
            {/* Map over options and render an <option> for each */}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default SortSelect;