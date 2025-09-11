import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

export const getProducts = async (params = {}) => {
  console.log('Sending getProducts request with params:', params);
  const response = await api.get('products/', { params });
  console.log('getProducts response:', response);
  return response;
};

export const getCategories = async () => {
  console.log('Sending getCategories request');
  const response = await api.get('categories/');
  console.log('getCategories response:', response);
  return response;
};