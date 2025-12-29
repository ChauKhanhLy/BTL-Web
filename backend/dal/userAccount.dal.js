const supabase = require('../database/supabase.js');

const userDAL = {
  async getUsers(filters) {
    let query = supabase
      .from('users')
      .select('id, name, gmail, sdt, role, status, created_at', { count: 'exact' });

    // Apply Status Filter
    if (filters.status && filters.status !== 'all') {
      const statusMap = {
        verified: 'Verified',
        unverified: 'Unverified',
        suspended: 'Suspended'
      };
      query = query.eq('status', statusMap[filters.status] || filters.status);
    }
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`name.ilike.${searchTerm},gmail.ilike.${searchTerm},sdt.ilike.${searchTerm}`);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;
    return { users: data, total: count };
  },

  async getUserStats() {
    // Note: Supabase doesn't support easy "GROUP BY" via JS client without .rpc() 
    // For simplicity, we fetch counts individually or use a raw query if RPC is set up.
    // Here we use parallel requests for efficiency.
    
    const [total, verified, unverified, suspended] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'Verified'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'Unverified'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'Suspended')
    ]);

    return {
      total: total.count,
      verified: verified.count,
      unverified: unverified.count,
      suspended: suspended.count
    };
  },

  async updateUserStatus(userId, newStatus) {
    const { data, error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (error) throw error;
    return data[0];
  }
};

module.exports = userDAL;