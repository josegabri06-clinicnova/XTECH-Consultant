'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'

  // Redirigir al dashboard si ya está logueado
  useEffect(() => {
    const checkSession = async () => {
      // 1. Verificar Supabase
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.push('/dashboard');
        return;
      }
      
      // 2. Fallback de desarrollo local
      const localUser = localStorage.getItem('xtech_session');
      if (localUser) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Intentar iniciar sesión real en Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback local: Si el error es de configuración o credenciales incorrectas, simulamos acceso en local con demo@xtech.com
        if (email.toLowerCase() === 'demo@xtech.com' && password === 'demo1234') {
          localStorage.setItem('xtech_session', JSON.stringify({ email, name: 'Cliente Demo' }));
          setMessage({ text: 'Acceso de desarrollo autorizado. Redirigiendo...', type: 'success' });
          setTimeout(() => router.push('/dashboard'), 1200);
          return;
        }
        throw new Error(error.message);
      }

      if (data?.user) {
        localStorage.setItem('xtech_session', JSON.stringify({ email: data.user.email, name: data.user.user_metadata?.full_name || 'Usuario' }));
        setMessage({ text: '¡Sesión iniciada con éxito! Redirigiendo...', type: 'success' });
        setTimeout(() => router.push('/dashboard'), 1200);
      }
    } catch (err) {
      // Si no es demo@xtech.com y falla Supabase, mostramos error
      setMessage({ 
        text: err.message === 'Database error saving new user' || err.message.includes('fetch')
          ? 'Error al conectar con base de datos. Usa demo@xtech.com / demo1234 para probar.'
          : err.message, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Registro real en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        setMessage({ text: '¡Registro completado! Por favor, confirma el enlace en tu email y luego inicia sesión.', type: 'success' });
        setActiveTab('login');
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="grid-mesh" aria-hidden="true"></div>
      
      <header className="login-header">
        <a href="/" className="nav-logo">
          <span className="logo-icon">X</span>
          <span className="logo-text">Tech</span>
        </a>
      </header>

      <main className="login-card-container">
        <div className="login-card-inner">
          <div className="login-tabs">
            <button 
              className={`login-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => { setActiveTab('login'); setMessage({ text: '', type: '' }); }}
            >
              Iniciar Sesión
            </button>
            <button 
              className={`login-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => { setActiveTab('register'); setMessage({ text: '', type: '' }); }}
            >
              Crear Cuenta
            </button>
          </div>

          <div className="login-card-body">
            <h1 className="login-title">
              {activeTab === 'login' ? 'Bienvenido a la consola' : 'Crea tu portal de cliente'}
            </h1>
            <p className="login-subtitle">
              {activeTab === 'login' 
                ? 'Gestiona tus automatizaciones, IA y paneles.' 
                : 'Accede a la auditoría técnica y cotizaciones cerradas.'}
            </p>

            {message.text && (
              <div className={`login-alert ${message.type}`}>
                <span className="alert-icon">{message.type === 'success' ? '✓' : '⚠'}</span>
                <span className="alert-message">{message.text}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email Corporativo</label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@empresa.com"
                  />
                </div>
                
                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="password">Contraseña</label>
                    <a href="#" className="forgot-password-link" onClick={(e) => { e.preventDefault(); alert('Usa demo@xtech.com / demo1234 para acceder de inmediato.'); }}>
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <input 
                    type="password" 
                    id="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  type="submit" 
                  className={`btn-primary login-btn ${loading ? 'disabled' : ''}`}
                  disabled={loading}
                >
                  <span>{loading ? 'Entrando...' : 'Entrar a la consola'}</span>
                </button>
                
                <div className="demo-hint-box">
                  💡 <strong>Modo Demo Activo</strong>: Usa el email <code>demo@xtech.com</code> y contraseña <code>demo1234</code> para probar la consola de inmediato.
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="login-form">
                <div className="form-group">
                  <label htmlFor="fullName">Nombre Completo</label>
                  <input 
                    type="text" 
                    id="fullName" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="companyName">Nombre de tu empresa</label>
                  <input 
                    type="text" 
                    id="companyName" 
                    required 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ej. Nova S.L."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="regEmail">Email Corporativo</label>
                  <input 
                    type="email" 
                    id="regEmail" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@empresa.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="regPassword">Contraseña (mínimo 6 caracteres)</label>
                  <input 
                    type="password" 
                    id="regPassword" 
                    required 
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Escribe tu contraseña"
                  />
                </div>

                <button 
                  type="submit" 
                  className={`btn-primary login-btn ${loading ? 'disabled' : ''}`}
                  disabled={loading}
                >
                  <span>{loading ? 'Creando cuenta...' : 'Crear mi cuenta'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
