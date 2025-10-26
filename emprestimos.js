document.addEventListener("DOMContentLoaded", () => {
  try {
    const $ = id => document.getElementById(id);

    // Elementos principais
    const loanCartBookSelect = $("loanCartBookSelect");
    const loanCartQuantity = $("loanCartQuantity");
    const addToLoanCartBtn = $("addToLoanCartBtn");
    const loanCartItemsContainer = $("loanCartItems");
    const clearLoanCartBtn = $("clearLoanCartBtn");
    const loanCheckoutSection = $("loanCheckoutSection");
    const loanCheckoutForm = $("loanCheckoutForm");
    const loanCheckoutClientSelect = $("loanCheckoutClientSelect");
    const loanCheckoutReturnDate = $("loanCheckoutReturnDate");
    const loanCheckoutNotes = $("loanCheckoutNotes");
    const loanCartItemCount = $("loanCartItemCount");
    const loanTotalItems = $("loanTotalItems");
    const loansTableBody = $("loansTableBody");

    // Chaves do localStorage
    const KEY_BOOKS = "livraria_books";
    const KEY_CLIENTS = "livraria_clients";
    const KEY_LOANS = "livraria_loans";

    let books = JSON.parse(localStorage.getItem(KEY_BOOKS)) || [];
    let clients = JSON.parse(localStorage.getItem(KEY_CLIENTS)) || [];
    let loans = JSON.parse(localStorage.getItem(KEY_LOANS)) || [];

    // Utils
    const formatDate = d => new Date(d).toLocaleDateString("pt-BR");
    const todayISO = () => new Date().toISOString();

    const saveBooks = () => localStorage.setItem(KEY_BOOKS, JSON.stringify(books));
    const saveLoans = () => localStorage.setItem(KEY_LOANS, JSON.stringify(loans));

    // Toast simples
    function showToast(msg) {
      const toast = document.createElement("div");
      toast.textContent = msg;
      Object.assign(toast.style, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        background: "#3c0d00",
        color: "#fff",
        padding: "10px 18px",
        borderRadius: "8px",
        zIndex: 9999,
        fontSize: "0.9rem",
      });
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    }

    // Preenche selects
    function populateLoanBookSelect() {
      loanCartBookSelect.innerHTML = `<option value="">Selecione um livro disponível</option>`;
      books.filter(b => b.status === "ATIVO" && b.quantity > 0)
        .forEach(b => {
          const opt = document.createElement("option");
          opt.value = b.id;
          opt.textContent = `${b.title} - ${b.author} (Estoque: ${b.quantity})`;
          loanCartBookSelect.appendChild(opt);
        });
    }

    function populateLoanClientSelect() {
      loanCheckoutClientSelect.innerHTML = `<option value="">Selecione o cliente</option>`;
      clients.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.name || c.nome} - ${c.documento || c.cpf || ""}`;
        loanCheckoutClientSelect.appendChild(opt);
      });
    }

    // Carrinho
    let cart = [];

    function updateLoanCartUI() {
      if (!loanCartItemsContainer) return;
      loanCartItemsContainer.innerHTML = "";

      const totalItems = cart.reduce((a, c) => a + c.qtd, 0);
      if (loanCartItemCount) loanCartItemCount.textContent = totalItems;
      if (loanTotalItems) loanTotalItems.textContent = totalItems;

      if (!cart.length) {
        loanCartItemsContainer.innerHTML = `
          <div class="text-center py-4 text-muted">
            <i class="fas fa-book-reader" style="font-size:2rem;opacity:0.25;margin-bottom:8px"></i>
            <div>Carrinho vazio</div>
            <div style="font-size:0.9rem">Adicione livros ao carrinho para registrar um empréstimo</div>
          </div>`;
        if (loanCheckoutSection) loanCheckoutSection.style.display = "none";
        return;
      }

      cart.forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = "loan-cart-item";
        card.innerHTML = `
          <div class="loan-info">
            <div class="fw-bold" style="font-size: 1.05rem; color: #3c0d00;">${item.title}</div>
            <div class="text-muted">${item.author || ""}</div>
            <div class="text-secondary small">
              Categoria: ${item.category || "—"} &nbsp;&nbsp; Estoque: ${item.quantity}
            </div>
          </div>

          <div class="loan-controls">
            <button class="btn-minus" data-idx="${idx}">−</button>
            <input type="number" class="loan-qty" value="${item.qtd}" min="1" readonly />
            <button class="btn-plus" data-idx="${idx}">+</button>
            <span>${item.qtd} exemplares</span>
            <button class="btn-delete" data-idx="${idx}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
        loanCartItemsContainer.appendChild(card);
      });

      if (loanCheckoutSection) loanCheckoutSection.style.display = "block";
    }

    // Adicionar livro ao carrinho
    addToLoanCartBtn.addEventListener("click", () => {
      const id = loanCartBookSelect.value;
      const qtd = Number(loanCartQuantity.value);
      if (!id || qtd <= 0) return showToast("Selecione o livro e a quantidade");

      const book = books.find(b => b.id === id);
      if (!book) return showToast("Livro não encontrado");

      if (qtd > book.quantity) return showToast("Quantidade maior que estoque disponível");

      const existing = cart.find(i => i.id === id);
      if (existing) {
        const newQty = existing.qtd + qtd;
        if (newQty > book.quantity) return showToast("Excede estoque disponível");
        existing.qtd = newQty;
      } else {
        cart.push({
          id: book.id,
          title: book.title,
          author: book.author,
          category: book.category,
          quantity: book.quantity,
          qtd
        });
      }

      loanCartBookSelect.value = "";
      loanCartQuantity.value = "";
      updateLoanCartUI();
      showToast("Livro adicionado ao carrinho");
    });

    // Limpar carrinho
    clearLoanCartBtn.addEventListener("click", () => {
      cart = [];
      updateLoanCartUI();
      showToast("Carrinho limpo");
    });

    // Ações nos botões do carrinho
    loanCartItemsContainer.addEventListener("click", (e) => {
      const idx = e.target.dataset.idx;
      if (e.target.classList.contains("btn-minus")) {
        cart[idx].qtd = Math.max(1, cart[idx].qtd - 1);
        updateLoanCartUI();
      } else if (e.target.classList.contains("btn-plus")) {
        if (cart[idx].qtd + 1 > cart[idx].quantity) return showToast("Excede o estoque disponível");
        cart[idx].qtd += 1;
        updateLoanCartUI();
      } else if (e.target.classList.contains("btn-delete") || e.target.closest(".btn-delete")) {
        cart.splice(idx, 1);
        updateLoanCartUI();
      }
    });

    // Registrar empréstimo
    loanCheckoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!cart.length) return showToast("Carrinho vazio");

      const clienteId = loanCheckoutClientSelect.value;
      if (!clienteId) return showToast("Selecione o cliente");

      const dataPrevista = loanCheckoutReturnDate.value;
      if (!dataPrevista) return showToast("Informe a data prevista de devolução");

      const cliente = clients.find(c => c.id == clienteId);
      const novoEmprestimo = {
        id: Date.now(),
        clienteId,
        clienteNome: cliente?.name || cliente?.nome || "",
        dataEmprestimo: todayISO(),
        dataPrevistaDevolucao: new Date(dataPrevista).toISOString(),
        dataDevolucaoReal: null,
        observacoes: loanCheckoutNotes.value || "",
        status: "Ativo",
        itens: cart.map(c => ({ id: c.id, title: c.title, qtd: c.qtd }))
      };

      // Atualiza estoque
      cart.forEach(it => {
        const b = books.find(b => b.id === it.id);
        if (b) b.quantity -= it.qtd;
      });

      loans.unshift(novoEmprestimo);
      saveBooks();
      saveLoans();

      cart = [];
      updateLoanCartUI();
      renderLoansTable();
      populateLoanBookSelect();
      loanCheckoutForm.reset();
      showToast("Empréstimo registrado com sucesso!");
    });

    // Renderizar tabela de empréstimos
    function renderLoansTable() {
      loansTableBody.innerHTML = "";
      if (!loans.length) {
        loansTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Nenhum empréstimo registrado</td></tr>`;
        return;
      }

      const now = new Date();
      loans.forEach(l => {
        const cliente = clients.find(c => c.id == l.clienteId);
        const dias = Math.ceil((new Date(l.dataPrevistaDevolucao) - now) / (1000 * 60 * 60 * 24));
        let status = l.status;
        if (!l.dataDevolucaoReal && dias < 0) status = "Atrasado";
        if (l.dataDevolucaoReal) status = "Finalizado";

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formatDate(l.dataEmprestimo)}</td>
          <td>${cliente?.name || cliente?.nome || "—"}</td>
          <td>${l.itens.map(i => i.title).join(", ")}</td>
          <td>${l.itens.reduce((a, b) => a + b.qtd, 0)}</td>
          <td>${formatDate(l.dataPrevistaDevolucao)}</td>
          <td>${dias >= 0 ? `${dias} dias restantes` : `${Math.abs(dias)} dias de atraso`}</td>
          <td><span class="badge ${status === "Ativo" ? "bg-success" : status === "Atrasado" ? "bg-danger" : "bg-secondary"}">${status}</span></td>
          <td>
            ${status !== "Finalizado"
              ? `<button class="btn btn-sm btn-return" data-id="${l.id}">✓</button>`
              : `<small>${formatDate(l.dataDevolucaoReal)}</small>`}
          </td>
        `;
        loansTableBody.appendChild(row);
      });
    }

    // Registrar devolução
    loansTableBody.addEventListener("click", e => {
      if (e.target.classList.contains("btn-return")) {
        const id = e.target.dataset.id;
        const loan = loans.find(l => l.id == id);
        if (!loan || loan.dataDevolucaoReal) return;
        loan.dataDevolucaoReal = todayISO();
        loan.status = "Finalizado";
        loan.itens.forEach(it => {
          const b = books.find(b => b.id == it.id);
          if (b) b.quantity += it.qtd;
        });
        saveBooks();
        saveLoans();
        renderLoansTable();
        populateLoanBookSelect();
        showToast("Devolução registrada com sucesso!");
      }
    });

    // Inicialização
    populateLoanBookSelect();
    populateLoanClientSelect();
    renderLoansTable();
    updateLoanCartUI();

  } catch (err) {
    console.error("Erro emprestimos.js:", err);
  }
});
