import { useNavigate } from 'react-router-dom';

const LoginPage = ({ handleAuth }) => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = handleAuth(e.target.adminPassword.value);
    if(success) navigate('/');
  };

  return (
    <div className="modal" style={{display: 'block'}}>
      <div className="modal-content">
        <h2 className="modal-title">Авторизация администратора</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="adminPassword">Пароль администратора</label>
            <input 
              type="password" 
              id="adminPassword" 
              required 
              autoFocus
            />
          </div>
          <button type="submit" className="submit-btn">Войти</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;