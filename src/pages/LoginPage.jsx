import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getProfile } from '../api.jsx';
import '../App.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { data: { accessToken, refreshToken } } = await login({ 
        login: username, 
        password 
      });

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      const { data: user } = await getProfile();
      
      if (user.role === 'banned') {
        setError('Ваш аккаунт заблокирован администратором');
        localStorage.clear();
        return;
      }

      localStorage.setItem('userRole', user.role);
      localStorage.setItem('isAuthenticated', 'true');
      
      if (user.role === 'admin') {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Ошибка входа. Проверьте данные.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Вход в систему</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Логин:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      
      <div className="register-link">
        Нет аккаунта? <a href="/register">Зарегистрироваться</a>
      </div>
    </div>
  );
};

export default LoginPage;