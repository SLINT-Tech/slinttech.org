import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
};

export default function SearchInput({ value, onValueChange, ...props }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (!composing.current) setDraft(value);
  }, [value]);
  const placeholderLabel = props.placeholder?.endsWith("...")
    ? props.placeholder.slice(0, -3)
    : props.placeholder;
  return (
    <div className="app-search">
      <Search size={17} aria-hidden="true" />
      <input
        {...props}
        ref={input}
        type="search"
        aria-label={props["aria-label"] || placeholderLabel || "Search"}
        value={draft}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          onValueChange(event.currentTarget.value);
        }}
        onChange={(event) => {
          setDraft(event.target.value);
          if (!composing.current) onValueChange(event.target.value);
        }}
      />
      {draft && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setDraft("");
            onValueChange("");
            input.current?.focus();
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
