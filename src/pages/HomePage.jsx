import { Link } from 'react-router-dom';
import PostsGrid from '../components/PostsGrid.jsx';
import AddPostForm from '../components/AddPostForm.jsx';

const HomePage = ({ posts, isAdmin, addPost, deletePost  }) => {
  return (
    <div className="container">
      <PostsGrid 
      posts={posts} 
      isAdmin={isAdmin} 
      deletePost={deletePost} 
      />
    </div>
  );
};

export default HomePage;