import axios from "axios";

const API_URL = "http://localhost:3001";

export const getTodos = async (token) => {
  return axios.get(`${API_URL}/todos`, { headers: { Authorization: `Bearer ${token}` } });
};

export const addTodo = async (token, todo) => {
  return axios.post(`${API_URL}/todos`, todo, { headers: { Authorization: `Bearer ${token}` } });
};
