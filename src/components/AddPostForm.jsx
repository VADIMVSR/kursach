import { useState, useEffect } from 'react';

const AddPostForm = ({ onAddPost }) => {
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    content: ''
  });
  
  // Добавляем состояния для превью
  const [imagePreview, setImagePreview] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  // Эффект для проверки изображения при изменении URL
  useEffect(() => {
    const checkImage = async () => {
      if (!formData.imageUrl) {
        setImagePreview('');
        return;
      }
      
      setIsImageLoading(true);
      setImageError('');
      
      try {
        const isValid = await validateImage(formData.imageUrl);
        if (isValid) {
          setImagePreview(formData.imageUrl);
          setImageError('');
        }
      } catch (err) {
        setImagePreview('');
        setImageError('Не удалось загрузить изображение');
      } finally {
        setIsImageLoading(false);
      }
    };

    const debounceTimer = setTimeout(checkImage, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.imageUrl]);

  // Функция проверки изображения
  const validateImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };
  
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  

  try {
    await onAddPost({
      title: formData.title.trim(),
      imageUrl: formData.imageUrl.trim(),
      excerpt: formData.content.trim().substring(0, 1000)
    });
    
    setFormData({
      title: '',
      imageUrl: '',
      content: ''
    });

  } catch (err) {
    console.error("Детали ошибки:", {
      response: err.response?.data,
      config: err.config
    });
    alert(err.response?.data?.error || "Ошибка соединения с сервером");
  }
};

  return (
    <section className="add-post-form">
      <h2 className="form-title">Добавить новую запись</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Заголовок</label>
          <input 
            type="text" 
            id="title"
            value={formData.title}
            onChange={handleChange}
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">Ссылка на изображение</label>
          <input 
            type="url" 
            id="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            required 
          />
          
          {/* Блок превью */}
          <div className="image-preview-container">
            {isImageLoading && (
              <div className="loading-spinner">Загрузка...</div>
            )}
            
            {!isImageLoading && imagePreview && (
              <img 
                src={imagePreview} 
                alt="Предпросмотр" 
                className="image-preview"
                onError={() => setImageError('Ошибка загрузки изображения')}
              />
            )}
            
            {!isImageLoading && imageError && (
              <div className="image-error">{imageError}</div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Содержание</label>
          <textarea 
            id="content"
            value={formData.content}
            onChange={handleChange}
            rows="5"
          ></textarea>
        </div>
        
        <button type="submit" className="submit-btn">Опубликовать</button>
      </form>
    </section>
  );
};

export default AddPostForm;