import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = "Пошук...", disabled }) => {
  return (
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        data-testid="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="
          w-full
          pl-4 pr-10
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
      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {/* <img src={searchIcon} alt="Search Icon" className="h-5 w-5 text-gray-400 dark:text-gray-300" /> */}
      </span>
    </div>
  );
}

export default SearchInput;