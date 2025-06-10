import React from 'react';
import { SortOption } from '../../types';

interface SortSelectProps {
    options: SortOption[];
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
}

const SortSelect: React.FC<SortSelectProps> = ({ options, value, onChange, disabled }) => {
    return (
        <select
            data-testid="sort-select"
            value={value}
            onChange={onChange}
            disabled={disabled}
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
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default SortSelect;