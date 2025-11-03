
(function () {
  const STORAGE_KEY = 'livraria_books';

  const $ = (id) => document.getElementById(id);

  if (!$('toastContainer')) {
    const tc = document.createElement('div');
    tc.id = 'toastContainer';
    tc.className = 'toast-container';
    document.body.appendChild(tc);
  }

  const toastContainer = $('toastContainer');
  const tableBody = $('booksTableBody');

  const bookForm = $('bookForm');
  const addBookBtn = $('addBookBtn');
  const cancelBookBtn = $('cancelBookBtn');
  const closeBookModalBtn = $('closeBookModal');
  const bookModal = $('bookModal');

  const deleteModal = $('deleteBookModal');
  const confirmDeleteBtn = $('confirmDeleteBookBtn');
  const cancelDeleteBtn = $('cancelDeleteBookBtn');

  const filterIds = [
    'filterBookTitle', 'filterBookAuthor', 'filterBookPublisher',
    'filterBookCategory', 'filterBookCondition', 'filterBookMinValue',
    'filterBookMaxValue', 'filterBookMinStock', 'filterBookStatus'
  ];

  const inputISBN = $('bookISBN');
  const inputTitle = $('bookTitle');
  const inputAuthor = $('bookAuthor');
  const inputPublisher = $('bookPublisher');
  const inputCategory = $('bookCategory');
  const inputCoverType = $('bookCoverType'); 
  const inputCondition = $('bookCondition'); 
  const inputStatus = $('bookStatus'); 
  const inputValue = $('bookValue');
  const inputQuantity = $('bookQuantity');

  function loadBooks() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }
  function saveBooks(books) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    window.dispatchEvent(new CustomEvent('booksUpdated'));
  }
  function genId() {
    try { return crypto.randomUUID(); } catch { return 'b_' + Date.now().toString(36); }
  }
  function formatCurrency(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function today() {
    const d = new Date();
    return d.toLocaleDateString('pt-BR');
  }

  function showToast(message, duration = 3000) {
    const t = document.createElement('div');
    t.className = 'toast';
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = '✓';
    const txt = document.createElement('span');
    txt.className = 'toast-text';
    txt.textContent = ' ' + message;
    t.appendChild(icon);
    t.appendChild(txt);
    toastContainer.appendChild(t);
    setTimeout(() => {
      t.classList.add('hide');
      setTimeout(() => t.remove(), 300);
    }, duration);
  }

  
  function renderTable(books = null) {
    const data = Array.isArray(books) ? books : loadBooks();
    tableBody.innerHTML = '';

    if (!data.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="9" style="text-align:center;padding:1rem;color:#777;">Nenhum livro cadastrado</td>';
      tableBody.appendChild(tr);
      return;
    }

    for (const book of data) {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>
          <div style="display:flex;flex-direction:column;">
            <strong>${escapeHtml(book.title)}</strong>
            <small style="color:#888;margin-top:6px;">ISBN: ${escapeHtml(book.isbn || '-')}</small>
          </div>
        </td>
        <td>${escapeHtml(book.author || '-')}</td>
        <td><span class="badge">${escapeHtml((book.category || '').toUpperCase())}</span></td>
        <td>
          <span class="badge" style="padding:6px 10px;border-radius:12px;font-size:0.85rem;
            background:${(book.condition || '').toUpperCase() === 'NOVO' ? 'rgba(58,0,0,0.06)' : 'rgba(229,62,62,0.06)'};
            color:${(book.condition || '').toUpperCase() === 'NOVO' ? 'var(--primary-color)' : 'var(--error-color)'};">
            ${(book.condition || '').toUpperCase() === 'NOVO' ? '✨ Novo' : '♻️ Usado'}
          </span>
        </td>
        <td>${formatCurrency(book.value)}</td>
        <td style="color:${Number(book.quantity) <= 5 ? 'var(--error-color)' : 'inherit'};font-weight:${Number(book.quantity) <= 5 ? '700' : '400'};">${escapeHtml(String(book.quantity || 0))}</td>
        <td>${escapeHtml(book.dateAdded || '-')}</td>
        <td>${escapeHtml((book.status || 'ATIVO').toUpperCase())}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" title="Editar" data-edit-id="${book.id}"><i class="fas fa-pen"></i></button>
            <button class="btn-icon btn-delete" title="Excluir" data-delete-id="${book.id}"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
    }

    tableBody.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.onclick = () => openEditModal(btn.getAttribute('data-edit-id'));
    });
    tableBody.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.onclick = () => openDeleteModal(btn.getAttribute('data-delete-id'));
    });
  }


  function escapeHtml(s) {
    return (s === undefined || s === null) ? '' : String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function addBookFromForm(dataObj) {
    const books = loadBooks();
    const book = {
      id: genId(),
      isbn: dataObj.isbn || '',
      title: dataObj.title || '',
      author: dataObj.author || '',
      publisher: dataObj.publisher || '',
      category: dataObj.category || '',
      condition: dataObj.condition || '',
      coverType: dataObj.coverType || dataObj.bookCoverType || '',
      status: dataObj.status || 'ATIVO',
      value: Number(dataObj.value) || 0,
      quantity: Number(dataObj.quantity) || 0,
      dateAdded: today()
    };
    books.unshift(book);
    saveBooks(books);
    renderTable(books);
    showToast('Livro adicionado com sucesso!');
  }

  function updateBookFromForm(id, dataObj) {
    const books = loadBooks();
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return false;
    books[idx] = Object.assign({}, books[idx], {
      isbn: dataObj.isbn || books[idx].isbn,
      title: dataObj.title || books[idx].title,
      author: dataObj.author || books[idx].author,
      publisher: dataObj.publisher || books[idx].publisher,
      category: dataObj.category || books[idx].category,
      condition: dataObj.condition || books[idx].condition,
      status: dataObj.status || books[idx].status,
      value: Number(dataObj.value) || books[idx].value,
      quantity: Number(dataObj.quantity) || books[idx].quantity
    });
    saveBooks(books);
    renderTable(books);
    showToast('Livro atualizado com sucesso!');
    return true;
  }

  function deleteBookById(id) {
    const books = loadBooks().filter(b => b.id !== id);
    saveBooks(books);
    renderTable(books);
    showToast('Livro excluído com sucesso!');
  }

  function openAddModal() {
    if (!bookForm) return;
    bookForm.dataset.mode = 'add';
    delete bookForm.dataset.editId;
    bookForm.reset();
    if (inputStatus) inputStatus.value = 'ATIVO';
    if (inputCondition) inputCondition.value = 'NOVO';
    if (bookModal) bookModal.classList.add('show');
  }

  function openEditModal(id) {
    const books = loadBooks();
    const book = books.find(b => b.id === id);
    if (!book) return;
    if (!bookForm) return;
    bookForm.dataset.mode = 'edit';
    bookForm.dataset.editId = id;
    if (inputISBN) inputISBN.value = book.isbn || '';
    if (inputTitle) inputTitle.value = book.title || '';
    if (inputAuthor) inputAuthor.value = book.author || '';
    if (inputPublisher) inputPublisher.value = book.publisher || '';
    if (inputCategory) inputCategory.value = book.category || '';
    if (inputCoverType) inputCoverType.value = book.coverType || book.bookCoverType || '';
    if (inputCondition) inputCondition.value = book.condition || 'NOVO';
    if (inputStatus) inputStatus.value = book.status || 'ATIVO';
    if (inputValue) inputValue.value = book.value || 0;
    if (inputQuantity) inputQuantity.value = book.quantity || 0;
    if (bookModal) bookModal.classList.add('show');
  }

  let pendingDeleteId = null;
  function openDeleteModal(id) {
    pendingDeleteId = id;
    if (deleteModal) deleteModal.classList.add('show');
  }
  function closeDeleteModal() {
    pendingDeleteId = null;
    if (deleteModal) deleteModal.classList.remove('show');
  }
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', function () {
    if (!pendingDeleteId) return;
    deleteBookById(pendingDeleteId);
    closeDeleteModal();
  });
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  if (deleteModal) deleteModal.addEventListener('click', function (e) { if (e.target === deleteModal) closeDeleteModal(); });

  
  if (addBookBtn) addBookBtn.addEventListener('click', function (e) { e.preventDefault(); openAddModal(); });
  if (cancelBookBtn) cancelBookBtn.addEventListener('click', function () {
    if (bookModal) bookModal.classList.remove('show');
    if (bookForm) { bookForm.reset(); delete bookForm.dataset.mode; delete bookForm.dataset.editId; }
  });
  if (closeBookModalBtn) closeBookModalBtn.addEventListener('click', function () { if (bookModal) bookModal.classList.remove('show'); });


  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (bookModal) bookModal.classList.remove('show');
      if (deleteModal) deleteModal.classList.remove('show');
    }
  });

  if (bookModal) bookModal.addEventListener('click', function (e) { if (e.target === bookModal) bookModal.classList.remove('show'); });

  
  if (bookForm) {
    bookForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const payload = {
        isbn: inputISBN ? inputISBN.value.trim() : '',
        title: inputTitle ? inputTitle.value.trim() : '',
        author: inputAuthor ? inputAuthor.value.trim() : '',
        publisher: inputPublisher ? inputPublisher.value.trim() : '',
        category: inputCategory ? inputCategory.value.trim() : '',
        coverType: inputCoverType ? inputCoverType.value.trim() : '',
        condition: inputCondition ? inputCondition.value : 'NOVO',
        status: inputStatus ? inputStatus.value : 'ATIVO',
        value: inputValue ? Number(inputValue.value) : 0,
        quantity: inputQuantity ? Number(inputQuantity.value) : 0
      };

      if (!payload.title) {
        alert('Preencha ao menos o título do livro.');
        return;
      }

      const mode = bookForm.dataset.mode || 'add';
      if (mode === 'add') {
        addBookFromForm(payload);
      } else if (mode === 'edit') {
        const id = bookForm.dataset.editId;
        updateBookFromForm(id, payload);
      }

      if (bookModal) bookModal.classList.remove('show');
      bookForm.reset();
      delete bookForm.dataset.mode;
      delete bookForm.dataset.editId;
    });
  }

  
  function applyFilters() {
    const all = loadBooks();

    
    const title = ($('filterBookTitle') && $('filterBookTitle').value.trim().toLowerCase()) || '';
    const author = ($('filterBookAuthor') && $('filterBookAuthor').value.trim().toLowerCase()) || '';
    const publisher = ($('filterBookPublisher') && $('filterBookPublisher').value.trim().toLowerCase()) || '';
    const category = ($('filterBookCategory') && $('filterBookCategory').value) || '';
    const condition = ($('filterBookCondition') && $('filterBookCondition').value) || '';
    const minValue = parseFloat(($('filterBookMinValue') && $('filterBookMinValue').value) || 0) || 0;
    const maxValue = parseFloat(($('filterBookMaxValue') && $('filterBookMaxValue').value) || Infinity) || Infinity;
    const minStock = parseFloat(($('filterBookMinStock') && $('filterBookMinStock').value) || 0) || 0;
    const status = ($('filterBookStatus') && $('filterBookStatus').value) || '';

    const filtered = all.filter(book => {
      return (!title || (book.title && book.title.toLowerCase().includes(title))) &&
             (!author || (book.author && book.author.toLowerCase().includes(author))) &&
             (!publisher || (book.publisher && book.publisher.toLowerCase().includes(publisher))) &&
             (!category || category === 'Todas' || (book.category === category)) &&
             (!condition || condition === 'Todos' || (book.condition === condition)) &&
             (!status || status === 'Todos' || (book.status === status)) &&
             (Number(book.value) >= minValue && Number(book.value) <= maxValue) &&
             (Number(book.quantity) >= minStock);
    });

    renderTable(filtered);
  }

  
  filterIds.forEach(id => {
    const el = $(id);
    if (el) {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    }
  });

  
  window.addEventListener('storage', applyFilters);
  window.addEventListener('booksUpdated', applyFilters);
  window.addEventListener('DOMContentLoaded', function () {
    
    applyFilters();
  });

  
  window.__livraria_openEditModal = openEditModal;
  window.__livraria_deleteBook = openDeleteModal;

 
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(applyFilters, 50);
  }

})(); 




const UIManager = {
  handleLogout() {
    let modal = document.getElementById("logoutModal");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "logoutModal";
      modal.innerHTML = `
        <div class="logout-overlay">
          <div class="logout-box">
            <h2 class="logout-title">Sair do Sistema</h2>
            <p class="logout-message">Tem certeza que deseja sair?</p>
            <div class="logout-actions">
              <button id="cancelLogout" class="logout-btn cancel">Cancelar</button>
              <button id="confirmLogout" class="logout-btn confirm">Confirmar</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const style = document.createElement("style");
      style.textContent = `
        .logout-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99999;
          animation: fadeIn 0.25s ease;
        }

        .logout-box {
          background: #fff;
          padding: 30px 40px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          width: 360px;
          animation: popUp 0.25s ease;
        }

        .logout-title {
          font-size: 20px;
          font-weight: 700;
          color: #4b0d0d;
          margin-bottom: 10px;
        }

        .logout-message {
          font-size: 15px;
          color: #333;
          margin-bottom: 24px;
        }

        .logout-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
        }

        .logout-btn {
          background-color: #4b0d0d;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          padding: 10px 22px;
          font-size: 15px;
          transition: background 0.2s ease, transform 0.1s ease;
        }

        .logout-btn:hover {
          background-color: #2d0707;
          transform: scale(1.03);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes popUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    modal.querySelector(".logout-overlay").style.display = "flex";

    const cancelBtn = modal.querySelector("#cancelLogout");
    const confirmBtn = modal.querySelector("#confirmLogout");
    const overlay = modal.querySelector(".logout-overlay");

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.style.display = "none";
    });

    cancelBtn.onclick = () => {
      overlay.style.display = "none";
    };

    confirmBtn.onclick = () => {
      overlay.style.display = "none";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 300);
    };
  },
};



const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const icon = toggleBtn.querySelector('i');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleBtn.classList.toggle('rotate');
  });