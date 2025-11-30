import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bukuService, peminjamanService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [buku, setBuku] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [formData, setFormData] = useState({
    judul: '',
    penulis: '',
    penerbit: '',
    stok: 0
  });

  const [editFormData, setEditFormData] = useState({
    judul: '',
    penulis: '',
    penerbit: '',
    stok: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log('🔄 Dashboard - User updated:', user);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

// Dashboard.js - PERBAIKI loadData:
const loadData = async () => {
  try {
    setDataLoading(true);
    console.log('🔐 Current User:', user);

    // Load buku data
    const bukuData = await bukuService.getAllBuku();
    setBuku(bukuData);
    
    // Load peminjaman data - gunakan endpoint yang sama
    // Controller akan otomatis filter berdasarkan role user
    const peminjamanData = await peminjamanService.getPeminjamanSaya();
    
    console.log('✅ Peminjaman data loaded:', peminjamanData.length, 'records');
    console.log('👤 User role:', user?.role);
    
    setPeminjaman(peminjamanData || []);
    
  } catch (err) {
    console.error('❌ Error loading data:', err);
    setError('Gagal memuat data: ' + err.message);
  } finally {
    setDataLoading(false);
  }
};

  // Data sample untuk demo (jika endpoint tidak tersedia)
  const getSamplePeminjamanData = () => {
    if (user?.role === 'admin') {
      return [
        {
          id: 1,
          userId: 1,
          user: { email: 'user1@example.com', role: 'user' },
          bukuId: 1,
          buku: { judul: 'Database Management', penulis: 'Ahmad Fauzi' },
          tanggalPinjam: '2024-01-15',
          batasKembali: '2024-01-22',
          status: 'dikembalikan'
        },
        {
          id: 2,
          userId: 2,
          user: { email: 'user2@example.com', role: 'user' },
          bukuId: 2,
          buku: { judul: 'Pemrograman JavaScript Modern', penulis: 'Budi Santoso' },
          tanggalPinjam: '2024-01-18',
          batasKembali: '2024-01-25',
          status: 'dipinjam'
        }
      ];
    } else {
      return [
        {
          id: 1,
          bukuId: 1,
          buku: { judul: 'Database Management', penulis: 'Ahmad Fauzi' },
          tanggalPinjam: '2024-01-15',
          batasKembali: '2024-01-22',
          status: 'dikembalikan'
        },
        {
          id: 2,
          bukuId: 3,
          buku: { judul: 'React untuk Pemula', penulis: 'Sari Dewi' },
          tanggalPinjam: '2024-01-20',
          batasKembali: '2024-01-27',
          status: 'dipinjam'
        }
      ];
    }
  };

  const handlePinjamBuku = async (bookId) => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`🔄 User ${user?.email} (${user?.role}) meminjam buku ID: ${bookId}`);
      
      // Check if user is admin (admin cannot borrow books)
      if (user?.role === 'admin') {
        setError('Admin tidak dapat meminjam buku');
        return;
      }
      
      // Cari buku yang akan dipinjam
      const bukuToBorrow = buku.find(b => b.id === bookId);
      if (!bukuToBorrow) {
        setError('Buku tidak ditemukan');
        return;
      }
      
      if (bukuToBorrow.stok <= 0) {
        setError('Stok buku habis');
        return;
      }
      
      // Coba panggil API untuk meminjam buku
      try {
        const newPeminjaman = await peminjamanService.pinjamBuku(bookId);
        
        // Update local state untuk mengurangi stok
        setBuku(prev => prev.map(b => 
          b.id === bookId ? { ...b, stok: b.stok - 1 } : b
        ));
        
        // Tambahkan ke riwayat peminjaman
        setPeminjaman(prev => [...prev, newPeminjaman]);
        
        setSuccess('Buku berhasil dipinjam!');
      } catch (apiError) {
        // Jika API tidak tersedia, tampilkan info
        setError('Fitur peminjaman sedang dalam pengembangan. Silakan hubungi admin.');
      }
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Error meminjam buku:', err);
      setError('Gagal meminjam buku: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKembalikanBuku = async (peminjamanId) => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`🔄 Mengembalikan peminjaman ID: ${peminjamanId}`);
      
      // Cari data peminjaman
      const peminjamanToReturn = peminjaman.find(p => p.id === peminjamanId);
      if (!peminjamanToReturn) {
        setError('Data peminjaman tidak ditemukan');
        return;
      }
      
      // Coba panggil API untuk mengembalikan buku
      try {
        await peminjamanService.kembalikanBuku(peminjamanId);
        
        // Update stok buku di local state
        if (peminjamanToReturn.bukuId) {
          setBuku(prev => prev.map(b => 
            b.id === peminjamanToReturn.bukuId ? { ...b, stok: b.stok + 1 } : b
          ));
        }
        
        // Update status peminjaman
        setPeminjaman(prev => prev.map(p => 
          p.id === peminjamanId ? { ...p, status: 'dikembalikan' } : p
        ));
        
        setSuccess('Buku berhasil dikembalikan!');
      } catch (apiError) {
        setError('Fitur pengembalian sedang dalam pengembangan.');
      }
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Error mengembalikan buku:', err);
      setError('Gagal mengembalikan buku: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTambahBuku = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Menambah buku baru:', formData);
      const newBook = await bukuService.createBuku(formData);
      
      // Tambahkan buku baru ke state
      setBuku(prev => [...prev, newBook]);
      
      setFormData({ judul: '', penulis: '', penerbit: '', stok: 0 });
      setShowForm(false);
      
      setSuccess('Buku berhasil ditambahkan!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Error menambah buku:', err);
      setError('Gagal menambah buku: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHapusBuku = async (bookId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log(`🔄 Menghapus buku ID: ${bookId}`);
      await bukuService.deleteBuku(bookId);
      
      setBuku(prev => prev.filter(b => b.id !== bookId));
      
      setSuccess('Buku berhasil dihapus!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Error menghapus buku:', err);
      setError('Gagal menghapus buku: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (buku) => {
    setEditingBook(buku);
    setEditFormData({
      judul: buku.judul,
      penulis: buku.penulis,
      penerbit: buku.penerbit,
      stok: buku.stok
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingBook(null);
    setEditFormData({ judul: '', penulis: '', penerbit: '', stok: 0 });
  };

  const handleUpdateStok = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Memperbarui stok buku:', editingBook.id, editFormData);
      const updatedBook = await bukuService.updateBuku(editingBook.id, editFormData);
      
      setBuku(prev => prev.map(b => 
        b.id === editingBook.id ? { ...b, ...updatedBook } : b
      ));
      
      handleCloseEditModal();
      setSuccess('Stok buku berhasil diperbarui!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Error memperbarui stok:', err);
      setError('Gagal memperbarui stok: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'number' 
        ? parseInt(e.target.value) 
        : e.target.value
    });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.type === 'number' 
        ? parseInt(e.target.value) 
        : e.target.value
    });
  };

  const handleForceRefresh = async () => {
    console.log('🔄 Manual force refresh');
    await loadData();
  };

  // Format tanggal untuk display
  const formatTanggal = (tanggal) => {
    if (!tanggal) return 'N/A';
    try {
      return new Date(tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return tanggal;
    }
  };

  if (dataLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Memuat data dari database...</p>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          User: {user ? `${user.fullName || user.email} (${user.role})` : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-full">
      <header className="dashboard-header">
        <div className="header-main">
          <div className="header-title">
            <h1>📚 Dashboard Perpustakaan</h1>
            <p className="welcome-text">
              Selamat datang, <strong>{user?.fullName || user?.email}</strong> 
              <span className="user-role" style={{ 
                color: user?.role === 'admin' ? '#dc2626' : '#059669',
                fontWeight: 'bold'
              }}>({user?.role})</span>
            </p>
            <button 
              onClick={handleForceRefresh}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '5px'
              }}
            >
              🔄 Refresh Data
            </button>
          </div>
          <div className="header-actions">
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <button onClick={handleLogout} className="btn-logout">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        <div className="system-info">
          <div className="info-item">
            <strong>Frontend:</strong> localhost:5173
          </div>
          <div className="info-item">
            <strong>Backend:</strong> localhost:3333
          </div>
          <div className="info-item">
            <strong>Status:</strong> 
            <span className={loading ? 'status-loading' : 'status-ready'}>
              {loading ? 'Loading...' : 'Ready'}
            </span>
          </div>
          <div className="info-item">
            <strong>User Role:</strong> 
            <span style={{ 
              color: user?.role === 'admin' ? '#dc2626' : '#059669',
              fontWeight: 'bold'
            }}>
              {user?.role}
            </span>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="alert alert-error">
            <span>❌ {error}</span>
            <button onClick={() => setError('')} className="btn-close">&times;</button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <span>✅ {success}</span>
            <button onClick={() => setSuccess('')} className="btn-close">&times;</button>
          </div>
        )}

        {/* Books Section */}
        <section className="section-books">
          <div className="section-header">
            <h2>📖 Koleksi Buku ({buku.length})</h2>
            {user?.role === 'admin' && (
              <button 
                onClick={() => setShowForm(!showForm)}
                className="btn btn-primary"
                disabled={loading}
              >
                {showForm ? '✕ Batal' : '➕ Tambah Buku'}
              </button>
            )}
          </div>

          {/* Add Book Form */}
          {showForm && user?.role === 'admin' && (
            <div className="add-book-form">
              <h3>📝 Tambah Buku Baru</h3>
              <form onSubmit={handleTambahBuku}>
                <div className="form-grid">
                  <div className="form-group">
                    <input
                      type="text"
                      name="judul"
                      placeholder="Judul Buku"
                      value={formData.judul}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="penulis"
                      placeholder="Penulis"
                      value={formData.penulis}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="penerbit"
                      placeholder="Penerbit"
                      value={formData.penerbit}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="number"
                      name="stok"
                      placeholder="Stok"
                      value={formData.stok}
                      onChange={handleInputChange}
                      min="0"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-success">
                  {loading ? '⏳ Menyimpan...' : '💾 Simpan Buku'}
                </button>
              </form>
            </div>
          )}

          {/* Books Grid */}
          <div className="books-grid">
            {buku.length === 0 ? (
              <div className="empty-state">
                <p>📚 Tidak ada buku dalam database</p>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                  >
                    ➕ Tambah Buku Pertama
                  </button>
                )}
              </div>
            ) : (
              buku.map(buku => (
                <div key={buku.id} className="book-card">
                  <div className="book-header">
                    <h3 className="book-title">📗 {buku.judul}</h3>
                    {user?.role === 'admin' && (
                      <span className="book-id">ID: {buku.id}</span>
                    )}
                  </div>
                  <div className="book-details">
                    <div className="book-detail">
                      <span className="detail-label">✍️ Penulis:</span>
                      <span>{buku.penulis}</span>
                    </div>
                    <div className="book-detail">
                      <span className="detail-label">🏢 Penerbit:</span>
                      <span>{buku.penerbit}</span>
                    </div>
                    <div className="book-detail">
                      <span className="detail-label">📊 Stok:</span>
                      <span className={`stock-badge ${buku.stok === 0 ? 'stock-empty' : buku.stok < 5 ? 'stock-low' : 'stock-available'}`}>
                        {buku.stok} tersedia
                      </span>
                    </div>
                  </div>
                  <div className="book-actions">
                    {buku.stok > 0 ? (
                      <button 
                        onClick={() => handlePinjamBuku(buku.id)}
                        disabled={loading || user?.role === 'admin'}
                        className="btn btn-borrow"
                        title={user?.role === 'admin' ? 'Admin tidak dapat meminjam buku' : 'Pinjam buku ini'}
                      >
                        📥 Pinjam Buku
                      </button>
                    ) : (
                      <button disabled className="btn btn-disabled">
                        ❌ Stok Habis
                      </button>
                    )}
                    
                    {user?.role === 'admin' && (
                      <div className="admin-actions">
                        <button 
                          onClick={() => handleOpenEditModal(buku)}
                          disabled={loading}
                          className="btn btn-edit"
                          title="Edit stok buku"
                        >
                          ✏️ Edit Stok
                        </button>
                        <button 
                          onClick={() => handleHapusBuku(buku.id)}
                          disabled={loading}
                          className="btn btn-delete"
                          title="Hapus buku"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Borrowing History Section */}
        <section className="section-borrowing">
          <div className="section-header">
            <h2>
              📋 {user?.role === 'admin' ? 'Semua Riwayat Peminjaman' : 'Riwayat Peminjaman Saya'} 
              ({peminjaman.length})
            </h2>
          </div>
          
          {peminjaman.length === 0 ? (
            <div className="empty-state">
              <p>📭 {user?.role === 'admin' ? 'Belum ada data peminjaman' : 'Belum ada riwayat peminjaman'}</p>
              <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                {user?.role === 'admin' 
                  ? 'Fitur peminjaman sedang dalam pengembangan' 
                  : 'Anda belum meminjam buku apapun'}
              </p>
            </div>
          ) : (
            <div className="borrowing-table">
              <table>
                <thead>
                  <tr>
                    {user?.role === 'admin' && <th>User</th>}
                    <th>Buku</th>
                    <th>Tanggal Pinjam</th>
                    <th>Batas Kembali</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {peminjaman.map(pinjam => (
                    <tr key={pinjam.id}>
                      {user?.role === 'admin' && (
                        <td>
                          <div className="user-info-small">
                            <span className="user-email">{pinjam.user?.email || 'Unknown User'}</span>
                            <span className="user-role-small">{pinjam.user?.role}</span>
                          </div>
                        </td>
                      )}
                      <td>
                        <div className="book-info">
                          <span className="book-icon">📖</span>
                          <div>
                            <div className="book-title-small">{pinjam.buku?.judul || pinjam.judul || 'Unknown Book'}</div>
                            <div className="book-author-small">{pinjam.buku?.penulis || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="date-info">
                          <span className="date-icon">📅</span>
                          {formatTanggal(pinjam.tanggalPinjam)}
                        </div>
                      </td>
                      <td>
                        <div className="date-info">
                          <span className="date-icon">⏰</span>
                          {formatTanggal(pinjam.batasKembali)}
                        </div>
                      </td>
                      <td>
                        <span className={`status status-${pinjam.status}`}>
                          {pinjam.status === 'dipinjam' ? '📚 Dipinjam' : 
                           pinjam.status === 'dikembalikan' ? '✅ Dikembalikan' : 
                           pinjam.status === 'terlambat' ? '⚠️ Terlambat' : 
                           pinjam.status}
                        </span>
                      </td>
                      <td>
                        {pinjam.status === 'dipinjam' && (
                          <button 
                            onClick={() => handleKembalikanBuku(pinjam.id)}
                            disabled={loading}
                            className="btn btn-return"
                          >
                            📤 Kembalikan
                          </button>
                        )}
                        {pinjam.status === 'dikembalikan' && (
                          <span className="returned-text">✅ Sudah Dikembalikan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Modal Edit Stok Buku */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>✏️ Edit Stok Buku</h3>
                <button 
                  onClick={handleCloseEditModal}
                  className="btn-close"
                  disabled={loading}
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleUpdateStok}>
                <div className="form-group">
                  <label>Judul Buku</label>
                  <input
                    type="text"
                    value={editFormData.judul}
                    readOnly
                    className="form-input readonly"
                  />
                </div>
                
                <div className="form-group">
                  <label>Penulis</label>
                  <input
                    type="text"
                    value={editFormData.penulis}
                    readOnly
                    className="form-input readonly"
                  />
                </div>
                
                <div className="form-group">
                  <label>Penerbit</label>
                  <input
                    type="text"
                    value={editFormData.penerbit}
                    readOnly
                    className="form-input readonly"
                  />
                </div>
                
                <div className="form-group">
                  <label>Stok Saat Ini</label>
                  <input
                    type="text"
                    value={`${editingBook?.stok} buku`}
                    readOnly
                    className="form-input readonly"
                  />
                </div>
                
                <div className="form-group">
                  <label>Stok Baru</label>
                  <input
                    type="number"
                    name="stok"
                    value={editFormData.stok}
                    onChange={handleEditInputChange}
                    min="0"
                    required
                    disabled={loading}
                    className="form-input"
                    placeholder="Masukkan jumlah stok baru"
                  />
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={handleCloseEditModal}
                    disabled={loading}
                    className="btn btn-secondary"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? '⏳ Menyimpan...' : '💾 Update Stok'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;