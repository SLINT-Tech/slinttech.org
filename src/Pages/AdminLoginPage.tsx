import { ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../Components/Toast';
import AuthLayout from '../Components/AuthLayout';
import LoginForm from '../Components/LoginForm';
import { apiPost } from '../lib/api';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success'; } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (token && currentUser.role) {
      if (currentUser.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (currentUser.role === 'Mentor') {
        navigate('/mentor/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiPost('/admin-login', {
        email: formData.email.trim(),
        password: formData.password,
      }, { skipAuth: true });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const profile = data.profile;

      const userData = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName || profile.full_name,
        membershipCategory: profile.membershipCategory || profile.membership_category,
        careerPath: profile.careerPath || profile.career_path,
        role: profile.role,
        status: profile.status,
        specialization: profile.specialization,
        membershipEnabled: profile.membershipEnabled || profile.membership_enabled,
        membershipAmount: profile.membershipAmount || profile.membership_amount,
        membershipPaid: profile.membershipPaid || profile.membership_paid,
        paymentReference: profile.paymentReference || profile.payment_reference,
        paymentDate: profile.paymentDate || profile.payment_date,
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('token', data.token);

      navigate('/admin/dashboard');
    } catch (error: any) {
      setToast({
        message: error.message || 'Login failed. Please check your credentials.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <LoginForm
        roleLabel="Admin"
        RoleIcon={ShieldCheck}
        subtitle="Sign in to the SLINT Tech admin dashboard."
        email={formData.email}
        password={formData.password}
        isSubmitting={isSubmitting}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
      />

      {toast && (
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