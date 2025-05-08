import AddPostForm from '../components/AddPostForm';

const AdminPage = ({ addPost }) => {
  return (
    <div className="admin-page">
      <h1>Панель администратора</h1>
      <AddPostForm onAddPost={addPost} />
    </div>
  );
};

export default AdminPage;