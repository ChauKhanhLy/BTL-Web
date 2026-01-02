import { supabase } from '../database/supabase.js'

/**
 * Lấy tất cả user
 */
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  if (error) throw error
  return data
}



/**
 * Lấy user theo id
 */
export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Tạo user mới
 */
export const createUser = async (user) => {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
    .single()

  if (error) {
    console.error("SUPABASE ERROR DETAIL:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data
}

/**
 * Cập nhật user
 */
export const updateUser = async (id, user) => {
  const { data, error } = await supabase
    .from('users')
    .update(user)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Xoá user
 */
export const deleteUser = async (id) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

/**
 * Lấy user theo tên đăng nhập
 */
export const getUserByUsername = async (ten_dang_nhap) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('ten_dang_nhap', ten_dang_nhap)
    .maybeSingle()

  if (error) throw error
  return data
}


export const getUserByEmail = async (gmail) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("gmail", gmail)
    .single()

  if (error) throw error
  return data
}

export const getAllUsersByStatus = async (filters = {}) => {
  let query = supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    const statusMap = {
      verified: "Verified",
      unverified: "Unverified",
      suspended: "Locked",
    };
    if (statusMap[filters.status]) {
      query = query.eq("status", statusMap[filters.status]);
    }
  }

  if (filters.search && filters.search.trim() !== "") {
    const s = filters.search.trim();
    query = query.or(
      `name.ilike.%${s}%,gmail.ilike.%${s}%,sdt.ilike.%${s}%`
    );
  }


  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getUserStats = async () => {
  const { count: total } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { count: verified } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("status", "Verified");

  const { count: unverified } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("status", "Unverified");

  const { count: locked } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("status", "Locked");

  return { total, verified, unverified, locked };
};

export const updateUserStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("users")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};
