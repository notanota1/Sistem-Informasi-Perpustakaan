class RealTimeClient {
    // ... constructor dan method lainnya ...

    handleEvent(event, data) {
        console.log('📢 Received event:', event, data)
        
        switch(event) {
            case 'buku:created':
                this.addBookToList(data);
                break;
            case 'buku:updated':
                this.updateBookInList(data);
                break;
            case 'buku:deleted':
                this.removeBookFromList(data.id);
                break;
            case 'peminjaman:created':
                this.addPeminjamanToList(data);
                break;
            case 'peminjaman:updated':
                this.handlePeminjamanUpdated(data); // ✅ METHOD BARU
                break;
            case 'heartbeat':
                console.log('❤️ Heartbeat received');
                break;
        }
    }

    // ✅ METHOD KHUSUS UNTUK UPDATE PEMINJAMAN (PENGEMBALIAN)
    handlePeminjamanUpdated(peminjamanData) {
        console.log('🔄 Handling peminjaman updated:', peminjamanData)
        
        // 1. Hapus row peminjaman yang lama (jika ada)
        const oldRow = document.getElementById(`peminjaman-${peminjamanData.id}`);
        if (oldRow) {
            oldRow.remove();
        }
        
        // 2. Tambahkan ke riwayat (atau tidak tambahkan jika mau hilang dari list)
        // Jika ingin tetap tampil di list sebagai riwayat:
        this.addPeminjamanToHistory(peminjamanData);
        
        // 3. Show notification
        this.showNotification('success', 
            `Buku "${peminjamanData.buku.judul}" berhasil dikembalikan! Stok sekarang: ${peminjamanData.buku.stok}`
        );
        
        // 4. Refresh buku list untuk update stok
        this.loadBooks();
    }

    // ✅ METHOD UNTUK TAMBAH PEMINJAMAN BARU
    addPeminjamanToList(peminjamanData) {
        console.log('➕ Adding new peminjaman:', peminjamanData)
        const peminjamanList = document.getElementById('peminjaman-list');
        
        if (peminjamanList && peminjamanData.status === 'dipinjam') {
            const newRow = document.createElement('tr');
            newRow.id = `peminjaman-${peminjamanData.id}`;
            newRow.innerHTML = `
                <td>${peminjamanData.buku.judul}</td>
                <td>${peminjamanData.tanggalPinjam}</td>
                <td>${peminjamanData.batasKembali}</td>
                <td>
                    <span style="color: orange; font-weight: bold">${peminjamanData.status}</span>
                </td>
                <td>
                    <button class="btn-return" onclick="kembalikanBuku(${peminjamanData.id})" 
                            style="background: #4CAF50; color: white; border: none; padding: 5px 10px; cursor: pointer;">
                        Kembalikan
                    </button>
                </td>
            `;
            peminjamanList.appendChild(newRow);
        }
        
        this.showNotification('success', `Buku "${peminjamanData.buku.judul}" berhasil dipinjam!`);
    }

    // ✅ METHOD UNTUK TAMBAH KE RIWAYAT (SETELAH DIKEMBALIKAN)
    addPeminjamanToHistory(peminjamanData) {
        console.log('📝 Adding to history:', peminjamanData)
        
        // Jika ingin membuat section riwayat terpisah
        const historySection = document.getElementById('riwayat-peminjaman');
        if (historySection) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${peminjamanData.buku.judul}</td>
                <td>${peminjamanData.tanggalPinjam}</td>
                <td>${peminjamanData.tanggalKembali}</td>
                <td>
                    <span style="color: green; font-weight: bold">${peminjamanData.status}</span>
                </td>
                <td>
                    <span style="color: gray">Selesai</span>
                </td>
            `;
            historySection.appendChild(newRow);
        }
    }

    // ✅ METHOD UNTUK LOAD/RELOAD DATA BUKU
    async loadBooks() {
        try {
            const response = await fetch('/buku');
            const books = await response.json();
            const bookList = document.getElementById('book-list');
            
            if (bookList) {
                bookList.innerHTML = books.map(book => `
                    <tr id="book-${book.id}">
                        <td>${book.judul}</td>
                        <td>${book.penulis}</td>
                        <td>${book.penerbit || '-'}</td>
                        <td>${book.tahunTerbit || '-'}</td>
                        <td>${book.stok}</td>
                        <td>
                            ${book.stok > 0 ? 
                                `<button class="btn-pinjam" onclick="pinjamBuku(${book.id})" 
                                         style="background: #2196F3; color: white; border: none; padding: 5px 10px; margin: 2px; cursor: pointer;">
                                    Pinjam
                                </button>` :
                                '<span style="color: red; padding: 5px 10px;">Stok Habis</span>'
                            }
                            <button class="btn-delete" onclick="deleteBook(${book.id})" 
                                    style="background: #f44336; color: white; border: none; padding: 5px 10px; margin: 2px; cursor: pointer;">
                                Delete
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading books:', error);
        }
    }

    // ✅ METHOD UNTUK LOAD/RELOAD DATA PEMINJAMAN
    async loadPeminjamanList() {
        try {
            const response = await fetch('/peminjaman');
            const peminjaman = await response.json();
            
            const peminjamanList = document.getElementById('peminjaman-list');
            if (peminjamanList) {
                peminjamanList.innerHTML = peminjaman.map(p => `
                    <tr id="peminjaman-${p.id}">
                        <td>${p.judul}</td>
                        <td>${p.tanggalPinjam}</td>
                        <td>${p.batasKembali}</td>
                        <td>
                            <span style="color: ${p.status === 'dipinjam' ? 'orange' : 'green'}; font-weight: bold">
                                ${p.status}
                            </span>
                        </td>
                        <td>
                            ${p.status === 'dipinjam' ? 
                                `<button class="btn-return" onclick="kembalikanBuku(${p.id})" 
                                         style="background: #4CAF50; color: white; border: none; padding: 5px 10px; cursor: pointer;">
                                    Kembalikan
                                </button>` : 
                                '<span style="color: gray">Sudah dikembalikan</span>'
                            }
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading peminjaman:', error);
        }
    }

    // ... method lainnya (showNotification, dll) ...
}

// ✅ GLOBAL FUNCTION UNTUK KEMBALIKAN BUKU - PERBAIKI INI
window.kembalikanBuku = async function(peminjamanId) {
    try {
        console.log('🔄 Mengembalikan buku ID:', peminjamanId)
        
        const response = await fetch(`/peminjaman/${peminjamanId}/pengembalian`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Pengembalian berhasil:', result)
            // Real-time event akan handle update UI
        } else {
            alert('Gagal mengembalikan buku: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('❌ Error pengembalian:', error)
        alert('Gagal mengembalikan buku: ' + error.message);
    }
}

// ✅ LOAD DATA SAAT PERTAMA KALI
document.addEventListener('DOMContentLoaded', function() {
    // Load data awal
    if (window.realTimeClient) {
        window.realTimeClient.loadBooks();
        window.realTimeClient.loadPeminjamanList();
    }
    
    // Tambah section riwayat jika belum ada
    const peminjamanSection = document.querySelector('#peminjaman-section');
    if (peminjamanSection && !document.getElementById('riwayat-peminjaman')) {
        const historyHTML = `
            <h3>Riwayat Peminjaman</h3>
            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>Judul Buku</th>
                        <th>Tanggal Pinjam</th>
                        <th>Tanggal Kembali</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="riwayat-peminjaman">
                    <!-- Riwayat akan diisi otomatis -->
                </tbody>
            </table>
        `;
        peminjamanSection.innerHTML += historyHTML;
    }
});

// Initialize
window.realTimeClient = new RealTimeClient();