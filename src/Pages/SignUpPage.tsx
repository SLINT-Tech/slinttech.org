import {
  ArrowUpRight,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppForm from "../Components/AppForm";
import AuthLayout from "../Components/AuthLayout";
import PasswordInput from "../Components/PasswordInput";
import Toast from "../Components/Toast";
import { ApiError, apiPublicPost } from "../lib/api";
import { uploadContractToCloudinary } from "../lib/cloudinary";

const SignUpPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    membershipCategory: "",
    careerPath: "",
    role: "Mentee" as "Mentee" | "Mentor",
    contractFile: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setToast({
          message: "Invalid file type. Please upload a PDF file only.",
          type: "error",
        });
        e.target.value = "";
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setToast({
          message: "File too large. Maximum file size is 10MB.",
          type: "error",
        });
        e.target.value = "";
        return;
      }

      if (file.size === 0) {
        setToast({
          message: "Empty file detected. Please select a valid PDF file.",
          type: "error",
        });
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({
        ...prev,
        contractFile: file,
      }));

      setToast({
        message: "Contract file selected successfully!",
        type: "success",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.fullName.trim()) {
      setToast({
        message: "Please enter your full name.",
        type: "error",
      });
      return;
    }

    if (formData.fullName.trim().length < 2) {
      setToast({
        message: "Full name must be at least 2 characters long.",
        type: "error",
      });
      return;
    }

    if (!formData.email.trim()) {
      setToast({
        message: "Please enter your email address.",
        type: "error",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setToast({
        message: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    if (formData.password.length < 6) {
      setToast({
        message: "Password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      document.getElementById("signup-confirm")?.focus();
      setToast({
        message: "Passwords do not match. Please check and try again.",
        type: "error",
      });
      return;
    }

    if (!formData.membershipCategory) {
      setToast({
        message: "Please select a membership category.",
        type: "error",
      });
      return;
    }

    if (!formData.careerPath) {
      setToast({
        message: `Please select your ${formData.role === "Mentor" ? "specialization" : "career path"}.`,
        type: "error",
      });
      return;
    }

    if (!formData.contractFile) {
      setToast({
        message:
          "Please upload the signed membership agreement before submitting.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let data;
      try {
        data = await apiPublicPost("/auth/signup", {
          email: formData.email.trim(),
          password: formData.password,
          fullName: formData.fullName.trim(),
          membershipCategory: formData.membershipCategory,
          careerPath: formData.careerPath,
          role: formData.role,
          specialization:
            formData.role === "Mentor" ? formData.careerPath : null,
        });
      } catch (signupError) {
        const apiError = signupError as ApiError;
        throw new Error(
          apiError.details || apiError.message || "Registration failed",
        );
      }

      if (!data.userId) {
        throw new Error(
          "Account created but user ID was not returned. Please contact support.",
        );
      }

      setToast({
        message: "Account created! Uploading your contract...",
        type: "success",
      });

      let uploadResult;
      try {
        uploadResult = await uploadContractToCloudinary(
          formData.contractFile,
          data.userId,
        );
      } catch (uploadError) {
        console.error("Contract upload error:", uploadError);
        throw new Error(
          "Account created but contract upload failed. Please contact support with your email to complete registration.",
        );
      }

      if (!uploadResult.success) {
        throw new Error(
          uploadResult.error ||
            "Failed to upload contract. Please contact support to complete your registration.",
        );
      }

      try {
        await apiPublicPost("/auth/contract-file", {
          userId: data.userId,
          contractFileUrl: uploadResult.url,
        });
      } catch (updateError) {
        console.error("Profile update error:", updateError);
      }

      setToast({
        message:
          "Registration successful! Your account is under review. You will be notified once approved.",
        type: "success",
      });

      const userInfo = {
        id: data.userId,
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        membershipCategory: formData.membershipCategory,
        careerPath: formData.careerPath,
        role: formData.role,
        status: "pending",
        membershipPaid: false,
        contractFileUrl: uploadResult.url,
      };

      localStorage.setItem("currentUser", JSON.stringify(userInfo));

      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        membershipCategory: "",
        careerPath: "",
        role: "Mentee",
        contractFile: null,
      });

      const fileInput = document.getElementById(
        "contract-upload",
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      setTimeout(() => {
        navigate("/pending-approval");
      }, 2500);
    } catch (error) {
      console.error("Signup error:", error);
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout signup role={formData.role}>
      <div className="auth-form-heading">
        <span className="app-eyebrow">LET’S MAKE IT HAPPEN</span>
        <h1>
          Find your people<span>.</span>
        </h1>
        <p>
          Tell us a little about yourself. We’ll help you take the next step.
        </p>
      </div>
      <AppForm onSubmit={handleSubmit} aria-busy={isSubmitting}>
        {toast?.type === "error" && (
          <div className="app-form-error mt-5" role="alert">
            {toast.message}
          </div>
        )}
        <div className="signup-form-grid">
          <section>
            <h2 className="signup-section-heading">
              <span>1</span> A little about you
            </h2>
            <div className="signup-fields">
              <div className="app-field signup-field-full">
                <label htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                />
              </div>
              <div className="app-field signup-field-full">
                <label htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="app-field">
                <label htmlFor="signup-password">Password</label>
                <PasswordInput
                  id="signup-password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                />
              </div>
              <div className="app-field">
                <label htmlFor="signup-confirm">Confirm password</label>
                <PasswordInput
                  id="signup-confirm"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  aria-invalid={
                    toast?.message.startsWith("Passwords do not match") ||
                    undefined
                  }
                />
              </div>
            </div>
          </section>
          <section>
            <h2 className="signup-section-heading">
              <span>2</span> Your place in the community
            </h2>
            <div className="signup-fields">
              <div className="app-field">
                <label htmlFor="signup-role">I’m here to</label>
                <select
                  id="signup-role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Mentee">Learn as a mentee</option>
                  <option value="Mentor">Guide as a mentor</option>
                </select>
              </div>
              <div className="app-field">
                <label htmlFor="signup-membership">Membership category</label>
                <select
                  id="signup-membership"
                  name="membershipCategory"
                  value={formData.membershipCategory}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose your category</option>
                  <option value="Student">Student</option>
                  <option value="Professional">Professional</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>
              <div className="app-field signup-field-full">
                <label htmlFor="signup-career">
                  {formData.role === "Mentor"
                    ? "Your specialization"
                    : "Your career interest"}
                </label>
                <select
                  id="signup-career"
                  name="careerPath"
                  value={formData.careerPath}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">
                    {formData.role === "Mentor"
                      ? "Choose your specialization"
                      : "Choose a career path"}
                  </option>
                  {[
                    "Full Stack Development",
                    "Frontend Development",
                    "Backend Development",
                    "Mobile Development",
                    "Machine Learning/AI",
                    "Data Science",
                    "UI/UX Design",
                  ].map((path) => (
                    <option key={path} value={path}>
                      {path}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="signup-note">
              Our team reviews each application before approval. You’ll receive
              a notification once your registration is confirmed.
            </p>
          </section>
        </div>
        <section className="signup-contract">
          <h2 className="signup-section-heading">
            <span>3</span> Make it official
          </h2>
          <p>
            Download the membership agreement, read and sign it, then upload
            your signed PDF to complete your application.
          </p>
          <div className="signup-contract-actions">
            <a
              href="/documents/slint_tech_membership_agreement_and_contract.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="contract-download"
            >
              <span className="flex items-center gap-2">
                <FileText size={17} /> Download membership agreement
              </span>
              <Download size={17} />
            </a>
            <div className="contract-dropzone">
              <input
                id="contract-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                required
                aria-describedby="contract-help"
              />
              <label htmlFor="contract-upload">
                {formData.contractFile ? (
                  <CheckCircle size={24} />
                ) : (
                  <Upload size={24} />
                )}
                <strong>
                  {formData.contractFile
                    ? formData.contractFile.name
                    : "Choose your signed agreement"}
                </strong>
                <small id="contract-help">
                  {formData.contractFile
                    ? `${(formData.contractFile.size / 1024 / 1024).toFixed(2)} MB · Selected, ready to submit`
                    : "PDF only · Maximum 10 MB"}
                </small>
                {formData.contractFile && (
                  <small>Choose another file to replace it</small>
                )}
              </label>
            </div>
          </div>
        </section>
        <button
          type="submit"
          className="app-button signup-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Creating your
              account…
            </>
          ) : (
            <>
              Create your account <ArrowUpRight size={18} />
            </>
          )}
        </button>
      </AppForm>
      <div className="auth-form-bottom">
        Already part of the community?{" "}
        <Link to="/login">
          Log in <ArrowUpRight size={14} />
        </Link>
      </div>
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

export default SignUpPage;
