import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    console.log('Запрос списка пользователей');
    const users = await User.find().select('-password -refreshToken');
    res.json(users);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    console.log('Изменение роли пользователя:', { id: req.params.id, role });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -refreshToken');
    if (!user) {
      console.log('Пользователь не найден:', req.params.id);
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Ошибка изменения роли:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

export default router;