import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, AlertTriangle, RefreshCw, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type SelectOption = { value: number; label: string; sublabel?: string };

// Long lists (a tehsil can have hundreds of villages) are filtered as you type; only this many
// matches are rendered at once.
const MAX_RENDERED = 200;

interface SearchableSelectProps {
  label: string;
  options: SelectOption[];
  value: number | null;
  onChange: (option: SelectOption | null) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  strings: {
    placeholder: string;
    search: string;
    noMatches: string;
    loading: string;
    retry: string;
    showingFirst: string; // contains {n}
  };
  hint?: string;
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  disabled,
  loading,
  error,
  onRetry,
  strings,
  hint,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const selected = options.find((o) => o.value === value) ?? null;
  const isDisabled = disabled || loading || (!!error && !options.length);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.sublabel?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query]);
  const visible = matches.slice(0, MAX_RENDERED);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    inputRef.current?.focus();
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => setActive(0), [query, open]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (option: SelectOption) => {
    onChange(option);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (visible[active]) choose(visible[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2" ref={rootRef}>
      <label id={`${id}-label`} className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${id}-label`}
          className={cn(
            "w-full flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
            isDisabled ? "opacity-60 cursor-not-allowed" : "hover:border-emerald-300",
            open && "border-emerald-500 ring-2 ring-emerald-500/20",
          )}
        >
          <span className={cn("truncate", !selected && "text-gray-400")}>
            {loading ? strings.loading : selected ? selected.label : strings.placeholder}
          </span>
          {loading ? (
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
          ) : (
            <ChevronDown className={cn("w-4 h-4 text-gray-400 shrink-0 transition-transform", open && "rotate-180")} />
          )}
        </button>

        {open && (
          <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={strings.search}
                role="combobox"
                aria-expanded={open}
                aria-controls={`${id}-list`}
                aria-activedescendant={visible[active] ? `${id}-opt-${visible[active].value}` : undefined}
                className="w-full py-1.5 text-sm focus:outline-none"
              />
            </div>
            <ul id={`${id}-list`} ref={listRef} role="listbox" aria-labelledby={`${id}-label`} className="max-h-64 overflow-y-auto py-1">
              {visible.length === 0 && <li className="px-4 py-3 text-sm text-gray-400">{strings.noMatches}</li>}
              {visible.map((o, i) => (
                <li
                  key={o.value}
                  id={`${id}-opt-${o.value}`}
                  data-index={i}
                  role="option"
                  aria-selected={o.value === value}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(o)}
                  className={cn(
                    "px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between gap-2",
                    i === active ? "bg-emerald-50 text-emerald-900" : "text-gray-700",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{o.label}</span>
                    {o.sublabel && <span className="block truncate text-xs text-gray-400">{o.sublabel}</span>}
                  </span>
                  {o.value === value && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </li>
              ))}
            </ul>
            {matches.length > MAX_RENDERED && (
              <p className="px-4 py-2 text-[11px] text-gray-400 border-t border-gray-100">
                {strings.showingFirst.replace("{n}", String(MAX_RENDERED))}
              </p>
            )}
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          {onRetry && (
            <button type="button" onClick={onRetry} className="font-bold flex items-center gap-1 hover:underline shrink-0">
              <RefreshCw className="w-3 h-3" /> {strings.retry}
            </button>
          )}
        </div>
      ) : (
        hint && <p className="text-[11px] text-gray-400">{hint}</p>
      )}
    </div>
  );
}
