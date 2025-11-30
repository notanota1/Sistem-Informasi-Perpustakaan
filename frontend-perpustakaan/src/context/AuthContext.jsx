import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('libraryToken');
    if (token) {
      try {
        // Gunakan backend real untuk check auth
        const response = await fetch('http://localhost:3333/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token invalid, clear localStorage
          localStorage.removeItem('libraryToken');
          localStorage.removeItem('libraryUser');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('libraryToken');
        localStorage.removeItem('libraryUser');
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    setLoading(true);
    
    try {
      // Gunakan backend real
      const response = await fetch('http://localhost:3333/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Login gagal');
      }

      const data = await response.json();
      const { user, token } = data;
      
      localStorage.setItem('libraryToken', token);
      localStorage.setItem('libraryUser', JSON.stringify(user));
      setUser(user);
      
      console.log('✅ Real backend login success');
      return user;
    } catch (error) {
      throw new Error(error.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  // Di AuthContext.js - register function
const register = async (userData) => {
  setLoading(true);
  
  try {
    // ✅ BUAT PAYLOAD DENGAN BENAR
    const payload = {
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.password,
      role: userData.role || 'user'
    };

    // ✅ TAMBAH FULLNAME DENGAN CARA YANG BENAR
    if (userData.fullName) {
      Object.assign(payload, { fullName: userData.fullName });
    }

    console.log('📝 Register payload:', payload);

    const response = await fetch('http://localhost:3333/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    console.log('📝 Register response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Registrasi gagal');
    }

    const { user, token } = data;
    
    localStorage.setItem('libraryToken', token);
    localStorage.setItem('libraryUser', JSON.stringify(user));
    setUser(user);
    
    console.log('✅ Register success - User role:', user.role);
    return user;
  } catch (error) {
    console.error('Register catch error:', error);
    throw new Error(error.message || 'Registrasi gagal');
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    try {
      await fetch('http://localhost:3333/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('libraryToken')}`,
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('libraryToken');
      localStorage.removeItem('libraryUser');
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// HAPUS fakeAuthAPI dan semua fake services