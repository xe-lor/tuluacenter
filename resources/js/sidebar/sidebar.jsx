import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';
import useLogout from './useLogout';

const SideBar = () => {
  const [scrollY, setScrollY] = useState(0);
  const [role, setRole] = useState(localStorage.getItem('user_role'));
  const logout = useLogout();

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update role immediately on login/logout
  useEffect(() => {
    const updateRole = () => setRole(localStorage.getItem('user_role'));
    window.addEventListener('updateRole', updateRole);
    return () => window.removeEventListener('updateRole', updateRole);
  }, []);

  if (!role) return null;

  return (
    <aside
      className='sidebar'
      style={{
        position: 'fixed',
        height: `${window.innerHeight + scrollY}px`,
        transition: 'height 0.1s ease',
        overflowY: 'auto',
      }}
    >
      <ul className='ul' style={{ marginLeft: 20 }}>
        {/* Logout button always on top */}
        <li className='li mb-3'>
          <button className='btn btn-dark text-danger' style={{ width: 250, fontSize: 20 }} onClick={logout}>
            Logout <i className="bi bi-box-arrow-right"></i>
          </button>
        </li>
        <hr />

        {/* Admin links */}
        {role === 'admin' && (
          <>
            <li className='li'><Link className='btn btn-dark yellow' to='/classes/index'>Classes</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/niveaux'>Levels</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/teachers'>Teachers</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/assistances'>Assistant</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/matieres'>Subjects</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/payment/add'>Add Student</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/payment/index'>All Students</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/students/studentsQr'>Students Cards</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/students/scanner'>Scanner</Link></li><hr />
          </>
        )}

        {/* Assistant links */}
        {role === 'assistant' && (
          <>
            <li className='li'><Link className='btn btn-dark yellow' to='/payment/add'>Add Student</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/payment/index'>All Students</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/students/studentsQr'>Students Cards</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/students/scanner'>Scanner</Link></li><hr />
          </>
        )}
                {role === 'teacher' && (
          <>
            <li className='li'><Link className='btn btn-dark yellow' to='/teacher/students'>Studens</Link></li><hr />
            <li className='li'><Link className='btn btn-dark yellow' to='/teacher/statistiques'>statistiques</Link></li><hr />
            
          </>
        )}
      </ul>
    </aside>
  );
};

export default SideBar;