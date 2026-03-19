import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';

const SideBar = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <ul className='ul'>
        <li className='li'>
          <Link className='btn btn-dark yellow' to='/classes'>Classes</Link>
        </li>
        <hr />
        <li className='li'>
          <Link className='btn btn-dark yellow' to='/niveaux'>Levels</Link>
        </li>
        <hr />
        <li className='li'>
          <Link className='btn btn-dark yellow' to='/teachers'>Teachers</Link>
        </li>
        <hr />
        <li className='li'>
          <Link className='btn btn-dark yellow' to='/matieres'>Subjects</Link>
        </li>
        <hr />
        <li className='li'>
          <Link className='btn btn-dark yellow' to='/payment/add'>Add Student</Link>
        </li>
        <hr />
        <li className='li'>
          <Link className='btn btn-dark yellow' to='/payment/index'>All Students</Link>
        </li>
      </ul>
    </aside>
  );
}

export default SideBar;
