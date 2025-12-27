const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- USER MANAGEMENT ---

exports.getUsers = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = supabase.from('users').select('*', { count: 'exact' });

        // Filter by Status (Verified, Unverified, Suspended)
        if (status && status !== 'all') {
            // Capitalize first letter to match DB constraint
            const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
            query = query.eq('status', formattedStatus);
        }

        // Search by Name, Gmail, or Phone (sdt)
        if (search) {
            query = query.or(`name.ilike.%${search}%,gmail.ilike.%${search}%,sdt.ilike.%${search}%`);
        }

        const { data, error, count } = await query;

        // Get counts for the dashboard stats
        const { count: total } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: verified } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'Verified');
        const { count: unverified } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'Unverified');
        const { count: suspended } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'Suspended');

        if (error) throw error;

        // Map DB columns (gmail, sdt) to Frontend keys (email, phone)
        const formattedUsers = data.map(u => ({
            ...u,
            email: u.gmail,
            phone: u.sdt
        }));

        res.json({ users: formattedUsers, stats: { total, verified, unverified, suspended } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Verified', 'Suspended'
        
        const { data, error } = await supabase
            .from('users')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- FEEDBACK MANAGEMENT ---

exports.getFeedbacks = async (req, res) => {
    try {
        const { search } = req.query;
        
        // Join with users table to get the customer name from user_id
        let query = supabase
            .from('feedback')
            .select(`
                *,
                users ( name, gmail )
            `)
            .order('created_at', { ascending: false });

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Transform data to match Frontend structure
        const formattedFeedbacks = data.map(f => ({
            id: f.id,
            title: f.title || 'No Title',
            type: f.type || 'Issue',
            status: f.status || 'New',
            created_at: f.created_at,
            order_ref: f.orderId,
            rating: f.rating,
            content: f.comment,
            customer_name: f.users?.name || 'Anonymous',
            internal_note: f.internal_note,
            reply_text: f.reply_text
        }));

        res.json(formattedFeedbacks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resolveFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const { data, error } = await supabase
            .from('feedback')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.replyFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { replyText } = req.body;
        
        const { data, error } = await supabase
            .from('feedback')
            .update({ reply_text: replyText, status: 'Resolved' })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};