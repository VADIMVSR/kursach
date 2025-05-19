import { useEffect, useState } from 'react';
import { getUsers, updateUserRole } from '../api.jsx';
import '../App.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
        alert('Ошибка загрузки пользователей');
      }
    };
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await updateUserRole(userId, newRole);
      setUsers(users.map(user => user._id === data._id ? data : user));
      alert(`Роль пользователя успешно изменена на ${newRole}`);
    } catch (error) {
      console.error('Role update failed:', error);
      alert('Ошибка изменения роли');
    }
  };

  return (
    <div className="admin-panel">
      <h1>Управление пользователями</h1>
      <table className="users-table">
        <thead>
          <tr>
            <th>Логин</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className={user.role === 'banned' ? 'banned-user' : ''}>
              <td>{user.login}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  disabled={user.role === 'banned'}
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                  <option value="banned">Забанен</option>
                </select>
              </td>
              <td>
                {user.role === 'banned' ? (
                  <span className="banned-badge">ЗАБАНЕН</span>
                ) : (
                  <span className="active-badge">АКТИВЕН</span>
                )}
              </td>
              <td>
                {user.role === 'banned' ? (
                  <button 
                    onClick={() => handleRoleChange(user._id, 'user')}
                    className="unban-btn"
                  >
                    Разбанить
                  </button>
                ) : (
                  <button 
                    onClick={() => handleRoleChange(user._id, 'banned')}
                    className="ban-btn"
                  >
                    Забанить
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;