import { apiRequest } from './api';

export async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data;
}

export async function register(name, email, password) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  return data;
}
