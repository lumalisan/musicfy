import { useState, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { debounce } from '@/lib/utils/debounce';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceTime?: number;
  isLoading?: boolean;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput = ({
  placeholder = 'Search...',
  onSearch,
  debounceTime = 300,
  isLoading = false,
  className = '',
  value: externalValue = '',
  onChange: externalOnChange = () => {},
}: SearchInputProps) => {
  const [query, setQuery] = useState(externalValue);
  const [isTyping, setIsTyping] = useState(false);

  // Sync with external value
  useEffect(() => {
    setQuery(externalValue);
  }, [externalValue]);

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery);
      setIsTyping(false);
    }, debounceTime),
    [onSearch, debounceTime]
  );

  // Handle input change with debounce
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    externalOnChange(e);
    setIsTyping(true);
    debouncedSearch(value);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type='text'
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className='bg-primary ring-accent w-full rounded-md p-3 pl-10 placeholder-gray-400 ring-2 outline-none focus:ring-4'
      />
      <FontAwesomeIcon
        icon={isLoading || isTyping ? faSpinner : faSearch}
        className={`absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 ${
          isLoading || isTyping ? 'animate-spin' : ''
        }`}
      />
    </div>
  );
};
