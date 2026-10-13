import { toSessionProfile } from "../lib/sessionProfile";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../Components/AuthLayout";
import LoginForm from "../Components/LoginForm";
import Toast from "../Components/Toast";
import { apiPublicPost } from "../lib/api";

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    if (token && currentUser.role) {
      if (currentUser.role === "Admin") {
        navigate("/admin/dashboard");
      } else if (currentUser.role === "Mentor") {
        navigate("/mentor/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setToast(null);
    setIsSubmitting(true);

    try {
      const data = await apiPublicPost("/admin/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const profile = data.profile;

      const userData = toSessionProfile(profile);

      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("token", data.token);

      navigate("/admin/dashboard");
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Login failed. Please check your credentials.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout role="Admin">
      <LoginForm
        role="Admin"
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={toast?.type === "error" ? toast.message : undefined}
      />
      {toast?.type === "success" && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthLayout>
  );
};

export default AdminLoginPage;
