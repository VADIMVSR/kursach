import { Link } from 'react-router-dom';
import PostsGrid from '../components/PostsGrid';
import AddPostForm from '../components/AddPostForm';

const HomePage = ({ posts, isAdmin, addPost }) => {
  return (
    <div className="container">
      <PostsGrid posts={posts} />
    </div>
  );
};

export default HomePage;