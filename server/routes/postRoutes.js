import express from 'express';
import Post from '../models/Post.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Получение всех постов
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    console.log('Отправлены посты:', posts);
    res.json(posts);
  } catch (error) {
    console.error('Ошибка получения постов:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Создание поста (только для админов)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
        const { title, mainImageUrl, excerpt, gallery } = req.body;
    
    const post = new Post({
      title,
      mainImageUrl,
      excerpt,
      gallery: Array.isArray(gallery) ? gallery : []
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Ошибка создания поста:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Удаление поста (только для админов)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Ошибка удаления поста:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;