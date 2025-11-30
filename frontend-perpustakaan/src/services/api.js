const API_BASE_URL = 'http://localhost:3333';

// api.js - PERBAIKI fetchWithAuth:
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Jika response bukan JSON, gunakan status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    }
    throw error;
  }
};

// Buku Service - Semua endpoint buku harus bekerja
export const bukuService = {
  getAllBuku: async () => {
    return fetchWithAuth('/buku');
  },

  getBukuById: async (id) => {
    return fetchWithAuth(`/buku/${id}`);
  },

  createBuku: async (data) => {
    return fetchWithAuth('/buku', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBuku: async (id, data) => {
    return fetchWithAuth(`/buku/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteBuku: async (id) => {
    return fetchWithAuth(`/buku/${id}`, {
      method: 'DELETE',
    });
  },

  searchBuku: async (query) => {
    return fetchWithAuth(`/buku/search?q=${encodeURIComponent(query)}`);
  }
};

// api.js - PERBAIKI:
export const peminjamanService = {
  getPeminjamanSaya: async () => {
    return fetchWithAuth('/peminjaman');
  },

  getAllPeminjaman: async () => {
    return fetchWithAuth('/peminjaman');
  },

  pinjamBuku: async (bukuId) => {
    return fetchWithAuth('/peminjaman', {
      method: 'POST',
      body: JSON.stringify({ bukuId }),
    });
  },

  kembalikanBuku: async (peminjamanId) => {
    return fetchWithAuth(`/peminjaman/${peminjamanId}/pengembalian`, {
      method: 'POST',
    });
  }
};

// Export services
export default {
  bukuService,
  peminjamanService
};