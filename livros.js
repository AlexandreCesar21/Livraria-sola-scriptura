document.addEventListener("DOMContentLoaded", function () {
        var sidebarToggle = document.getElementById("sidebarToggle");
        var sidebar = document.getElementById("sidebar");
        var mainContent = document.querySelector(".main-content");
        if (sidebarToggle && sidebar && mainContent) {
          sidebarToggle.addEventListener("click", function () {
            sidebar.classList.toggle("collapsed");
            mainContent.classList.toggle("sidebar-collapsed");
            var icon = sidebarToggle.querySelector("i");
            if (icon) {
              icon.classList.toggle("fa-chevron-left");
              icon.classList.toggle("fa-chevron-right");
            }
          });
        }
        var mobileBtn = document.getElementById("mobileMenuBtn");
        if (mobileBtn && sidebar) {
          mobileBtn.addEventListener("click", function () {
            sidebar.classList.toggle("mobile-open");
          });
        }
        var modalMap = {
          addBookBtn: "bookModal",
          addClientBtn: "clientModal",
          addProductBtn: "productModal",
          addUserBtn: "userModal",
          editBookstoreBtn: "bookstoreModal",
          processReturnBtn: "returnModal",
        };
        Object.keys(modalMap).forEach(function (k) {
          var btn = document.getElementById(k);
          if (btn) {
            btn.addEventListener("click", function (e) {
              e.preventDefault();
              var m = document.getElementById(modalMap[k]);
              if (m) m.classList.add("show");
            });
          }
        });
        document
          .querySelectorAll('.close-btn, [id^="cancel"]')
          .forEach(function (btn) {
            btn.addEventListener("click", function () {
              var modal = btn.closest(".modal");
              if (modal) modal.classList.remove("show");
            });
          });
        document.querySelectorAll(".modal").forEach(function (mod) {
          mod.addEventListener("click", function (e) {
            if (e.target === mod) mod.classList.remove("show");
          });
        });
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape")
            document.querySelectorAll(".modal.show").forEach(function (m) {
              m.classList.remove("show");
            });
        });
        function showToast(msg, type, dur) {
          var t = document.createElement("div");
          t.className = "toast show " + (type || "success");
          t.textContent = msg;
          document.body.appendChild(t);
          setTimeout(function () {
            t.classList.remove("show");
            setTimeout(function () {
              t.remove();
            }, 300);
          }, dur || 3000);
        }
        document.querySelectorAll("form").forEach(function (form) {
          form.addEventListener("submit", function (e) {
            e.preventDefault();
            var m = form.closest(".modal");
            if (m) m.classList.remove("show");
            showToast("Operação realizada com sucesso");
          });
        });
      });






(function () {
  const STORAGE_KEY = 'livraria_books';

  function saveBooks(books) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
  function loadBooksFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }
  function formatCurrency(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function todayDDMMYYYY() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  function genId() {
    return 'b_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  }

  const booksTableBody = document.getElementById('booksTableBody');
  const bookForm = document.getElementById('bookForm');
  const addBookBtn = document.getElementById('addBookBtn');
  const cancelBookBtn = document.getElementById('cancelBookBtn');
  const closeBookModalBtn = document.getElementById('closeBookModal');

  const inputISBN = document.getElementById('bookISBN');
  const inputTitle = document.getElementById('bookTitle');
  const inputAuthor = document.getElementById('bookAuthor');
  const inputPublisher = document.getElementById('bookPublisher');
  const inputCategory = document.getElementById('bookCategory');
  const inputCoverType = document.getElementById('bookCoverType');
  const inputCondition = document.getElementById('bookCondition'); 
  const inputStatus = document.getElementById('bookStatus'); 
  const inputValue = document.getElementById('bookValue');
  const inputQuantity = document.getElementById('bookQuantity');

  let books = [];

  function renderTable() {
    booksTableBody.innerHTML = '';
    if (!books.length) {
      return;
    }

    books.forEach(book => {
      const tr = document.createElement('tr');

      const titleTd = document.createElement('td');
      const titleDiv = document.createElement('div');
      titleDiv.style.display = 'flex';
      titleDiv.style.flexDirection = 'column';
      const tStrong = document.createElement('strong');
      tStrong.textContent = book.title;
      const isbnSpan = document.createElement('small');
      isbnSpan.style.display = 'block';
      isbnSpan.style.marginTop = '6px';
      isbnSpan.style.color = 'var(--text-muted)';
      isbnSpan.textContent = 'ISBN: ' + (book.isbn || '-');
      titleDiv.appendChild(tStrong);
      titleDiv.appendChild(isbnSpan);
      titleTd.appendChild(titleDiv);

      const authorTd = document.createElement('td');
      authorTd.textContent = book.author || '-';

      const categoryTd = document.createElement('td');
      const catBadge = document.createElement('span');
      catBadge.className = 'badge';
      catBadge.textContent = (book.category || '').toUpperCase();
      categoryTd.appendChild(catBadge);

      const conditionTd = document.createElement('td');
      const condBadge = document.createElement('span');
      condBadge.className = 'badge';
      condBadge.style.padding = '6px 10px';
      condBadge.style.borderRadius = '12px';
      condBadge.style.fontSize = '0.85rem';
      if ((book.condition || '').toUpperCase() === 'NOVO') {
        condBadge.textContent = '✨ Novo';
        condBadge.style.background = 'rgba(58,0,0,0.06)';
        condBadge.style.color = 'var(--primary-color)';
      } else {
        condBadge.textContent = '♻️ Usado';
        condBadge.style.background = 'rgba(229,62,62,0.06)';
        condBadge.style.color = 'var(--error-color)';
      }
      conditionTd.appendChild(condBadge);

      const valueTd = document.createElement('td');
      valueTd.textContent = formatCurrency(book.value);

      const qtyTd = document.createElement('td');
      qtyTd.textContent = book.quantity;
      if (Number(book.quantity) <= 5) {
        qtyTd.style.color = 'var(--error-color)';
        qtyTd.style.fontWeight = '700';
      }

      const dateTd = document.createElement('td');
      dateTd.textContent = book.dateAdded || '-';

      const statusTd = document.createElement('td');
      statusTd.textContent = (book.status || 'ATIVO').toUpperCase();

      const actionsTd = document.createElement('td');
      const actionWrap = document.createElement('div');
      actionWrap.className = 'action-buttons';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-icon btn-edit';
      editBtn.title = 'Editar';
      editBtn.innerHTML = '<i class="fas fa-pen"></i>';
      editBtn.addEventListener('click', () => openEditModal(book.id));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-icon btn-delete';
      deleteBtn.title = 'Excluir';
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
      deleteBtn.addEventListener('click', () => {
        if (confirm('Deseja realmente excluir este livro?')) {
          deleteBook(book.id);
        }
      });

      actionWrap.appendChild(editBtn);
      actionWrap.appendChild(deleteBtn);
      actionsTd.appendChild(actionWrap);

      tr.appendChild(titleTd);
      tr.appendChild(authorTd);
      tr.appendChild(categoryTd);
      tr.appendChild(conditionTd);
      tr.appendChild(valueTd);
      tr.appendChild(qtyTd);
      tr.appendChild(dateTd);
      tr.appendChild(statusTd);
      tr.appendChild(actionsTd);

      booksTableBody.appendChild(tr);
    });
  }

  function addBook(bookData) {
    const book = {
      id: genId(),
      isbn: bookData.isbn || '',
      title: bookData.title || '',
      author: bookData.author || '',
      publisher: bookData.publisher || '',
      category: bookData.category || '',
      coverType: bookData.coverType || '',
      condition: bookData.condition || '',
      status: bookData.status || 'ATIVO',
      value: Number(bookData.value) || 0,
      quantity: Number(bookData.quantity) || 0,
      dateAdded: todayDDMMYYYY()
    };
    books.unshift(book); 
    saveBooks(books);
    renderTable();
    return book.id;
  }

  function updateBook(id, data) {
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return false;
    books[idx] = Object.assign({}, books[idx], {
      isbn: data.isbn || books[idx].isbn,
      title: data.title || books[idx].title,
      author: data.author || books[idx].author,
      publisher: data.publisher || books[idx].publisher,
      category: data.category || books[idx].category,
      coverType: data.coverType || books[idx].coverType,
      condition: data.condition || books[idx].condition,
      status: data.status || books[idx].status,
      value: Number(data.value) || books[idx].value,
      quantity: Number(data.quantity) || books[idx].quantity
    });
    saveBooks(books);
    renderTable();
    return true;
  }

  function deleteBook(id) {
    books = books.filter(b => b.id !== id);
    saveBooks(books);
    renderTable();
  }

  function openAddModal() {
    bookForm.dataset.mode = 'add';
    delete bookForm.dataset.editId;
    bookForm.reset();
    inputStatus.value = 'ATIVO';
    inputCondition.value = 'NOVO';
    const modal = document.getElementById('bookModal');
    if (modal) modal.classList.add('show');
  }

  function openEditModal(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    bookForm.dataset.mode = 'edit';
    bookForm.dataset.editId = id;
    inputISBN.value = book.isbn || '';
    inputTitle.value = book.title || '';
    inputAuthor.value = book.author || '';
    inputPublisher.value = book.publisher || '';
    inputCategory.value = book.category || '';
    inputCoverType.value = book.coverType || '';
    inputCondition.value = book.condition || 'NOVO';
    inputStatus.value = book.status || 'ATIVO';
    inputValue.value = book.value || 0;
    inputQuantity.value = book.quantity || 0;
    const modal = document.getElementById('bookModal');
    if (modal) modal.classList.add('show');
  }

  bookForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const formMode = bookForm.dataset.mode || 'add';
    const payload = {
      isbn: inputISBN.value.trim(),
      title: inputTitle.value.trim(),
      author: inputAuthor.value.trim(),
      publisher: inputPublisher.value.trim(),
      category: inputCategory.value || '',
      coverType: inputCoverType.value || '',
      condition: inputCondition.value || '',
      status: inputStatus.value || 'ATIVO',
      value: Number(inputValue.value) || 0,
      quantity: Number(inputQuantity.value) || 0
    };

    if (!payload.title) {
      alert('Preencha ao menos o título do livro.');
      return;
    }

    if (formMode === 'add') {
      addBook(payload);
      showLocalToast('Livro adicionado com sucesso!');
    } else if (formMode === 'edit') {
      const id = bookForm.dataset.editId;
      updateBook(id, payload);
      showLocalToast('Livro atualizado com sucesso!');
    }

    const modal = document.getElementById('bookModal');
    if (modal) modal.classList.remove('show');
    delete bookForm.dataset.mode;
    delete bookForm.dataset.editId;
    bookForm.reset();
  });

  function showLocalToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer') || document.body;
    const t = document.createElement('div');
    t.className = 'toast show ' + (type || 'success');
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, duration);
  }

  if (addBookBtn) addBookBtn.addEventListener('click', function (e) {
    e.preventDefault();
    openAddModal();
  });
  if (cancelBookBtn) cancelBookBtn.addEventListener('click', function () {
    const modal = document.getElementById('bookModal');
    if (modal) modal.classList.remove('show');
    bookForm.reset();
    delete bookForm.dataset.mode;
    delete bookForm.dataset.editId;
  });
  if (closeBookModalBtn) closeBookModalBtn.addEventListener('click', function () {
    const modal = document.getElementById('bookModal');
    if (modal) modal.classList.remove('show');
  });

  function init() {
    books = loadBooksFromStorage();
    renderTable();
  }

  window.__livraria_openEditModal = openEditModal;

  init();
})();


(function() {
  const STORAGE_KEY = 'livraria_books';
  const tableBody = document.getElementById('booksTableBody');

  function loadBooks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function formatCurrency(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function renderFilteredTable(books) {
    tableBody.innerHTML = '';

    if (!books.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="9" style="text-align:center;padding:1rem;color:#777;">Nenhum livro encontrado</td>';
      tableBody.appendChild(tr);
      return;
    }

    books.forEach(book => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display:flex;flex-direction:column;">
            <strong>${book.title}</strong>
            <small style="color:#888;margin-top:6px;">ISBN: ${book.isbn || '-'}</small>
          </div>
        </td>
        <td>${book.author || '-'}</td>
        <td><span class="badge">${(book.category || '').toUpperCase()}</span></td>
        <td>
          <span class="badge" style="padding:6px 10px;border-radius:12px;font-size:0.85rem;
            background:${book.condition?.toUpperCase()==='NOVO'?'rgba(58,0,0,0.06)':'rgba(229,62,62,0.06)'}; 
            color:${book.condition?.toUpperCase()==='NOVO'?'var(--primary-color)':'var(--error-color)'};">
            ${book.condition?.toUpperCase()==='NOVO'?'✨ Novo':'♻️ Usado'}
          </span>
        </td>
        <td>${formatCurrency(book.value)}</td>
        <td style="color:${book.quantity<=5?'var(--error-color)':'inherit'};font-weight:${book.quantity<=5?'700':'400'};">${book.quantity}</td>
        <td>${book.dateAdded || '-'}</td>
        <td>${(book.status || 'ATIVO').toUpperCase()}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" title="Editar" onclick="__livraria_openEditModal('${book.id}')"><i class="fas fa-pen"></i></button>
            <button class="btn-icon btn-delete" title="Excluir" onclick="__livraria_deleteBook && __livraria_deleteBook('${book.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  function applyFilters() {
    let books = loadBooks();

    const title = document.getElementById('filterBookTitle').value.trim().toLowerCase();
    const author = document.getElementById('filterBookAuthor').value.trim().toLowerCase();
    const publisher = document.getElementById('filterBookPublisher').value.trim().toLowerCase();
    const category = document.getElementById('filterBookCategory').value;
    const condition = document.getElementById('filterBookCondition').value;
    const minValue = parseFloat(document.getElementById('filterBookMinValue').value) || 0;
    const maxValue = parseFloat(document.getElementById('filterBookMaxValue').value) || Infinity;
    const minStock = parseFloat(document.getElementById('filterBookMinStock').value) || 0;
    const status = document.getElementById('filterBookStatus').value;

    const filtered = books.filter(book => {
      return (
        (!title || book.title.toLowerCase().includes(title)) &&
        (!author || book.author.toLowerCase().includes(author)) &&
        (!publisher || (book.publisher || '').toLowerCase().includes(publisher)) &&
        (!category || category === 'Todas' || book.category === category) &&
        (!condition || condition === 'Todos' || book.condition === condition) &&
        (!status || status === 'Todos' || book.status === status) &&
        (book.value >= minValue && book.value <= maxValue) &&
        (book.quantity >= minStock)
      );
    });

    renderFilteredTable(filtered);
  }

  const filterIds = [
    'filterBookTitle',
    'filterBookAuthor',
    'filterBookPublisher',
    'filterBookCategory',
    'filterBookCondition',
    'filterBookMinValue',
    'filterBookMaxValue',
    'filterBookMinStock',
    'filterBookStatus'
  ];

  filterIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    }
  });

  window.addEventListener('storage', applyFilters);

  window.addEventListener('DOMContentLoaded', applyFilters);
})();

