import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { authMiddleware, adminMiddleware } from './middleware/auth.js';
const app = express();

// Подключение MongoDB
mongoose.connect('mongodb://admin:securepassword@localhost:27017/blog?authSource=admin')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Схема поста
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Заголовок обязателен"],
    trim: true,
    minlength: [3, "Минимальная длина заголовка - 3 символа"]
  },
  imageUrl: {
  type: String,
  required: [true, "Ссылка на изображение обязательна"],
  validate: {
    validator: v => /^.*$/i.test(v), // Разрешает любые значения
    message: "Некорректный URL изображения"
  }
  },
  excerpt: {
    type: String,
    maxlength: [1000, "Максимальная длина содержания - 1000 символов"]
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  strict: "throw"
});

const Post = mongoose.model('Post', PostSchema);

app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'], // Разрешаем оба порта
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/api/posts', async (req, res) => {
  try {
    console.log("Попытка получить посты из БД...");
    
    const posts = await Post.find().sort({ date: -1 });
    
    if (!posts || posts.length === 0) {
      console.log("В базе нет постов");
      return res.status(404).json({ error: "Посты не найдены" });
    }

    console.log("Успешно получено постов:", posts.length);
    res.json(posts);

  } catch (err) {
    console.error("Ошибка при запросе к БД:", err);
    res.status(500).json({ 
      error: "Ошибка сервера",
      details: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
});
app.delete('/api/posts/:id', async (req, res) => {
  try {
    // Используем ObjectId для поиска
    const result = await Post.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: "Пост не найден" });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error("Ошибка удаления:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
// Эндпоинт для создания поста
app.post('/api/posts', async (req, res) => {
  try {
    console.log("Полученные данные:", req.body);
    
    // Валидация тела запроса
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Неверный формат данных" });
    }

    const newPost = new Post({
      title: req.body.title?.trim(),
      imageUrl: req.body.imageUrl?.trim(),
      excerpt: req.body.excerpt?.trim() || ""
    });

    // Валидация перед сохранением
    const validationError = newPost.validateSync();
    if (validationError) {
      console.error("Ошибка валидации:", validationError);
      return res.status(400).json({ 
        error: "Ошибка валидации",
        details: validationError.errors 
      });
    }

    const savedPost = await newPost.save();
    console.log("Успешно сохранен пост:", savedPost);

    res.status(201).json({
      id: savedPost._id,
      ...savedPost.toObject()
    });

  } catch (err) {
    console.error("Критическая ошибка:", err);
    res.status(500).json({
      error: "Внутренняя ошибка сервера",
      ...(process.env.NODE_ENV === "development" && {
        message: err.message,
        stack: err.stack
      })
    });
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Маршруты
app.use('/api/auth', authRoutes);

// Защищенный маршрут (пример)
app.get('/secret', authMiddleware, adminMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);
// Запуск сервера
const PORT = 5001;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));