import { User } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { apiPost } from "../lib/api";
import AppForm from "./AppForm";
import PasswordInput from "./PasswordInput";

interface Props {
  onNotify: (notification: {
    message: string;
    type: "error" | "success";
  }) => void;
}

const emptyPasswords = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
const fields = [
  {
    name: "currentPassword",
    label: "Current Password",
    autoComplete: "current-password",
  },
  { name: "newPassword", label: "New Password", autoComplete: "new-password" },
  {
    name: "confirmPassword",
    label: "Confirm New Password",
    autoComplete: "new-password",
  },
] as const;

export default function PasswordSettings({ onNotify }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [updating, setUpdating] = useState(false);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (updating) return;
    if (passwords.newPassword !== passwords.confirmPassword) {
      onNotify({ message: "New passwords do not match!", type: "error" });
      return;
    }
    if (passwords.newPassword.length < 8) {
      onNotify({
        message: "Password must be at least 8 characters long!",
        type: "error",
      });
      return;
    }
    if (!localStorage.getItem("token")) {
      onNotify({ message: "Authentication required", type: "error" });
      return;
    }
    setUpdating(true);
    try {
      await apiPost("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      onNotify({ message: "Password updated successfully!", type: "success" });
      setOpen(false);
      setPasswords(emptyPasswords);
    } catch (error) {
      onNotify({
        message:
          error instanceof Error ? error.message : "Failed to update password",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Security
        </h2>
        <button
          type="button"
          disabled={updating}
          onClick={() => setOpen(!open)}
          className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium cursor-pointer transition-colors"
        >
          {open ? "Cancel" : "Change Password"}
        </button>
      </div>
      {open ? (
        <AppForm
          onSubmit={updatePassword}
          className="space-y-4"
          aria-busy={updating}
        >
          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={`${id}-${field.name}`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {field.label}
              </label>
              <PasswordInput
                id={`${id}-${field.name}`}
                name={field.name}
                autoComplete={field.autoComplete}
                value={passwords[field.name]}
                disabled={updating}
                onChange={(event) =>
                  setPasswords((previous) => ({
                    ...previous,
                    [field.name]: event.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 pr-10 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={updating}
            className="w-full bg-[#008080] dark:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {updating ? "Updating..." : "Update Password"}
          </button>
        </AppForm>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
            <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Click "Change Password" to update your password
          </p>
        </div>
      )}
    </section>
  );
}
