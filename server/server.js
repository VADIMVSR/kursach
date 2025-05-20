import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { authMiddleware, adminMiddleware } from './middleware/auth.js';
import { deleteFiles } from './utils/fileHelpers.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Debug' 
  ],
  credentials: true,
}));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Эндпоинт загрузки
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files) return res.status(400).json({ error: 'Файлы не загружены' });
    
    const imageUrls = req.files.map(file => 
      `http://localhost:5001/uploads/${file.filename}`
    );
    
    res.json({ imageUrls });
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});




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
  mainImageUrl: {
    type: String,
    required: [true, "Основное изображение обязательно"],
    trim: true
  },
  gallery: [String],
  excerpt: { // Добавляем недостающее поле
    type: String,
    required: true,
    maxlength: [1000, "Максимальная длина содержания - 1000 символов"]
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  strict: "throw" // Оставляем строгий режим
});

const Post = mongoose.model('Post', PostSchema);



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
    const { title, mainImageUrl, excerpt, gallery } = req.body;
    
    const post = new Post({
      title,
      mainImageUrl,
      excerpt,
      gallery: gallery || [] // Гарантируем массив даже если поле отсутствует
    });

    await post.save();
    res.status(201).json(post);
    
  } catch (err) {
    console.error('Ошибка создания поста:', err);
    res.status(400).json({ 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : null
    });
  }
});
// В эндпоинте удаления поста
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    const filesToDelete = [
      post.mainImageUrl,
      ...(post.gallery || [])
    ].filter(Boolean);

    if (filesToDelete.length > 0) {
      const deleteResults = await deleteFiles(filesToDelete);
      const failedDeletions = deleteResults.filter(r => !r.success);
      
      if (failedDeletions.length > 0) {
        console.error('Не удалось удалить файлы:', failedDeletions);
      }
    }

    res.json({ success: true });
    
  } catch (err) {
    console.error("Ошибка удаления:", err);
    res.status(500).json({ 
      error: "Ошибка сервера",
      details: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
});

// Маршруты
app.use('/api/auth', authRoutes);

// Защищенный маршрут (пример)
app.get('/secret', authMiddleware, adminMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.set('Cache-Control', 'public, max-age=31536000');
  }
}));
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);
// Запуск сервера
const PORT = 5001;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));