import React from 'react'
import ReactDOM from 'react-dom/client';
import { BrowserRouter,Routes, Route } from 'react-router-dom';
import Login from './auth/login.jsx';
import '../css/app.css';
import SideBar from './sidebar/sidebar.jsx';
import CreateStudent from './payment/create.jsx';
import Index from './payment/index.jsx';
import UpdateStudent from './payment/update.jsx';
import StudentsQr from './studentsQr/studentsQr.jsx';
import Scanner from './studentsQr/scanner.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import StudentsPage from './teacher/StudentsPage.jsx';
import StatsPage from './teacher/StatsPage.jsx';
import AccountPage from './teacher/AccountPage.jsx';
import EmailPrompt from './teacher/EmailPrompt.jsx';
import TeacherIndex from './admin/teachers/index.jsx';
import AssistantIndex from './admin/assistances/index.jsx';
import IndexMatieres from './admin/matieres/index.jsx';
import IndexNiveaux from './admin/niveaux/index.jsx';
import IndexClass from './admin/classes/index.jsx';
import ForgotPassword from './auth/ForgotPassword.jsx';




ReactDOM.createRoot(document.getElementById('app')).render(
      <BrowserRouter basename='/tuluacenter'>
    <SideBar />
    <EmailPrompt />
    <Routes>
      {/* Public login route */}
      <Route path='/' element={<Login />} />
      <Route path='/ForgotPassword' element={<ForgotPassword />} />


      {/* Admin-only routes */}
      <Route path='/matieres' element={<PrivateRoute allowedRoles={['admin']}><IndexMatieres /></PrivateRoute>} />





      <Route path='/niveaux' element={<PrivateRoute allowedRoles={['admin']}><IndexNiveaux /></PrivateRoute>} />







      <Route path='/teachers' element={<PrivateRoute allowedRoles={['admin']}><TeacherIndex /></PrivateRoute>} />
     

      <Route path='/assistances' element={<PrivateRoute allowedRoles={['admin']}><AssistantIndex /></PrivateRoute>} />



      {/* Routes accessible by both admin and assistant */}
      <Route path='/classes/index' element={<PrivateRoute><IndexClass /></PrivateRoute>} />
      <Route path='/payment/add' element={<PrivateRoute><CreateStudent /></PrivateRoute>} />
      <Route path='/payment/index' element={<PrivateRoute><Index /></PrivateRoute>} />
      <Route path='/student/update/:id' element={<PrivateRoute><UpdateStudent /></PrivateRoute>} />
      <Route path='/students/studentsQr' element={<PrivateRoute><StudentsQr /></PrivateRoute>} />
      <Route path='/students/scanner' element={<PrivateRoute><Scanner /></PrivateRoute>} />




      <Route path='/teacher/students' element={<PrivateRoute allowedRoles={['teacher']}><StudentsPage /></PrivateRoute>} />
      <Route path='/teacher/statistiques' element={<PrivateRoute allowedRoles={['teacher']}><StatsPage /></PrivateRoute>} />
      <Route path='/teacher/account' element={<PrivateRoute allowedRoles={['teacher']}><AccountPage /></PrivateRoute>} />

    </Routes>
  </BrowserRouter>
);