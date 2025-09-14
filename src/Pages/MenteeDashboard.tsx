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
  mentor_profile?: {
    full_name: string;
    specialization: string | null;
  };
}

const MenteeDashboard: React.FC = () => {
  const { user, profile, loading, signOut, hasInitialData } = useAuth();
  const navigate = useNavigate();
  const [relationships, setRelationships] = useState<MentorMenteeRelationship[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(true);

  useEffect(() => {
    // Only redirect if auth is fully loaded and no user exists
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    // Only redirect if auth is fully loaded and user is not a mentee
    if (!loading && user && profile && profile.role !== 'Mentee') {
      navigate('/login');
      return;
    }

    // Check status and payment requirements only for authenticated mentees
    if (!loading && user && profile && profile.role === 'Mentee') {
      // Check if user needs approval
      if (profile.status === 'pending') {
        navigate('/pending-approval');
        return;
      }

      // Check if user needs to pay membership (only for approved users)
      if (profile.status === 'approved' && profile.membership_enabled && !profile.membership_paid) {
        navigate('/payment-wall');
        return;
      }

      // Fetch relationships for dashboard
      fetchMentorRelationships();
    }
  }, [user, profile, loading, navigate]);

  const fetchMentorRelationships = async () => {
    if (!user) return;

    try {
      console.log('Fetching mentor relationships for user:', user.id);
      const { data, error } = await supabase
        .from('mentor_mentee_relationships')
        .select(`
          *,
          mentor_profile:user_profiles!mentor_id (
            full_name,
            specialization
          )
        `)
        .eq('mentee_id', user.id)
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
    navigate('/login');
  };

  // Show loading skeleton only when auth is actually loading
  if (loading || loadingRelationships) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="min-h-screen bg-gray-50">
          {/* Header Skeleton */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Skeleton */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {/* Welcome Section Skeleton */}
              <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <div className="h-6 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
                </div>
              </div>

              {/* Quick Actions Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-blue-600 p-4 rounded-lg">
                    <div className="text-2xl mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded animate-pulse"></div>
                    </div>
                    <div className="h-5 bg-blue-500 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Mentor Relationships Skeleton */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                  
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
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
                Mentee Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {profile.full_name}
              </span>
              <button
                onClick={() => navigate('/profile')}
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
                Welcome to your learning journey!
              </h2>
              <p className="text-gray-600">
                Track your progress, connect with mentors, and access your learning materials.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => navigate('/lessons')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium">Lessons</div>
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">✅</div>
              <div className="font-medium">Tasks</div>
            </button>
            <button
              onClick={() => navigate('/mentors')}
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">Mentors</div>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium">Profile</div>
            </button>
          </div>

          {/* Mentor Relationships */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Mentors
              </h3>
              
              {loadingRelationships ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : relationships.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No mentors assigned yet.</p>
                  <button
                    onClick={() => navigate('/mentors')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Browse Mentors
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
                            {relationship.mentor_profile?.full_name || 'Unknown Mentor'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Course: {relationship.course_name}
                          </p>
                          {relationship.mentor_profile?.specialization && (
                            <p className="text-sm text-gray-500">
                              Specialization: {relationship.mentor_profile.specialization}
                            </p>
                          )}
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

export default MenteeDashboard;