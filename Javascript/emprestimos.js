
document.addEventListener("DOMContentLoaded", () => {
  try {
    const $ = id => document.getElementById(id);

    
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

    
    const KEY_BOOKS = "livraria_books";
    const KEY_CLIENTS = "livraria_clients";
    const KEY_LOANS = "livraria_loans";

    
    let rawBooks = JSON.parse(localStorage.getItem(KEY_BOOKS) || "[]");
    let clients = JSON.parse(localStorage.getItem(KEY_CLIENTS) || "[]");
    let loans = JSON.parse(localStorage.getItem(KEY_LOANS) || "[]");

    
    const formatDate = d => {
      try {
        return new Date(d).toLocaleDateString("pt-BR");
      } catch { return d || "—"; }
    };
    const formatTime = d => {
      try { return new Date(d).toLocaleTimeString("pt-BR"); } catch { return ""; }
    };
    const todayISO = () => new Date().toISOString();

   
    const saveRawBooks = () => localStorage.setItem(KEY_BOOKS, JSON.stringify(rawBooks));
    const saveLoans = () => localStorage.setItem(KEY_LOANS, JSON.stringify(loans));

   
    function showToast(msg, timeout = 3000) {

  document.querySelectorAll(".v-toast-loan").forEach(t => t.remove());

  const t = document.createElement("div");
  t.className = "v-toast-loan";
  t.textContent = msg;
  document.body.appendChild(t);


  requestAnimationFrame(() => t.classList.add("show"));


  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, timeout);

  
  if (!document.getElementById("v-toast-loan-style")) {
    const s = document.createElement("style");
    s.id = "v-toast-loan-style";
    s.innerHTML = `
      .v-toast-loan {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3c0d0d;
        color: #fff;
        padding: 12px 18px;
        border-radius: 8px;
        font-weight: 600;
        font-family: 'Poppins', sans-serif;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 99999;
      }
      .v-toast-loan.show {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(s);
  }
}


    function normalizeBook(raw) {
      if (!raw) return null;
      const id = raw.id ?? raw.ISBN ?? raw.codigo ?? raw.code ?? raw.bookId ?? raw._id ?? raw.uid ?? null;
      const title = raw.titulo || raw.title || raw.name || raw.nome || "";
      const author = raw.autor || raw.author || raw.marca || raw.brand || "";
      const category = raw.categoria || raw.category || raw.genero || "";
      const qRaw = raw.quantidade ?? raw.quantity ?? raw.stock ?? raw.qtd ?? 0;
      const quantity = Number.isFinite(Number(qRaw)) ? Number(qRaw) : 0;
      const status = (raw.status || raw.estado || "").toString().toUpperCase();
      const price = raw.preco ?? raw.value ?? raw.valor ?? raw.price ?? 0;
      return {
        __raw: raw,
        id: String(id),
        title: String(title || ""),
        author: String(author || ""),
        category: String(category || "").toUpperCase(),
        quantity: Number(quantity || 0),
        status: status || "",
        price: Number(price || 0)
      };
    }

    function getAllNormalizedBooks() {
      return (rawBooks || []).map(normalizeBook).filter(Boolean);
    }

    function setBookQuantityById(id, newQty) {
      for (let i = 0; i < rawBooks.length; i++) {
        const b = rawBooks[i];
        const bid = b.id ?? b.ISBN ?? b.codigo ?? b.code ?? b.bookId ?? b._id ?? b.uid ?? null;
        if (String(bid) === String(id)) {
          if ("quantidade" in b) b.quantidade = newQty;
          else if ("quantity" in b) b.quantity = newQty;
          else if ("stock" in b) b.stock = newQty;
          else if ("qtd" in b) b.qtd = newQty;
          else b.quantidade = newQty; 
          rawBooks[i] = b;
          return true;
        }
      }
      return false;
    }

  
    function populateLoanBookSelect() {
      if (!loanCartBookSelect) return;
      loanCartBookSelect.innerHTML = `<option value="">Selecione um livro disponível</option>`;
      const normalized = getAllNormalizedBooks();

    
      const available = normalized.filter(b => {
        const st = (b.status || "").toString().toUpperCase();
        return (st.includes("ATIV") || st === "" || st.includes("DISP") || st.includes("ACTIVE")) && (b.quantity > 0);
      });

      
      available.sort((a,b) => a.title.localeCompare(b.title));

      available.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = `${b.title}${b.author ? " - " + b.author : ""} (Estoque: ${b.quantity})`;
        loanCartBookSelect.appendChild(opt);
      });
    }

    function populateLoanClientSelect() {
      if (!loanCheckoutClientSelect) return;
      loanCheckoutClientSelect.innerHTML = `<option value="">Selecione o cliente</option>`;
      (clients || []).forEach(c => {
        const id = c.id ?? c._id ?? c.uid ?? c.cpf ?? c.cnpj ?? c.documento ?? "";
        const name = c.nome || c.name || c.razao || c.razaoSocial || "";
        const doc = c.documento || c.cpf || c.cnpj || "";
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = `${name}${doc ? " - " + doc : ""}`;
        loanCheckoutClientSelect.appendChild(opt);
      });
    }

   
    let cart = []; 

    function updateLoanCartUI() {
      if (!loanCartItemsContainer) return;
      loanCartItemsContainer.innerHTML = "";

      const totalItems = cart.reduce((a,c) => a + Number(c.qtd || 0), 0);
      if (loanCartItemCount) loanCartItemCount.textContent = String(totalItems);
      if (loanTotalItems) loanTotalItems.textContent = String(totalItems);

      if (!cart.length) {
        loanCartItemsContainer.innerHTML = `
          <div class="empty-state" style="padding: 40px 20px;text-align:center;color:rgba(0,0,0,0.6)">
            <i class="fas fa-book-reader" style="font-size: 3rem; opacity: 0.25; margin-bottom: 12px;"></i>
            <h3 style="margin:0.25rem 0">Carrinho vazio</h3>
            <p style="margin:0;color:rgba(0,0,0,0.5)">Adicione livros ao carrinho para registrar um empréstimo</p>
          </div>`;
        if (loanCheckoutSection) loanCheckoutSection.style.display = "none";
        return;
      }

      cart.forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = "loan-cart-item";
        card.dataset.idx = String(idx);
        card.innerHTML = `
          <div class="loan-info">
            <div class="fw-bold">${escapeHtml(item.title)}</div>
            <div class="text-muted">${escapeHtml(item.author || "")}</div>
            <div class="text-secondary small">Categoria: ${escapeHtml(item.category || "—")} &nbsp;&nbsp; Estoque: ${item.quantity}</div>
          </div>
          <div class="loan-controls">
            <button class="btn-minus" data-idx="${idx}">−</button>
            <input type="number" class="loan-qty" value="${item.qtd}" min="1" readonly />
            <button class="btn-plus" data-idx="${idx}">+</button>
            <span style="margin-left:8px">${item.qtd} exemplares</span>
            <button class="btn-delete" data-idx="${idx}" title="Remover do carrinho">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
        loanCartItemsContainer.appendChild(card);
      });

      if (loanCheckoutSection) loanCheckoutSection.style.display = "block";
    }

    function escapeHtml(s) {
      return String(s || "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[ch]));
    }

    
    addToLoanCartBtn?.addEventListener("click", () => {
      const id = loanCartBookSelect?.value;
      const qtdRaw = loanCartQuantity?.value;
      const qtd = Number(qtdRaw || 0);
      if (!id) return showToast("Selecione o livro");
      if (!qtd || qtd <= 0) return showToast("Quantidade inválida");

      const normalized = getAllNormalizedBooks().find(b => String(b.id) === String(id));
      if (!normalized) return showToast("Livro não encontrado");
      if (qtd > normalized.quantity) return showToast("Quantidade maior que estoque disponível");

      const existing = cart.find(i => String(i.id) === String(id));
      if (existing) {
        const newQty = existing.qtd + qtd;
        if (newQty > normalized.quantity) return showToast("Excede estoque disponível");
        existing.qtd = newQty;
      } else {
        cart.push({
          id: normalized.id,
          title: normalized.title,
          author: normalized.author,
          category: normalized.category,
          quantity: normalized.quantity,
          qtd
        });
      }

      
      if (loanCartBookSelect) loanCartBookSelect.value = "";
      if (loanCartQuantity) loanCartQuantity.value = "";
      updateLoanCartUI();
      showToast("Livro adicionado ao carrinho");
    });

    
    clearLoanCartBtn?.addEventListener("click", () => {
      cart = [];
      updateLoanCartUI();
      showToast("Carrinho limpo");
    });


    loanCartItemsContainer?.addEventListener("click", (e) => {
      const minusBtn = e.target.closest(".btn-minus");
      const plusBtn = e.target.closest(".btn-plus");
      const delBtn = e.target.closest(".btn-delete");
      if (minusBtn) {
        const idx = Number(minusBtn.dataset.idx);
        if (!Number.isInteger(idx) || !cart[idx]) return;
        cart[idx].qtd = Math.max(1, cart[idx].qtd - 1);
        updateLoanCartUI();
      } else if (plusBtn) {
        const idx = Number(plusBtn.dataset.idx);
        if (!Number.isInteger(idx) || !cart[idx]) return;
        if (cart[idx].qtd + 1 > cart[idx].quantity) return showToast("Excede o estoque disponível");
        cart[idx].qtd += 1;
        updateLoanCartUI();
      } else if (delBtn) {
        const idx = Number(delBtn.dataset.idx);
        if (!Number.isInteger(idx) || !cart[idx]) return;
        cart.splice(idx, 1);
        updateLoanCartUI();
      }
    });

    
    loanCheckoutForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!cart.length) return showToast("Carrinho vazio");
      const clienteId = loanCheckoutClientSelect?.value;
      if (!clienteId) return showToast("Selecione o cliente");
      const dataPrevista = loanCheckoutReturnDate?.value;
      if (!dataPrevista) return showToast("Informe a data prevista de devolução");


      const clientObj = (clients || []).find(c => {
        const cid = c.id ?? c._id ?? c.uid ?? c.cpf ?? c.cnpj ?? c.documento ?? null;
        return String(cid) === String(clienteId);
      });
      const clienteNome = clientObj ? (clientObj.nome || clientObj.name || "") : "";

      const novoEmprestimo = {
        id: Date.now().toString(),
        clienteId: clienteId,
        clienteNome: clienteNome,
        dataEmprestimo: todayISO(),
        dataPrevistaDevolucao: new Date(dataPrevista).toISOString(),
        dataDevolucaoReal: null,
        observacoes: loanCheckoutNotes?.value || "",
        status: "Ativo",
        itens: cart.map(c => ({ id: c.id, title: c.title, qtd: c.qtd, category: c.category }))
      };

      
      cart.forEach(it => {
        
        const success = setBookQuantityById(it.id, Math.max(0, (function(){
          
          const norm = getAllNormalizedBooks().find(b => String(b.id) === String(it.id));
          return (norm ? (norm.quantity - it.qtd) : 0);
        })()));
        if (!success) {
          
          for (let i = 0; i < rawBooks.length; i++) {
            const b = rawBooks[i];
            const bid = b.id ?? b.ISBN ?? b.codigo ?? b.code ?? b.bookId ?? b._id ?? b.uid ?? null;
            if (String(bid) === String(it.id)) {
              if ("quantidade" in b) b.quantidade = Math.max(0, (b.quantidade || 0) - it.qtd);
              else if ("quantity" in b) b.quantity = Math.max(0, (b.quantity || 0) - it.qtd);
              else if ("stock" in b) b.stock = Math.max(0, (b.stock || 0) - it.qtd);
              else b.quantidade = Math.max(0, (b.quantidade || 0) - it.qtd);
              rawBooks[i] = b;
            }
          }
        }
      });


      loans.unshift(novoEmprestimo);
      saveRawBooks();
      saveLoans();

     
      cart = [];
      updateLoanCartUI();
      renderLoansTable();
      populateLoanBookSelect();
      loanCheckoutForm.reset();
      showToast("Empréstimo registrado com sucesso!");
    });

   
    function humanDaysDifference(targetDateISO) {
      try {
        const now = new Date();
        const target = new Date(targetDateISO);
     
        const msPerDay = 1000 * 60 * 60 * 24;
        const diff = Math.ceil((target - now) / msPerDay);
        return diff;
      } catch {
        return 0;
      }
    }

    function renderLoansTable(data) {
      if (!loansTableBody) return;
      const arr = Array.isArray(data) ? data : loans;
      loansTableBody.innerHTML = "";

      if (!arr.length) {
        loansTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#777;padding:18px">Nenhum empréstimo registrado</td></tr>`;
        return;
      }

      const now = new Date();
      arr.forEach(l => {
        const cliente = (clients || []).find(c => {
          const cid = c.id ?? c._id ?? c.uid ?? c.cpf ?? c.cnpj ?? c.documento ?? null;
          return String(cid) === String(l.clienteId);
        });
        const nomeCliente = cliente ? (cliente.nome || cliente.name || "") : "—";

        const dias = humanDaysDifference(l.dataPrevistaDevolucao);
        let status = l.status || "";
        if (!l.dataDevolucaoReal && dias < 0) status = "Atrasado";
        if (l.dataDevolucaoReal) status = "Finalizado";
 
        const badgeClass = status === "Ativo" ? "bg-success" : (status === "Atrasado" ? "bg-danger" : "bg-secondary");

        const qtdTotal = (l.itens || []).reduce((a, it) => a + (Number(it.qtd) || 0), 0);
        const titles = (l.itens || []).map(it => it.title).join(", ");

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${formatDate(l.dataEmprestimo)}<br><small>${formatTime(l.dataEmprestimo)}</small></td>
          <td>${escapeHtml(nomeCliente)}</td>
          <td>${escapeHtml(titles)}</td>
          <td>${qtdTotal}</td>
          <td>${formatDate(l.dataPrevistaDevolucao)}</td>
          <td>${dias >= 0 ? `${dias} dias restantes` : `${Math.abs(dias)} dias de atraso`}</td>
          <td><span class="badge ${badgeClass}">${status}</span></td>
          <td>
            ${!l.dataDevolucaoReal ? `<button class="btn-return" data-id="${l.id}" title="Registrar devolução">✓</button>` : `<small>${formatDate(l.dataDevolucaoReal)}</small>`}
          </td>
        `;
        loansTableBody.appendChild(tr);
      });
    }

    
    loansTableBody?.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-return");
      if (!btn) return;
      const id = btn.dataset.id;
      const loan = loans.find(l => String(l.id) === String(id));
      if (!loan || loan.dataDevolucaoReal) return;

  
      loan.dataDevolucaoReal = todayISO();
      loan.status = "Finalizado";

 
      loan.itens.forEach(it => {

        for (let i = 0; i < rawBooks.length; i++) {
          const b = rawBooks[i];
          const bid = b.id ?? b.ISBN ?? b.codigo ?? b.code ?? b.bookId ?? b._id ?? b.uid ?? null;
          if (String(bid) === String(it.id)) {
            if ("quantidade" in b) b.quantidade = (Number(b.quantidade || 0) + Number(it.qtd || 0));
            else if ("quantity" in b) b.quantity = (Number(b.quantity || 0) + Number(it.qtd || 0));
            else if ("stock" in b) b.stock = (Number(b.stock || 0) + Number(it.qtd || 0));
            else b.quantidade = (Number(b.quantidade || 0) + Number(it.qtd || 0));
            rawBooks[i] = b;
            break;
          }
        }
      });

      saveRawBooks();
      saveLoans();
      renderLoansTable();
      populateLoanBookSelect();
      showToast("Devolução registrada com sucesso!");
    });

    populateLoanBookSelect();
    populateLoanClientSelect();
    renderLoansTable();
    updateLoanCartUI();

    
    window._emprestimos_debug = {
      rawBooks, clients, loans, cart,
      normalizeBook, getAllNormalizedBooks
    };

  } catch (err) {
    console.error("Erro emprestimos.js:", err);
  }
});


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
