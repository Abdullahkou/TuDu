import axios from "axios";

const API_URL = "http://localhost:3001";

export const register = async (user) => {
  return axios.post(`${API_URL}/auth/register`, user);
};

export const login = async (user) => {
  return axios.post(`${API_URL}/auth/login`, user);
};

export const getTodos = async (token) => {
  return axios.get(`${API_URL}/todos`, { headers: { Authorization: `Bearer ${token}` } });
};

export const addTodo = async (token, todo) => {
  return axios.post(`${API_URL}/todos`, todo, { headers: { Authorization: `Bearer ${token}` } });
};

export const updateTodo = async (token, id, todo) => {
  return axios.put(`${API_URL}/todos/${id}`, todo, { headers: { Authorization: `Bearer ${token}` } });
};

export const deleteTodo = async (token, id) => {
  return axios.delete(`${API_URL}/todos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
};

export const getGroups = async (token) => {
  return axios.get(`${API_URL}/todos/groups`, { headers: { Authorization: `Bearer ${token}` } });
};

export const createGroup = async (token, name) => {
  return axios.post(`${API_URL}/todos/groups`, { name }, { headers: { Authorization: `Bearer ${token}` } });
};

export const deleteGroup = async (token, id) => {
  return axios.delete(`${API_URL}/todos/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
};

export const updateGroup = async (token, id, data) => {
  return axios.put(`${API_URL}/todos/groups/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
};
