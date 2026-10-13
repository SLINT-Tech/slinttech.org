import { AlertCircle } from "lucide-react";
import {
  useId,
  useState,
  type FormEvent,
  type FormHTMLAttributes,
} from "react";

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export default function AppForm({
  children,
  onSubmit,
  onChange,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  const [errors, setErrors] = useState<string[]>([]);
  const errorId = useId();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = [...event.currentTarget.elements].filter(
      (field): field is Control =>
        field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement ||
        field instanceof HTMLTextAreaElement,
    );
    const invalid = fields.filter((field) => !field.validity.valid);
    for (const field of fields) {
      if (invalid.includes(field)) {
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-errormessage", errorId);
      } else {
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-errormessage");
      }
    }
    if (invalid.length) {
      setErrors(
        invalid.map((field) => {
          const name =
            field.labels?.[0]?.textContent?.replace("*", "").trim() ||
            field.getAttribute("aria-label") ||
            field.name ||
            "This field";
          if (field.validity.valueMissing)
            return `${name}: please fill in this field.`;
          if (field.validity.typeMismatch)
            return `${name}: enter a valid ${field.type === "email" ? "email address" : "value"}.`;
          if (field.validity.tooShort)
            return `${name}: use at least ${(field as HTMLInputElement).minLength} characters.`;
          return `${name}: check the value and try again.`;
        }),
      );
      invalid[0].focus();
      return;
    }
    setErrors([]);
    onSubmit?.(event);
  }
  return (
    <form
      {...props}
      noValidate
      onSubmit={submit}
      onChange={(event) => {
        const target = event.target;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLSelectElement ||
          target instanceof HTMLTextAreaElement
        ) {
          if (target.validity.valid) {
            target.removeAttribute("aria-invalid");
            target.removeAttribute("aria-errormessage");
          }
        }
        onChange?.(event);
      }}
    >
      {errors.length > 0 && (
        <div className="app-form-error" id={errorId} role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>Let’s check a few details.</strong>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {children}
    </form>
  );
}
