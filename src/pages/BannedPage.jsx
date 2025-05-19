import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const BannedPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'banned') {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="banned-container">
      <div className="banned-content">
        <h1>Ваш аккаунт заблокирован</h1>
        <p>
          К сожалению, администратор ограничил доступ к вашему аккаунту.
          Для выяснения причин обратитесь в поддержку.
        </p>
        <button onClick={handleLogout} className="logout-btn">
          Выйти из системы
        </button>
      </div>
    </div>
  );
};

export default BannedPage;  