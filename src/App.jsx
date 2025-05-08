import { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link,
  useNavigate
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import PostPage from './pages/PostPage';
import './App.css';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [statusMessage, setStatusMessage] = useState('');
    const [posts, setPosts] = useState([ // Массив постов
    {
      id:1,
      title: 'Новый трейлер Cyberpunk 2077: Phantom Liberty',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      date: '15 октября 2024',
      excerpt: 'CD Projekt Red представила новый трейлер долгожданного дополнения Phantom Liberty...'
    },
    {
      id:2,
      title: 'Apex побил рекорды по количеству игроков',
      imageUrl: 'https://i.playground.ru/p/kdLZzYjvpiA_MNnbWxP-Yw.jpeg',
      date: '6 мая 2025',
      excerpt: 'В новом сезоне вас ждет обновленный BattlePass...'
    },
    {
      id:3,
      title: 'В Apex стартовал 25 сезон',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      date: '15 октября 2024',
      excerpt: 'CD Projekt Red представила новый трейлер долгожданного дополнения Phantom Liberty...'
    },
  ]);

  const ADMIN_PASSWORD = "admin123";

  // Добавляем ID к существующим постам
useEffect(() => {
  if(posts.length > 0 && !posts[0].id) {
    setPosts(prev => prev.map((post, idx) => ({...post, id: idx})));
  }
}, []);

  const handleAuth = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      showStatus('Вы успешно вошли как администратор', 'success');
      return true;
    }
    showStatus('Неверный пароль администратора', 'error');
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

  const addPost = (newPost) => {
    setPosts(prev => [{...newPost, id: prev.length}, ...prev]);
    showStatus('Пост успешно добавлен!', 'success');
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
            <Route path="/" element={<HomePage posts={posts} isAdmin={isAdmin} addPost={addPost} />} />
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