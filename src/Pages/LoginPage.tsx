import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../Components/AuthLayout";
import LoginForm from "../Components/LoginForm";
import Toast from "../Components/Toast";
import { ApiError, apiPublicPost } from "../lib/api";

const LoginPage = () => {
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
      } else if (
        currentUser.status === "approved" &&
        currentUser.membershipEnabled &&
        !currentUser.membershipPaid
      ) {
        navigate("/payment-wall");
      } else if (
        currentUser.status === "approved" ||
        currentUser.status === "pending"
      ) {
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
      let data;
      try {
        data = await apiPublicPost("/auth/login", {
          email: formData.email.trim(),
          password: formData.password,
        });
      } catch (loginError) {
        const apiError = loginError as ApiError;
        const data = apiError.data || {};
        if (
          apiError.status === 403 &&
          String(apiError.message).includes("pending approval")
        ) {
          const profile = data.profile;
          const userData = {
            id: profile.id,
            email: profile.email,
            fullName: profile.fullName || profile.full_name,
            membershipCategory:
              profile.membershipCategory || profile.membership_category,
            careerPath: profile.careerPath || profile.career_path,
            role: profile.role,
            status: "pending",
            specialization: profile.specialization,
            membershipEnabled:
              profile.membershipEnabled || profile.membership_enabled,
            membershipAmount:
              profile.membershipAmount || profile.membership_amount,
            membershipPaid: profile.membershipPaid || profile.membership_paid,
          };
          localStorage.setItem("currentUser", JSON.stringify(userData));
          if (data.token) {
            localStorage.setItem("token", data.token);
          }
          navigate("/dashboard");
          return;
        }
        throw loginError;
      }

      const profile = data.profile;
      const userData = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName || profile.full_name,
        membershipCategory:
          profile.membershipCategory || profile.membership_category,
        careerPath: profile.careerPath || profile.career_path,
        role: profile.role,
        status: profile.status,
        specialization: profile.specialization,
        membershipEnabled:
          profile.membershipEnabled || profile.membership_enabled,
        membershipAmount: profile.membershipAmount || profile.membership_amount,
        membershipPaid: profile.membershipPaid || profile.membership_paid,
        paymentReference: profile.paymentReference || profile.payment_reference,
        paymentDate: profile.paymentDate || profile.payment_date,
      };

      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("token", data.token);

      if (profile.status === "pending") {
        navigate("/dashboard");
        return;
      }

      if (profile.status === "rejected") {
        setToast({
          message: "Your account has been rejected. Please contact support.",
          type: "error",
        });
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        return;
      }

      if (profile.status === "suspended") {
        setToast({
          message: "Your account has been suspended. Please contact support.",
          type: "error",
        });
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        return;
      }

      if (data.requiresPayment) {
        navigate("/payment-wall");
        return;
      }

      if (profile.role === "Admin") {
        navigate("/admin/dashboard");
      } else if (profile.role === "Mentor") {
        navigate("/mentor/dashboard");
      } else {
        navigate("/dashboard");
      }
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
    <AuthLayout role="Mentee">
      <LoginForm
        role="Mentee"
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

export default LoginPage;
