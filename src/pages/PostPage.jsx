import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const PostPage = ({ posts }) => {
  const { id } = useParams();
  const post = posts.find(p => p._id === id);

  if (!post) return <div className="error">Пост не найден</div>;

  const allImages = [post.mainImageUrl, ...(post.gallery || [])];

  return (
    <div className="container post-page-container">
      <article className="gothic-post single-post">
        <section className="main-image-section">
          <img 
            src={post.mainImageUrl}
            alt={post.title}
            className="main-post-image"
            onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
            }}
          />
        </section>

        <div className="post-content">
          <h1 className="post-title">{post.title}</h1>
          <p className="post-date">{new Date(post.date).toLocaleDateString()}</p>
          <p className="post-fulltext">{post.excerpt}</p>

          {allImages.length > 1 && (
            <div className="post-gallery">
              <h3>Галерея фотографий</h3>
              <div className="gallery-grid">
                {allImages.map((imgUrl, index) => (
                  <div key={index} className="gallery-item">
                    <img
                      src={imgUrl}
                      alt={`${post.title} - Фото ${index + 1}`}
                      className="gallery-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to="/" className="back-btn">← Назад к списку</Link>
        </div>
      </article>
    </div>
  );
};

export default PostPage;