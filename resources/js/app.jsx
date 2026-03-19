import React from 'react'
import ReactDOM from 'react-dom/client';
import { BrowserRouter,Routes, Route } from 'react-router-dom';
import Login from './auth/login.jsx';
import CreateMatiere from './admin/matieres/create.jsx';
import CreateNiveau from './admin/niveaux/create.jsx';
import CreateTeacher from './admin/teachers/create.jsx';
import SideBar from './sidebar/sidebar.jsx';
import CreateClass from './admin/classes/create.jsx';
import CreateStudent from './payment/create.jsx';
import Index from './payment/index.jsx';
import UpdateStudent from './payment/update.jsx';



ReactDOM.createRoot(document.getElementById('app')).render(
    <BrowserRouter>
        <SideBar />
        <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/matieres' element={<CreateMatiere />} />
            <Route path='/niveaux' element={<CreateNiveau />} />
            <Route path='/teachers' element={<CreateTeacher />} />
            <Route path='/classes' element={<CreateClass />} />
            <Route path='/payment/add' element={<CreateStudent />} />
            <Route path='/payment/index' element={<Index />} />
            <Route path="/student/update/:id" element={<UpdateStudent />} />
        </Routes>
    </BrowserRouter> 
);