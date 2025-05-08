import { Link } from 'react-router-dom';

const PostsGrid = ({ posts }) => {
  return (
    <div className="posts-grid-wrapper" style={{ width: '100%' }}>
      {posts.map(post => (
        <article key={post.id} className="post-card">
          <img src={post.imageUrl} alt={post.title} className="post-image" />
          <div className="post-content">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-date">{post.date}</p>
            <p className="post-excerpt">
              {post.excerpt.length > 150 ? `${post.excerpt.substring(0, 150)}...` : post.excerpt}
            </p>
            <Link to={`/post/${post.id}`} className="read-more">Читать далее →</Link>
          </div>
        </article>
      ))}
    </div>
  );
};

export default PostsGrid;