import { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link,
  useNavigate
} from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PostPage from './pages/PostPage.jsx';
import './App.css';
import { getPosts, addPost as apiAddPost, deletePost as apiDeletePost } from './api.jsx';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [statusMessage, setStatusMessage] = useState('');
  const [posts, setPosts] = useState([]);
  const ADMIN_PASSWORD = "admin123";

  // Добавляем ID к существующим постам

useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await getPosts();
        setPosts(postsData);
      } catch (err) {
        console.error('Ошибка загрузки постов:', err);
      }
    };
    fetchPosts();
  }, []);
  const deletePost = async (postId) => {
  try {
    await apiDeletePost(postId);
    setPosts(prev => prev.filter(post => post._id !== postId));
    showStatus('Пост удален', 'success');
  } catch (err) {
    showStatus('Ошибка удаления', 'error');
  }
};

  const handleAddPost = async (newPost) => {
    try {
      const createdPost = await apiAddPost(newPost);
      setPosts(prev => [createdPost, ...prev]);
      showStatus('Пост успешно добавлен!', 'success');
    } catch (err) {
      showStatus('Ошибка при добавлении поста', 'error');
      console.error('Ошибка:', err);
    }
  };

  const handleAuth = (password) => {
  if (password === ADMIN_PASSWORD) {
    setIsAdmin(true);
    localStorage.setItem('isAdmin', 'true');
    return true;
  }
  return false;
  };

  const handleLogout = () => {
  setIsAdmin(false);
  localStorage.setItem('isAdmin', 'false');
  showStatus('Вы вышли из системы администратора', 'success');
};

  const showStatus = (message, type) => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const addPost = async (newPost) => {
  try {
    const createdPost = await apiAddPost(newPost); 
    setPosts(prev => [createdPost, ...prev]);
    showStatus('Пост успешно добавлен!', 'success');
  } catch (err) {
    showStatus('Ошибка при добавлении поста', 'error');
    console.error('Error adding post:', err);
  }
  };

  return (
    <Router>
      <div className="app-container">
        
        <Header 
          isAdmin={isAdmin} 
          handleLogout={handleLogout} 
          statusMessage={statusMessage}
        />
        
        <main className="container">
          <Routes>
            <Route path="/" element={<HomePage posts={posts} isAdmin={isAdmin} addPost={addPost} deletePost={deletePost} />} />
            <Route path="/post/:id" element={<PostPage posts={posts} />} />
            <Route path="/login" element={<LoginPage handleAuth={handleAuth} />} />
            
            <Route path="/admin" element={
              <ProtectedRoute isAdmin={isAdmin}>
                <AdminPage addPost={addPost} />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

const ProtectedRoute = ({ children, isAdmin }) => {
  return isAdmin ? children : <Navigate to="/login" replace />;
};

const Header = ({ isAdmin, handleLogout, statusMessage }) => {
  const navigate = useNavigate();
  
  return (
    <header>
      <button 
        className="auth-button" 
        onClick={isAdmin ? handleLogout : () => navigate('/login')}
      >
        {isAdmin ? 'Выйти' : 'Войти как администратор'}
      </button>

      <div className="logo-main">
        {'GameNew'.split('').map((char, index) => (
          <span key={index}>{char}</span>
        ))}
      </div>
      
      <nav>
        <ul>
          <li><Link to="/">Главная</Link></li>
          {isAdmin && <li><Link to="/admin">Админ-панель</Link></li>}
        </ul>
      </nav>

      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.message}
        </div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer>
    <p className="footer-text">GameNew © 2025 - Все права защищены</p>
  </footer>
);

export default App;