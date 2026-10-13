import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";
export default function PasswordInput(
  props: InputHTMLAttributes<HTMLInputElement>,
) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="app-password">
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        aria-label={`${visible ? "Hide" : "Show"} ${props.name === "confirmPassword" ? "confirmation password" : "password"}`}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
