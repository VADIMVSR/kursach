import { useState } from 'react';

const AddPostForm = ({ onAddPost, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    mainImageUrl: '',
    content: '',
    gallery: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [galleryUrlsInput, setGalleryUrlsInput] = useState('');
  const [urlErrors, setUrlErrors] = useState([]);

  const parseGalleryUrls = () => {
    const urls = galleryUrlsInput
      .split(/[\n,]+/)
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const validUrls = [];
    const invalidUrls = [];

    urls.forEach(url => {
      try {
        new URL(url);
        validUrls.push(url);
      } catch {
        invalidUrls.push(url);
      }
    });

    setUrlErrors(invalidUrls);
    return validUrls;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'manualImageUrl') {
      setManualImageUrl(value);
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const uploadImages = async (files) => {
    setIsUploading(true);
    const formDataUpload = new FormData();
    files.forEach(file => formDataUpload.append('images', file));

    try {
      const res = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Ошибка загрузки');

      const data = await res.json();
      const uploadedUrls = data.imageUrls || [];

      if (uploadedUrls.length > 0) {
        setImagePreviews(prev => [...prev, ...uploadedUrls]);
        setFormData(prev => ({
          ...prev,
          gallery: [...prev.gallery, ...uploadedUrls],
          mainImageUrl: prev.mainImageUrl || uploadedUrls[0]
        }));
      }
    } catch (err) {
      alert("Ошибка загрузки изображений: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    await uploadImages(files);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    await uploadImages(files);
  };

  const handleSelectMainImage = (url) => {
    setFormData(prev => ({
      ...prev,
      mainImageUrl: url,
      gallery: prev.gallery.filter(u => u !== url)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const galleryUrls = parseGalleryUrls();
    if (urlErrors.length > 0) {
      return alert('Исправьте некорректные URL перед отправкой');
    }

    if (!formData.title.trim() || !(manualImageUrl.trim() || formData.mainImageUrl.trim())) {
      return alert('Заполните обязательные поля: заголовок и основное изображение');
    }

    try {
      await onAddPost({
        title: formData.title.trim(),
        mainImageUrl: manualImageUrl.trim() || formData.mainImageUrl.trim(),
        excerpt: formData.content.trim().substring(0, 1000),
        gallery: [
          ...formData.gallery.filter(url => url !== formData.mainImageUrl),
          ...galleryUrls
        ],
        author: currentUser?._id
      });

      // Сброс формы
      setFormData({
        title: '',
        mainImageUrl: '',
        content: '',
        gallery: []
      });
      setManualImageUrl('');
      setGalleryUrlsInput('');
      setImagePreviews([]);
      setUrlErrors([]);

    } catch (err) {
      alert(err.response?.data?.error || "Ошибка отправки данных");
    }
  };

  return (
    <section className="add-post-form">
      <h2>Добавить новую запись</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Заголовок *</label>
          <input 
            type="text" 
            id="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
            placeholder="Введите заголовок поста"
          />
        </div>

        <div className="form-group">
          <label htmlFor="manualImageUrl">Основное изображение (URL) *</label>
          <input 
            type="url"
            id="manualImageUrl"
            value={manualImageUrl}
            onChange={handleChange}
            placeholder="https://example.com/main-image.jpg"
          />
        </div>

        <div className="form-group">
          <label>Или загрузите изображения:</label>
          <div 
            className={`dropzone ${isUploading ? 'uploading' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {isUploading ? (
              <div className="upload-progress">Загрузка...</div>
            ) : (
              <>
                <p>Перетащите файлы сюда или кликните</p>
                <p className="hint">(максимум 10 файлов, до 10MB каждый)</p>
              </>
            )}
            <input 
              type="file" 
              id="fileInput"
              multiple 
              accept="image/jpeg, image/png, image/gif"
              onChange={handleFileSelect}
              hidden 
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="galleryUrls">
            Ссылки на изображения для галереи (через запятую или с новой строки)
          </label>
          <textarea
            id="galleryUrls"
            rows="3"
            value={galleryUrlsInput}
            onChange={(e) => setGalleryUrlsInput(e.target.value)}
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          />
          {urlErrors.length > 0 && (
            <div className="error-message">
              Некорректные URL: {urlErrors.join(', ')}
            </div>
          )}
        </div>

        {imagePreviews.length > 0 && (
          <div className="form-group">
            <label>Выберите основное изображение из загруженных:</label>
            <div className="preview-grid">
              {imagePreviews.map((url, i) => (
                <div key={i} className="preview-item">
                  <img 
                    src={url} 
                    alt={`preview-${i}`} 
                    className={`preview-image ${formData.mainImageUrl === url ? 'selected' : ''}`}
                    onClick={() => handleSelectMainImage(url)}
                  />
                  {formData.mainImageUrl === url && (
                    <div className="main-badge">Основное</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="content">Содержание *</label>
          <textarea 
            id="content" 
            rows="5" 
            value={formData.content} 
            onChange={handleChange} 
            required
            placeholder="Введите текст поста (максимум 1000 символов)"
          />
          <div className="char-counter">
            {formData.content.length}/1000 символов
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isUploading}
          className="submit-btn"
        >
          {isUploading ? (
            <>
              <span className="spinner"></span> Публикация...
            </>
          ) : (
            'Опубликовать'
          )}
        </button>
      </form>
    </section>
  );
};

export default AddPostForm;