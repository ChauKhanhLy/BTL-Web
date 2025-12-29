const supabase = require('../database/supabase.js');

const feedbackDAL = {
  async getFeedbacks(filters) {
    let query = supabase
      .from('feedback')
      .select(`
        *,
        users (id, name, gmail),
        orders (id, date)
      `, { count: 'exact' });

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;
    return { feedbacks: data, total: count };
  },

  async getFeedbackById(id) {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        users (id, name, gmail, sdt),
        orders (id, date, price, currency)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateFeedback(id, updateData) {
    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }
};

module.exports = feedbackDAL;