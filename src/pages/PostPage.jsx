import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const PostPage = ({ posts }) => {
  const { id } = useParams();
  
  // Проверка валидности ID
  const numericId = Number(id);
  if (isNaN(numericId)) {
    return <div className="error">Неверный идентификатор поста</div>;
  }

  const post = posts.find(p => p.id === numericId);

  if (!post) return <div className="error">Пост не найден</div>;

  return (
    <div className="container post-page-container">
      <article className="gothic-post single-post">
        <img src={post.imageUrl} alt={post.title} className="post-image" />
        <div className="post-content">
          <h1 className="post-title">{post.title}</h1>
          <p className="post-date">{post.date}</p>
          <p className="post-fulltext">{post.excerpt}</p>
          <Link to="/" className="back-btn">← Назад к списку</Link>
        </div>
      </article>
    </div>
  );
};

export default PostPage;