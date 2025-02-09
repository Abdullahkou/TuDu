import axios from "axios";

const API_URL = "http://localhost:3001";

export const registerUser = async (user) => {
  return axios.post(`${API_URL}/auth/register`, user);
};

export const loginUser = async (user) => {
  return axios.post(`${API_URL}/auth/login`, user);
};


export const getTodos = async (token) => {
  return axios.get(`${API_URL}/todos`, { headers: { Authorization: `Bearer ${token}` } });
};

export const addTodo = async (token, todo) => {
  return axios.post(`${API_URL}/todos`, todo, { headers: { Authorization: `Bearer ${token}` } });
};

export const deleteTodo = async (token, id) => {
  return axios.delete(`${API_URL}/todos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
};


