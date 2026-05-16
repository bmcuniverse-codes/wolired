import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home'; import Login from './pages/Login'; import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard'; import StudentDashboard from './pages/StudentDashboard'; import ExamRoom from './pages/ExamRoom'; import Reports from './pages/Reports';
export default function App(){ const [loading,setLoading]=useState(true); useEffect(()=>{const t=setTimeout(()=>setLoading(false),2200); return()=>clearTimeout(t)},[]); if(loading) return <Loader/>; return <AuthProvider><Navbar/><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>}/><Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard/></ProtectedRoute>}/><Route path="/exam/:id" element={<ProtectedRoute><ExamRoom/></ProtectedRoute>}/><Route path="/reports" element={<ProtectedRoute role="admin"><Reports/></ProtectedRoute>}/></Routes></AuthProvider> }
