import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import PostPage from './pages/PostPage.jsx';
import './App.css';
import BannedPage from './pages/BannedPage.jsx';
import { getPosts, addPost as apiAddPost, deletePost as apiDeletePost } from './api.jsx';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [statusMessage, setStatusMessage] = useState('');
  const [posts, setPosts] = useState([]);

  // Синхронизация состояния с localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Загрузка постов
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await getPosts();
        console.log('Получены посты:', postsData);
        setPosts(postsData);
      } catch (err) {
        console.error('Ошибка загрузки постов:', err);
        setPosts([]); // Устанавливаем пустой массив при ошибке
      }
    };
    fetchPosts();
  }, []);

  const deletePost = async (postId) => {
    try {
      await apiDeletePost(postId);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      showStatus('Пост удален', 'success');
    } catch (err) {
      showStatus('Ошибка удаления', 'error');
    }
  };

  const handleAddPost = async (newPost) => {
    try {
      const createdPost = await apiAddPost(newPost);
      setPosts((prev) => [createdPost, ...prev]);
      showStatus('Пост успешно добавлен!', 'success');
    } catch (err) {
      showStatus('Ошибка при добавлении поста', 'error');
      console.error('Ошибка:', err);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsAuthenticated(false);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    showStatus('Вы вышли из системы', 'success');
  };

  const showStatus = (message, type) => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <Router>
      <div className="app-container">
        <Header
          isAdmin={isAdmin}
          isAuthenticated={isAuthenticated}
          handleLogout={handleLogout}
          statusMessage={statusMessage}
        />
        <main className="container">
          <Routes>
            <Route
              path="/"
              element={<HomePage posts={posts} isAdmin={isAdmin} addPost={handleAddPost} deletePost={deletePost} />}
            />
            <Route path="/post/:id" element={<PostPage posts={posts} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/banned" element={<BannedPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute isAdmin={isAdmin}>
                  <AdminPage addPost={handleAddPost} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute isAdmin={isAdmin}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
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

const Header = ({ isAdmin, isAuthenticated, handleLogout, statusMessage }) => {
  const navigate = useNavigate();
  return (
    <header>
      <button
        className="auth-button"
        onClick={isAuthenticated ? handleLogout : () => navigate('/login')}
      >
        {isAuthenticated ? 'Выйти' : 'Войти как администратор'}
      </button>
      {!isAuthenticated && (
        <button className="register-button" onClick={() => navigate('/register')}>
          Регистрация
        </button>
      )}
      <div className="logo-main">
        {'GameNew'.split('').map((char, index) => (
          <span key={index}>{char}</span>
        ))}
      </div>
      <nav>
        <ul
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            padding: 0,
            listStyle: 'none',
          }}
        >
          <li>
            <Link to="/" className="gothic-nav-link">
              Главная
            </Link>
          </li>
          {isAdmin && isAuthenticated && (
            <>
              <li>
                <Link to="/admin" className="gothic-nav-link">
                  Админ-панель
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className="gothic-nav-link">
                  Управление пользователями
                </Link>
              </li>
            </>
          )}
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