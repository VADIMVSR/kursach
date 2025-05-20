import express from 'express';
import multer from 'multer';

const router = express.Router();

// Настройка хранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Эндпоинт для загрузки нескольких изображений
router.post('/upload', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Файлы не загружены" });
    }

    // Возвращаем URL'ы загруженных файлов (для клиента)
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ imageUrls });
  } catch (err) {
    console.error("Ошибка загрузки:", err);
    res.status(500).json({ error: "Ошибка загрузки файла" });
  }
});