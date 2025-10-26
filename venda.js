
document.addEventListener("DOMContentLoaded", () => {
  const cartBookSelect = document.getElementById("cartBookSelect");
  const cartQuantity = document.getElementById("cartQuantity");
  const addToCartBtn = document.getElementById("addToCartBtn");
  const cartItemsContainer = document.getElementById("cartItems");
  const clearCartBtn = document.getElementById("clearCartBtn");

  const checkoutSection = document.getElementById("checkoutSection");
  const checkoutClientSelect = document.getElementById("checkoutClientSelect");
  const checkoutPaymentMethod = document.getElementById("checkoutPaymentMethod");
  const checkoutDiscount = document.getElementById("checkoutDiscount");
  const checkoutNotes = document.getElementById("checkoutNotes");
  const checkoutForm = document.getElementById("checkoutForm");
  const finalTotalSpan = document.getElementById("finalTotal");
  const cartItemCount = document.getElementById("cartItemCount");

  const salesTableBody = document.getElementById("salesTableBody");
  const returnsTableBody = document.getElementById("returnsTableBody");

  const processReturnBtn = document.getElementById("processReturnBtn");
  const returnModal = document.getElementById("returnModal");
  const closeReturnModal = document.getElementById("closeReturnModal");
  const cancelReturnBtn = document.getElementById("cancelReturnBtn");
  const saleSelect = document.getElementById("returnSaleSelect");
  const returnForm = document.getElementById("returnForm");
  const returnQuantity = document.getElementById("returnQuantity");
  const returnType = document.getElementById("returnType");
  const returnReason = document.getElementById("returnReason");
  const returnNotes = document.getElementById("returnNotes");
  const exchangeBookGroup = document.getElementById("exchangeBookGroup");
  const exchangeBookSelect = document.getElementById("exchangeBookSelect");

  const filterIds = ["filterSalesDateFrom","filterSalesDateTo","filterSalesCategory","filterSalesAuthor","filterSalesPublisher","filterSalesClient"];

  let books = JSON.parse(localStorage.getItem("livraria_books")) || [];
  let clients = JSON.parse(localStorage.getItem("livraria_clients")) || [];
  let sales = JSON.parse(localStorage.getItem("livraria_sales")) || [];
  let returns = JSON.parse(localStorage.getItem("livraria_returns")) || [];
  let cart = [];

  const saveBooks = () => localStorage.setItem("livraria_books", JSON.stringify(books));
  const saveClients = () => localStorage.setItem("livraria_clients", JSON.stringify(clients));
  const saveSales = () => localStorage.setItem("livraria_sales", JSON.stringify(sales));
  const saveReturns = () => localStorage.setItem("livraria_returns", JSON.stringify(returns));

  const formatCurrency = v => "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const formatDate = d => new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  function showToast(msg) {
    const t = document.createElement("div");
    t.className = "toast-success";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("show"), 50);
    setTimeout(() => { t.classList.remove("show"); setTimeout(()=>t.remove(),300); }, 3000);
  }

  function populateBookSelect() {
    books = JSON.parse(localStorage.getItem("livraria_books")) || [];
    if (!cartBookSelect) return;
    cartBookSelect.innerHTML = `<option value="">Selecione um livro disponível</option>`;
    books.filter(b => (b.status || "").toUpperCase() === "ATIVO" || !b.status)
      .forEach(b => {
        const titulo = b.titulo || b.title || "Sem título";
        const autor = b.autor || b.author || "Autor desconhecido";
        const preco = b.preco || b.value || b.valor || 0;
        const opt = document.createElement("option");
        opt.value = String(b.id);
        opt.textContent = `${titulo} — ${autor} — ${formatCurrency(preco)}`;
        cartBookSelect.appendChild(opt);
      });
  }

  function populateClientSelect() {
    clients = JSON.parse(localStorage.getItem("livraria_clients")) || [];
    if (!checkoutClientSelect) return;
    checkoutClientSelect.innerHTML = `<option value="">Selecione o cliente</option>`;
    clients.filter(c => (c.status || "").toUpperCase() === "ATIVO" || !c.status)
      .forEach(c => {
        const opt = document.createElement("option");
        opt.value = String(c.id);
        opt.textContent = c.nome || c.name || "Cliente sem nome";
        checkoutClientSelect.appendChild(opt);
      });
  }

  function populateFilterClients() {
    const select = document.getElementById("filterSalesClient");
    if (!select) return;
    select.innerHTML = `<option value="">Todos os clientes</option>`;
    clients.forEach(c => {
      const opt = document.createElement("option");
      opt.value = String(c.id);
      opt.textContent = c.nome || c.name || "Cliente";
      select.appendChild(opt);
    });
  }

  function populateExchangeBookSelect() {
    exchangeBookSelect && (exchangeBookSelect.innerHTML = `<option value="">Selecione o livro para troca</option>`);
    books.forEach(b => {
      const opt = document.createElement("option");
      opt.value = String(b.id);
      opt.textContent = `${b.titulo || b.title || "Sem título"} — ${b.autor || b.author || ""}`;
      exchangeBookSelect && exchangeBookSelect.appendChild(opt);
    });
  }

  function updateCartUI() {
    cartItemsContainer.innerHTML = "";
    cartItemCount && (cartItemCount.textContent = cart.reduce((a,c)=>a+c.qtd,0));
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<div class="empty-state" style="padding:20px;color:#777;text-align:center;">Nenhum item no carrinho.</div>`;
      checkoutSection && (checkoutSection.style.display = "none");
      finalTotalSpan && (finalTotalSpan.textContent = "R$ 0,00");
      return;
    }

    cart.forEach((it, i) => {
      const card = document.createElement("div");
      card.className = "cart-item-card";
      card.innerHTML = `
        <div class="cart-item-info">
          <strong>${it.titulo}</strong><br>
          <small>${it.autor || "Autor desconhecido"}</small><br>
          <span>Preço unitário: ${formatCurrency(it.preco)} &nbsp;&nbsp; Estoque: ${it.estoque || 0}</span>
        </div>
        <div class="cart-item-actions">
          <button class="btn-cart-qty btn-decrease" data-idx="${i}">−</button>
          <input type="number" class="cart-qty-input" value="${it.qtd}" min="1">
          <button class="btn-cart-qty btn-increase" data-idx="${i}">+</button>
        </div>
        <div class="cart-item-total">
          <strong>${formatCurrency(it.preco * it.qtd)}</strong><br>
          <small>${it.qtd}x ${formatCurrency(it.preco)}</small>
        </div>
        <button class="btn-icon btn-delete-cart" data-idx="${i}">
          <i class="fas fa-trash"></i>
        </button>
      `;
      cartItemsContainer.appendChild(card);
    });

    checkoutSection && (checkoutSection.style.display = "block");
    recalcFinalTotal();
  }

  addToCartBtn && addToCartBtn.addEventListener("click", () => {
    const id = cartBookSelect.value;
    const qtd = Number(cartQuantity.value) || 0;
    if (!id || qtd <= 0) { showToast("Selecione o livro e a quantidade"); return; }

    const book = books.find(b => String(b.id) === String(id));
    if (!book) { showToast("Livro não encontrado"); return; }

    const titulo = book.titulo || book.title || "Sem título";
    const autor = book.autor || book.author;
    const preco = book.preco || book.value || book.valor || 0;
    const estoque = book.quantidade || book.stock || 0;

    const existing = cart.find(it => String(it.id) === String(id));
    if (existing) existing.qtd += qtd;
    else cart.push({ id: String(book.id), titulo, autor, preco, qtd, estoque });

    cartBookSelect.value = "";
    cartQuantity.value = "";
    updateCartUI();
    showToast("Livro adicionado ao carrinho");
  });

  clearCartBtn && clearCartBtn.addEventListener("click", () => {
    cart = [];
    updateCartUI();
    showToast("Carrinho limpo");
  });

  cartItemsContainer && cartItemsContainer.addEventListener("click", (e) => {
    const dec = e.target.closest(".btn-decrease");
    const inc = e.target.closest(".btn-increase");
    const del = e.target.closest(".btn-delete-cart");
    if (dec) {
      const idx = Number(dec.dataset.idx);
      if (cart[idx]) { cart[idx].qtd = Math.max(1, cart[idx].qtd - 1); updateCartUI(); }
    } else if (inc) {
      const idx = Number(inc.dataset.idx);
      if (cart[idx]) { cart[idx].qtd = cart[idx].qtd + 1; updateCartUI(); }
    } else if (del) {
      const idx = Number(del.dataset.idx);
      if (cart[idx]) { cart.splice(idx,1); updateCartUI(); }
    }
  });

  cartItemsContainer && cartItemsContainer.addEventListener("change", (e) => {
    if (e.target.classList.contains("cart-qty-input")) {
      const card = e.target.closest(".cart-item-card");
      const idx = Array.from(cartItemsContainer.children).indexOf(card);
      if (idx >= 0 && cart[idx]) {
        let v = Number(e.target.value) || 1;
        v = Math.max(1, v);
        cart[idx].qtd = v;
        updateCartUI();
      }
    }
  });

  function recalcFinalTotal() {
    const subtotal = cart.reduce((a, it) => a + it.preco * it.qtd, 0);
    const desconto = Number(checkoutDiscount?.value) || 0;
    const total = subtotal - (subtotal * desconto / 100);
    finalTotalSpan && (finalTotalSpan.textContent = formatCurrency(total));
    return total;
  }
  checkoutDiscount && checkoutDiscount.addEventListener("input", recalcFinalTotal);

  checkoutForm && checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!cart.length) { showToast("Carrinho vazio"); return; }
    const clientId = checkoutClientSelect.value;
    if (!clientId) { showToast("Selecione o cliente"); return; }
    const payment = checkoutPaymentMethod.value;
    if (!payment) { showToast("Selecione a forma de pagamento"); return; }
    const desconto = Number(checkoutDiscount.value) || 0;
    const total = recalcFinalTotal();
    const venda = {
      id: Date.now(),
      data: new Date().toISOString(),
      clienteId: clientId,
      pagamento: payment,
      desconto,
      total,
      status: "ATIVA",
      itens: cart.map(c => ({ id: c.id, titulo: c.titulo, qtd: c.qtd, preco: c.preco }))
    };
    sales.unshift(venda); saveSales();
    cart = []; updateCartUI();
    checkoutForm.reset();
    checkoutSection && (checkoutSection.style.display = "none");
    renderSalesTable(); showToast("Venda concluída com sucesso!");
  });

  function renderSalesTable(dataArray = null) {
    const arr = Array.isArray(dataArray) ? dataArray : sales;
    salesTableBody.innerHTML = "";
    if (!arr || arr.length === 0) {
      salesTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#999;">Nenhuma venda registrada</td></tr>`;
      return;
    }

    arr.forEach((s) => {
      const cliente = clients.find(c => String(c.id) === String(s.clienteId));
      const nomeCliente = cliente ? (cliente.nome || cliente.name) : "—";
      const item = s.itens[0];
      const titulo = item?.titulo || "Item sem título";
      const autor = item?.autor || "Autor desconhecido";
      const qtdTotal = s.itens.reduce((a,i)=>a+i.qtd,0);

      const tipoRaw = (s.pagamento || "").toLowerCase().replace(/_/g," ");
      let icon = "💵"; let paymentLabel = s.pagamento;
      if (tipoRaw.includes("credito")) { icon = "💳"; paymentLabel = "Crédito"; }
      else if (tipoRaw.includes("debito")) { icon = "💳"; paymentLabel = "Débito"; }
      else if (tipoRaw.includes("pix")) { icon = "📱"; paymentLabel = "Pix"; }
      else if (tipoRaw.includes("transfer")) { icon = "🏦"; paymentLabel = "Transferência"; }
      else if (tipoRaw.includes("cheque")) { icon = "📄"; paymentLabel = "Cheque"; }
      else if (tipoRaw.includes("dinheiro")) { icon = "💵"; paymentLabel = "Dinheiro"; }

      const [data, hora] = formatDate(s.data).split(" ");
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><div class="sale-date"><div class="sale-date-main">${data}</div><div class="sale-date-sub">${hora}</div></div></td>
        <td><div class="sale-item"><div class="sale-item-title">${titulo}</div><div class="sale-item-sub">${autor}</div></div></td>
        <td>${nomeCliente}</td>
        <td>${qtdTotal}</td>
        <td><span class="payment-badge">${icon} ${paymentLabel}</span></td>
        <td><strong>${formatCurrency(s.total)}</strong></td>
        <td><span class="status-badge ${s.status === "ATIVA" ? "ativa" : "cancelada"}">${s.status}</span></td>
        <td class="sale-actions"><button class="btn-view btn-action" data-sale-id="${s.id}" title="Devolução/Troca"><i class="fas fa-rotate-right"></i></button></td>
      `;
      salesTableBody.appendChild(tr);
    });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-action");
    if (!btn) return;
    const saleId = btn.getAttribute("data-sale-id");
    if (!saleId) return;
    populateReturnSalesSelect();
    returnModal.classList.add("show");
    setTimeout(()=> { saleSelect.value = saleId; }, 60);
  });

  
  function populateReturnSalesSelect() {
    saleSelect.innerHTML = `<option value="">Selecione a venda que será devolvida</option>`;
    if (!sales.length) { saleSelect.innerHTML += `<option disabled>Nenhuma venda registrada</option>`; return; }
    sales.forEach(s => {
      const cliente = clients.find(c => String(c.id) === String(s.clienteId));
      const nomeCliente = cliente ? (cliente.nome || cliente.name) : "—";
      const dataVenda = new Date(s.data).toLocaleDateString("pt-BR");
      const total = formatCurrency(s.total);
      const itensTxt = s.itens.map(i => `${i.titulo}(${i.qtd}x)`).join(", ");
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = `${dataVenda} - ${nomeCliente} - ${total} → ${itensTxt}`;
      saleSelect.appendChild(opt);
    });
  }

  
  returnForm && returnForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const selectedId = saleSelect.value;
    if (!selectedId) { alert("Selecione a venda"); return; }
    const qty = Number(returnQuantity?.value) || 1;
    const type = returnType?.value || "DEVOLUCAO";
    const reason = returnReason?.value || "";
    const notes = returnNotes?.value || "";

   
    const rec = {
      id: Date.now(),
      saleId: selectedId,
      quantity: qty,
      type,
      reason,
      notes,
      data: new Date().toISOString(),
      status: "Processada"
    };
    returns.unshift(rec); saveReturns();
    
    if (type === "DEVOLUCAO") {
    
      const sale = sales.find(s => String(s.id) === String(selectedId));
      if (sale) {
        
        sale.itens.forEach(it => {
          const book = books.find(b => String(b.id) === String(it.id));
          if (book) {
            book.quantidade = (Number(book.quantidade) || 0) + qty; 
          }
        });
        saveBooks();
        populateBookSelect();
      }
    }
    showToast("Devolução/Troca registrada");
    returnModal.classList.remove("show");
    returnForm.reset();
    renderReturnsTable();
    renderSalesTable();
  });

  closeReturnModal && closeReturnModal.addEventListener("click", ()=> returnModal.classList.remove("show"));
  cancelReturnBtn && cancelReturnBtn.addEventListener("click", ()=> returnModal.classList.remove("show"));

  returnType && returnType.addEventListener("change", (e) => {
    if (e.target.value === "TROCA") {
      exchangeBookGroup.style.display = "block";
      populateExchangeBookSelect();
    } else {
      exchangeBookGroup.style.display = "none";
    }
  });

  function renderReturnsTable() {
    if (!returnsTableBody) return;
    returnsTableBody.innerHTML = "";
    if (!returns || returns.length === 0) {
      returnsTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#999;">Nenhuma devolução registrada</td></tr>`;
      return;
    }
    returns.forEach(r => {
      const sale = sales.find(s => String(s.id) === String(r.saleId));
      const cliente = sale ? clients.find(c => String(c.id) === String(sale.clienteId)) : null;
      const nomeCliente = cliente ? (cliente.nome || cliente.name) : "—";
      const livro = sale ? (sale.itens[0]?.titulo || "") : "";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(r.data).toLocaleDateString("pt-BR")}</td>
        <td>${sale ? (new Date(sale.data).toLocaleDateString("pt-BR")) : "—"}</td>
        <td>${nomeCliente}</td>
        <td>${livro}</td>
        <td>${r.quantity}</td>
        <td>${r.reason || ""}</td>
        <td>${sale ? (formatCurrency(sale.total)) : "R$ 0,00"}</td>
        <td>${r.status}</td>
      `;
      returnsTableBody.appendChild(tr);
    });
  }

  function applySalesFilter() {
    const dateFromRaw = document.getElementById("filterSalesDateFrom")?.value || "";
    const dateToRaw = document.getElementById("filterSalesDateTo")?.value || "";
    const category = (document.getElementById("filterSalesCategory")?.value || "").trim().toLowerCase();
    const author = (document.getElementById("filterSalesAuthor")?.value || "").trim().toLowerCase();
    const publisher = (document.getElementById("filterSalesPublisher")?.value || "").trim().toLowerCase();
    const client = (document.getElementById("filterSalesClient")?.value || "").trim();

    const allSales = JSON.parse(localStorage.getItem("livraria_sales")) || sales;
    const allBooks = JSON.parse(localStorage.getItem("livraria_books")) || books;

    if (!dateFromRaw && !dateToRaw && !category && !author && !publisher && !client) {
      renderSalesTable(allSales);
      return;
    }

    const normalize = str => (str || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const fromDate = dateFromRaw ? new Date(dateFromRaw + "T00:00:00") : null;
    const toDate = dateToRaw ? new Date(dateToRaw + "T23:59:59") : null;

    const filtered = allSales.filter(sale => {
      const saleDate = new Date(sale.data);
      if (fromDate && saleDate < fromDate) return false;
      if (toDate && saleDate > toDate) return false;
      if (client && String(sale.clienteId) !== String(client)) return false;

      if (!category && !author && !publisher) return true;

      return sale.itens.some(item => {
        const book = allBooks.find(b => String(b.id) === String(item.id));
        if (!book) return false;
        const cat = normalize(book.categoria || book.category);
        const aut = normalize(book.autor || book.author);
        const pub = normalize(book.editora || book.publisher);

        const catOk = !category || cat.includes(category);
        const autOk = !author || aut.includes(author);
        const pubOk = !publisher || pub.includes(publisher);
        return catOk && autOk && pubOk;
      });
    });

    renderSalesTable(filtered);
  }

  filterIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const ev = (el.type === "date" || el.tagName === "SELECT") ? "change" : "input";
    el.addEventListener(ev, applySalesFilter);
  });

  
  populateBookSelect();
  populateClientSelect();
  populateFilterClients();
  populateExchangeBookSelect();
  updateCartUI();
  renderSalesTable();
  renderReturnsTable();

  
  window.__livraria = {
    books, clients, sales, returns,
    refresh: ()=>{ books = JSON.parse(localStorage.getItem("livraria_books"))||[]; clients = JSON.parse(localStorage.getItem("livraria_clients"))||[]; sales = JSON.parse(localStorage.getItem("livraria_sales"))||[]; returns = JSON.parse(localStorage.getItem("livraria_returns"))||[]; populateBookSelect(); populateClientSelect(); populateFilterClients(); renderSalesTable(); renderReturnsTable(); }
  };
});
