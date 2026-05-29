import { Search } from "lucide-react";
import { SEARCH_INPUT_CLASS } from "@/lib/resourcePageStyles";

/**
 * @param {{
 *   value: string;
 *   onChange: (value: string) => void;
 *   placeholder?: string;
 *   ariaLabel?: string;
 *   isFetching?: boolean;
 *   isLoading?: boolean;
 *   className?: string;
 * }} props
 */
export default function ResourceSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  ariaLabel = "Search resources",
  isFetching = false,
  isLoading = false,
  className = "relative mb-6 min-w-0 flex-1",
}) {
  return (
    <div className={className}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={SEARCH_INPUT_CLASS}
        aria-label={ariaLabel}
      />
      {isFetching && !isLoading && (
        <div
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-blue-200 border-t-yellow-500"
          aria-hidden
        />
      )}
    </div>
  );
}
