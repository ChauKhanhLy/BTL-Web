import axiosClient from './axiosClient';

const userApi = {
  getAll: (params) => {
    return axiosClient.get('/users', { params });
  },
  updateStatus: (id, action) => {
    return axiosClient.put(`/users/${id}/status`, { action });
  },
  sendInvite: (id) => {
    return axiosClient.post(`/users/${id}/invite`);
  }
};

export default userApi;