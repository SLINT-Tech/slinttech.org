import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface AdminRequest {
  action: 'list_users' | 'update_user_status' | 'delete_user' | 'get_user_stats';
  userId?: string;
  status?: string;
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  membershipCategory?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the requesting user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'Admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestData: AdminRequest = await req.json();

    switch (requestData.action) {
      case 'list_users': {
        const page = requestData.page || 1;
        const perPage = requestData.per_page || 10;
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage - 1;

        // Build query
        let query = supabaseAdmin
          .from('user_profiles')
          .select('*', { count: 'exact' });

        // Apply filters
        if (requestData.search) {
          query = query.or(`full_name.ilike.%${requestData.search}%,email.ilike.%${requestData.search}%`);
        }
        if (requestData.role && requestData.role !== 'all') {
          query = query.eq('role', requestData.role);
        }
        if (requestData.membershipCategory && requestData.membershipCategory !== 'all') {
          query = query.eq('membership_category', requestData.membershipCategory);
        }

        // Apply pagination and ordering
        const { data, error, count } = await query
          .range(startIndex, endIndex)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({ data, count }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'update_user_status': {
        if (!requestData.userId || !requestData.status) {
          return new Response(
            JSON.stringify({ error: 'User ID and status required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { error } = await supabaseAdmin
          .from('user_profiles')
          .update({ status: requestData.status })
          .eq('id', requestData.userId);

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'delete_user': {
        if (!requestData.userId) {
          return new Response(
            JSON.stringify({ error: 'User ID required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Delete from auth (this will cascade to user_profiles due to foreign key)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(requestData.userId);

        if (authError) {
          throw authError;
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'get_user_stats': {
        // Get user counts by role
        const { data: roleStats, error: roleError } = await supabaseAdmin
          .from('user_profiles')
          .select('role')
          .not('role', 'is', null);

        if (roleError) {
          throw roleError;
        }

        // Get user counts by status
        const { data: statusStats, error: statusError } = await supabaseAdmin
          .from('user_profiles')
          .select('status')
          .not('status', 'is', null);

        if (statusError) {
          throw statusError;
        }

        // Calculate stats
        const stats = {
          totalUsers: roleStats.length,
          mentors: roleStats.filter(u => u.role === 'Mentor').length,
          mentees: roleStats.filter(u => u.role === 'Mentee').length,
          admins: roleStats.filter(u => u.role === 'Admin').length,
          pending: statusStats.filter(u => u.status === 'pending').length,
          approved: statusStats.filter(u => u.status === 'approved').length,
          rejected: statusStats.filter(u => u.status === 'rejected').length
        };

        return new Response(
          JSON.stringify({ stats }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

  } catch (error) {
    console.error('Admin operation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});