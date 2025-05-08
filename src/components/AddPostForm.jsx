import { useState } from 'react';

const AddPostForm = ({ onAddPost }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddPost({
      title,
      imageUrl,
      date: new Date().toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      excerpt: content
    });
    setTitle('');
    setImageUrl('');
    setContent('');
  };

  return (
    <section className="add-post-form">
      <h2 className="form-title">Добавить новую запись</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title">Заголовок</label>
          <input 
            type="text" 
            id="post-title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="post-image">Ссылка на изображение</label>
          <input 
            type="url" 
            id="post-image" 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="post-content">Содержание</label>
          <textarea 
            id="post-content" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="5"
          ></textarea>
        </div>
        
        <button type="submit" className="submit-btn">Опубликовать</button>
      </form>
    </section>
  );
};

export default AddPostForm;