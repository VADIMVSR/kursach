import axios from 'axios';

// Создаем экземпляр Axios с базовым URL
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерсептор для обработки ошибок ответа
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log('Попытка обновления токена');
        const { data } = await refreshToken();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Ошибка обновления токена:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Аутентификация
export const register = (data) => {
  console.log('Вызов register с данными:', data);
  return api.post('/auth/register', data);
};

export const login = (data) => {
  console.log('Вызов login с данными:', data);
  return api.post('/auth/login', data);
};

export const refreshToken = () => {
  console.log('Вызов refreshToken');
  return api.post('/auth/refresh', {
    refreshToken: localStorage.getItem('refreshToken'),
  });
};

export const getProfile = () => {
  console.log('Вызов getProfile');
  return api.get('/auth/profile');
};

// Посты
export const getPosts = async () => {
  console.log('Вызов getPosts');
  try {
    const response = await api.get('/posts');
    // Убедимся, что возвращается массив
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Ошибка в getPosts:', error);
    return [];
  }
};

export const addPost = (data) => {
  console.log('Вызов addPost с данными:', data);
  return api.post('/posts', data);
};

export const deletePost = (id) => {
  console.log('Вызов deletePost с id:', id);
  return api.delete(`/posts/${id}`);
};

// Админ
export const getUsers = () => {
  console.log('Вызов getUsers');
  return api.get('/admin/users');
};

export const updateUserRole = (id, role) => {
  console.log('Вызов updateUserRole с данными:', { id, role });
  return api.put(`/admin/users/${id}/role`, { role });
};