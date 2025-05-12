import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api'
});

// Получение постов
export const getPosts = async () => {
  try {
    const response = await api.get('/posts');
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки постов:", error);
    return [];
  }
};

// Добавление поста
export const addPost = async (postData) => {
  try {
    const response = await api.post('/posts', {
      ...postData,
      id: Date.now()
    });
    if (!response.data) {
      throw new Error('Сервер не вернул данные');
    }
    return response.data;
  } catch (err) {
    console.error('Ошибка добавления поста:', err);
    throw err;
  }
};

// Удаление поста
export const deletePost = async (id) => {
  if (!id) {
    console.error("deletePost получил пустой id!");
    return;
  }

  try {
    await api.delete(`/posts/${id}`);
    console.log(`Пост с id ${id} удалён.`);
  } catch (error) {
    console.error('Ошибка удаления:', error);
  }
};
