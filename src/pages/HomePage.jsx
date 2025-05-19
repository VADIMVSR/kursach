import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ posts, isAdmin, addPost, deletePost }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [posts]);

  console.log('HomePage: posts:', posts);

  return (
    <div className="home-page">

      <div className="posts">
        {isLoading ? (
          <p>Загрузка постов...</p>
        ) : Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="post">
              <h2>{post.title || 'Без заголовка'}</h2>
              <p>{post.content ? post.content.substring(0, 100) : 'Контент отсутствует'}...</p>
              <Link to={`/post/${post._id}`}>Читать далее</Link>
              {isAdmin && (
                <button onClick={() => deletePost(post._id)}>Удалить</button>
              )}
            </div>
          ))
        ) : (
          <p>Посты отсутствуют</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;