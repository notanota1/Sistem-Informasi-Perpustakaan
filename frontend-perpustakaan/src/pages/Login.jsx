import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Harap isi semua field');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">📚</div>
          <h1>Sistem Perpustakaan Digital</h1>
          <p>Silakan login untuk mengakses sistem perpustakaan</p>
        </div>

        {error && (
          <div className="alert error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <span>📧</span>
              Alamat Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Masukkan alamat email Anda"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span>🔒</span>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password Anda"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? '🔄 Memproses...' : '🚀 Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Belum punya akun?{' '}
            <Link to="/register" className="auth-link">
              <span>📝</span>
              Daftar akun baru di sini
            </Link>
          </p>
          <p>
            Lupa password?{' '}
            <Link to="/forgot-password" className="auth-link">
              <span>🔑</span>
              Reset di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;