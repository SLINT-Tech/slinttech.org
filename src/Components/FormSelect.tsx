import { Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { useId, useRef, useState, type KeyboardEvent } from 'react';

export interface FormSelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface FormSelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: FormSelectOption<T>[];
  placeholder?: string;
  required?: boolean;
}

const FormSelect = <T extends string>({ label, value, onChange, options, placeholder, required = false }: FormSelectProps<T>) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find(option => option.value === value);
  const errorId = useId();
  const [showRequiredError, setShowRequiredError] = useState(false);
  const isMissing = required && showRequiredError && !value;

  return (
    <Field className="relative">
      <Label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
        {label}{required && ' *'}
      </Label>
      <Listbox
        value={value}
        onChange={(next: T) => {
          setShowRequiredError(false);
          onChange(next);
        }}
      >
        <ListboxButton
          ref={buttonRef}
          aria-invalid={isMissing || undefined}
          aria-describedby={isMissing ? errorId : undefined}
          // Safari skips buttons on Tab by default but reached the native <select>; an explicit tabIndex keeps it in the order.
          tabIndex={0}
          onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
            // Headless UI submits the form on Enter. A native <select> never did, so open the list instead.
            // Re-dispatching ArrowDown uses Headless UI's own open path; a scripted click is ignored after mouse use.
            if (event.key !== 'Enter') return;
            event.preventDefault();
            event.currentTarget.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
          }}
          className="group relative flex min-h-12 w-full items-center py-2.5 rounded-lg border border-gray-300 bg-white pl-4 pr-11 text-left text-base text-gray-900 transition-colors focus:border-[#008080] focus:outline-none focus:ring-2 focus:ring-[#008080]/20 data-open:border-[#008080] data-open:ring-2 data-open:ring-[#008080]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/20 dark:data-open:border-teal-400 dark:data-open:ring-teal-400/20 cursor-pointer"
        >
          <span className={`block break-words ${selectedOption ? '' : 'text-gray-500 dark:text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 transition-transform duration-200 group-data-open:rotate-180 motion-reduce:transition-none dark:text-gray-400"
          />
        </ListboxButton>
        <ListboxOptions
          aria-label={label}
          anchor={{ to: 'bottom start', gap: 4, padding: 8 }}
          transition
          className="z-50 w-(--button-width) max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg focus:outline-none transition duration-100 ease-out data-closed:opacity-0 motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-800"
        >
          {options.map(option => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2.5 text-base text-gray-900 data-focus:bg-[#008080]/10 data-focus:text-[#006666] data-selected:font-medium dark:text-gray-100 dark:data-focus:bg-teal-400/15 dark:data-focus:text-teal-200"
            >
              <span className="flex-1 break-words">{option.label}</span>
              <Check
                aria-hidden="true"
                className="invisible h-5 w-5 shrink-0 text-[#008080] group-data-selected:visible dark:text-teal-400"
              />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
      {required && (
        /*
          Listbox submits through a hidden input, which the browser never validates.
          This proxy keeps the native "required" check the plain <select> had, and
          hands focus to the trigger when the browser flags it.
        */
        <select
          tabIndex={-1}
          aria-hidden="true"
          required
          value={value}
          onChange={() => undefined}
          onInvalid={() => setShowRequiredError(true)}
          onFocus={() => buttonRef.current?.focus()}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
        >
          <option value="" />
          {options.map(option => (
            <option key={option.value} value={option.value} />
          ))}
        </select>
      )}
      {isMissing && (
        <p id={errorId} className="mt-1.5 text-sm text-red-700 dark:text-red-400">
          Please choose an option.
        </p>
      )}
    </Field>
  );
};

export default FormSelect;
