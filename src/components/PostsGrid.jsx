import { Link } from 'react-router-dom';

const PostsGrid = ({ posts, isAdmin, deletePost }) => {
  // Добавляем проверку на наличие постов
  if (!posts || posts.length === 0) {
    return <div className="empty-posts">Нет доступных записей</div>;
  }

  return (
    <div className="posts-grid-wrapper" style={{ width: '100%' }}>
      {posts
        .filter(post => post) // Фильтруем undefined элементы
        .map(post => (
          <article key={post._id || post.id} className="post-card">
            {isAdmin && (
              <button
              className="delete-post-btn"
              onClick={() => deletePost(post._id)}
              aria-label="Удалить пост"
              >
                ×
              </button>
            )}
            {/* Добавляем значение по умолчанию для изображения */}
            <img 
              src={post.mainImageUrl || '/placeholder-image.jpg'} 
              alt={post.title || 'Без названия'} 
              className="post-image" 
            />
            <div className="post-content">
              <h3 className="post-title">{post.title || 'Новая запись'}</h3>
              <p className="post-date">{post.date || 'Дата не указана'}</p>
              <p className="post-excerpt">
                {post.excerpt 
                  ? post.excerpt.length > 150 
                    ? `${post.excerpt.substring(0, 150)}...` 
                    : post.excerpt
                  : 'Нет содержимого'}
              </p>
              <Link to={`/post/${post._id}`} className="read-more">
                Читать далее →
              </Link>
            </div>
          </article>
        ))}
    </div>
  );
};

export default PostsGrid;