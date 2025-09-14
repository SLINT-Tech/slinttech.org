import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface MentorMenteeRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  course_name: string;
  status: string;
  assigned_date: string;
  completion_date: string | null;
  progress_percentage: number;
  notes: string | null;
  mentee_profile?: {
    full_name: string;
    email: string;
  };
}

const MentorDashboard: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [relationships, setRelationships] = useState<MentorMenteeRelationship[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(true);

  // Check if we have initial data from localStorage
  const hasInitialData = React.useMemo(() => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        return userData.role === 'Mentor' && userData.id;
      }
    } catch (error) {
      console.error('Error checking localStorage:', error);
    }
    return false;
  }, []);

  useEffect(() => {
    // If we have initial data from localStorage, show dashboard immediately
    if (hasInitialData && !loading) {
      console.log('Using cached mentor data, skipping auth wait');
      if (user && profile) {
        fetchMentorRelationships();
      }
      return;
    }

    if (!loading && !user) {
      console.log('No user found, redirecting to mentor login');
      navigate('/mentor/login');
      return;
    }

    if (!loading && user && profile) {
      // Verify user is a mentor
      if (profile.role !== 'Mentor') {
        console.log('User is not a mentor, redirecting to mentor login');
        navigate('/mentor/login');
        return;
      }

      fetchMentorRelationships();
    }
  }, [user, profile, loading, navigate, hasInitialData]);

  const fetchMentorRelationships = async () => {
    if (!user) return;

    try {
      console.log('Fetching mentor relationships for user:', user.id);
      const { data, error } = await supabase
        .from('mentor_mentee_relationships')
        .select(`
          *,
          mentee_profile:user_profiles!mentee_id (
            full_name,
            email
          )
        `)
        .eq('mentor_id', user.id)
        .order('assigned_date', { ascending: false });

      if (error) {
        console.error('Error fetching mentor relationships:', error);
      } else {
        console.log('Mentor relationships fetched successfully:', data?.length || 0);
        setRelationships(data || []);
      }

    } catch (error) {
      console.error('Error fetching mentor relationships:', error);
    } finally {
      console.log('Setting loadingRelationships to false');
      setLoadingRelationships(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/mentor/login');
  };

  // Show loading only if we don't have initial data and auth is still loading
  if (loading && !hasInitialData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Check if user needs approval
  if (profile.status === 'pending') {
    navigate('/pending-approval');
    return null;
  }

  // Check if user needs to pay membership
  if (profile.membership_enabled && !profile.membership_paid) {
    navigate('/payment-wall');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Mentor Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {profile.full_name}
              </span>
              <button
                onClick={() => navigate('/mentor/profile')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to your mentor dashboard!
              </h2>
              <p className="text-gray-600">
                Manage your mentees, create courses, and track progress.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => navigate('/mentor/mentees')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">My Mentees</div>
            </button>
            <button
              onClick={() => navigate('/mentor/courses')}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium">Courses</div>
            </button>
            <button
              onClick={() => navigate('/mentor/submissions')}
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">Submissions</div>
            </button>
            <button
              onClick={() => navigate('/mentor/profile')}
              className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium">Profile</div>
            </button>
          </div>

          {/* Mentee Relationships */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Mentees
              </h3>
              
              {loadingRelationships ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : relationships.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No mentees assigned yet.</p>
                  <button
                    onClick={() => navigate('/mentor/mentees')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Manage Mentees
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {relationships.map((relationship) => (
                    <div
                      key={relationship.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {relationship.mentee_profile?.full_name || 'Unknown Mentee'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Course: {relationship.course_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Email: {relationship.mentee_profile?.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            relationship.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : relationship.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {relationship.status}
                          </span>
                          <div className="mt-2">
                            <div className="text-sm text-gray-600">
                              Progress: {relationship.progress_percentage}%
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${relationship.progress_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;