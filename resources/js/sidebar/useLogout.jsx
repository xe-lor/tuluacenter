import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../api.js';

const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
  try {
    await API.post('/auth/logout', {}, { withCredentials: true });
  } catch (err) {
    console.error('Logout failed', err);
  }
  // Clear localStorage
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_id');
  localStorage.removeItem('username');

  // Dispatch event so sidebar updates immediately
  window.dispatchEvent(new Event('updateRole'));

  navigate('/',{ replace: true });
};

  return logout;
};

export default useLogout;