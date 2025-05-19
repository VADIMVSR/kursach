import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

// Регистрация
router.post('/register', async (req, res) => {
  try {
    console.log('Тело запроса:', req.body); // Добавьте это для отладки
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }
    
    const existingUser = await User.findOne({ login });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }
    
    const user = new User({ login, password });
    await user.save();
    
    res.status(201).json({ message: 'Пользователь создан' });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      error: 'Ошибка регистрации',
      details: error.message 
    });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    console.log('Попытка входа:', { login });
    if (!login || !password) {
      console.log('Отсутствует login или password');
      return res.status(400).json({ error: 'Login and password are required' });
    }
    const user = await User.findOne({ login });
    if (!user) {
      console.log('Пользователь не найден:', login);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    console.log('Пароль верный:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    console.log('Успешный вход:', login);
    res.json(tokens);
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Обновление токенов
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
  try {
    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    res.json(tokens);
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Получение профиля пользователя
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    console.log('Запрос профиля, пользователь:', req.user);
    if (!req.user || !req.user._id) {
      console.log('Пользователь не найден в req.user');
      return res.status(401).json({ error: 'Invalid user data' });
    }
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    if (!user) {
      console.log('Пользователь не найден в базе:', req.user._id);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Профиль отправлен:', { login: user.login, role: user.role });
    res.json(user);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

export default router;