import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
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
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Harap isi semua field yang wajib');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password harus minimal 6 karakter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    return 'strong';
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">📚</div>
          <h1>Daftar Akun Baru</h1>
          <p>Buat akun untuk mengakses perpustakaan digital</p>
        </div>

        {error && (
          <div className="alert error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">
              <span>👤</span>
              Nama Lengkap
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap Anda"
              required
              disabled={loading}
            />
          </div>

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
              placeholder="Buat password (minimal 6 karakter)"
              required
              minLength="6"
              disabled={loading}
            />
            {formData.password && (
              <div className={`password-strength strength-${passwordStrength}`}>
                Kekuatan password: {
                  passwordStrength === 'weak' ? 'Lemah' :
                  passwordStrength === 'medium' ? 'Sedang' : 'Kuat'
                }
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <span>🔒</span>
              Konfirmasi Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Konfirmasi password Anda"
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? '🔄 Mendaftarkan...' : '📝 Daftar Sekarang'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Sudah punya akun?{' '}
            <Link to="/login" className="auth-link">
              <span>🚀</span>
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;