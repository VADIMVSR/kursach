import { useState, useEffect } from 'react';
import { Link, Route } from 'react-router-dom';
import PostsGrid from './pages/PostsGrid.jsx';

const HomePage = ({ posts, isAdmin, addPost, deletePost }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [posts]);

  console.log('HomePage: posts:', posts);

  return (
    <div className="home-page">
      <Route
              path="/"
              element={<PostsGrid posts={posts} isAdmin={isAdmin} addPost={handleAddPost} deletePost={deletePost} />}
            />
    </div>
  );
};

export default HomePage;