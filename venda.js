

document.addEventListener("DOMContentLoaded", () => {
  try {
    
    const $ = id => document.getElementById(id);
    const cartBookSelect = $("cartBookSelect");
    const cartQuantity = $("cartQuantity");
    const addToCartBtn = $("addToCartBtn");
    const cartItemsContainer = $("cartItems");
    const clearCartBtn = $("clearCartBtn");
    const checkoutSection = $("checkoutSection");
    const checkoutClientSelect = $("checkoutClientSelect");
    const checkoutPaymentMethod = $("checkoutPaymentMethod");
    const checkoutDiscount = $("checkoutDiscount");
    const checkoutNotes = $("checkoutNotes");
    const checkoutForm = $("checkoutForm");
    const finalTotalSpan = $("finalTotal");
    const cartItemCount = $("cartItemCount");
    const salesTableBody = $("salesTableBody");
    const returnsTableBody = $("returnsTableBody");

    const processReturnBtn = $("processReturnBtn");
    const returnModal = $("returnModal");
    const closeReturnModal = $("closeReturnModal");
    const cancelReturnBtn = $("cancelReturnBtn");
    const saleSelect = $("returnSaleSelect");
    const returnForm = $("returnForm");
    const returnNotes = $("returnNotes");
    const exchangeBookSelect = $("exchangeBookSelect");
    const returnType = $("returnType");
    const returnQuantity = $("returnQuantity");
    const returnReason = $("returnReason");

    
    const filterIds = ["filterSalesDateFrom","filterSalesDateTo","filterSalesCategory","filterSalesAuthor","filterSalesPublisher","filterSalesClient"];

    
    let books = JSON.parse(localStorage.getItem("livraria_books")) || [];
    let clients = JSON.parse(localStorage.getItem("livraria_clients")) || [];
    let sales = JSON.parse(localStorage.getItem("livraria_sales")) || [];
    let returns = JSON.parse(localStorage.getItem("livraria_returns")) || [];
    
    const allSales = () => JSON.parse(localStorage.getItem("livraria_sales")) || sales;
    const allBooks = () => JSON.parse(localStorage.getItem("livraria_books")) || books;
    const allClients = () => JSON.parse(localStorage.getItem("livraria_clients")) || clients;

    
    const formatCurrency = v => "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    const formatDate = d => {
      try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return d; }
    };
    const formatTime = d => {
      try { return new Date(d).toLocaleTimeString("pt-BR"); } catch { return ""; }
    };

    function saveBooks() { localStorage.setItem("livraria_books", JSON.stringify(books)); }
    function saveClients() { localStorage.setItem("livraria_clients", JSON.stringify(clients)); }
    function saveSales() { localStorage.setItem("livraria_sales", JSON.stringify(sales)); }
    function saveReturns() { localStorage.setItem("livraria_returns", JSON.stringify(returns)); }

    function showToast(msg) {
      try {
        document.querySelectorAll(".toast-success").forEach(t => t.remove());
        const toast = document.createElement("div");
        toast.className = "toast-success";
        toast.innerHTML = `<span class="toast-message">${msg}</span>`;
        Object.assign(toast.style, { position:"fixed", right:"20px", bottom:"20px", background:"#1f8f4b", color:"#fff", padding:"8px 12px", borderRadius:"8px", zIndex:99999 });
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = "1", 50);
        setTimeout(() => { toast.style.opacity = "0"; setTimeout(()=>toast.remove(),300); }, 2600);
      } catch(e) { console.warn("Toast erro:", e); }
    }

   
    function populateBookSelect() {
      books = allBooks();
      if (!cartBookSelect) return;
      cartBookSelect.innerHTML = `<option value="">Selecione um livro disponível</option>`;
      books.filter(b => (b.status||"").toUpperCase() === "ATIVO" || !b.status)
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
      clients = allClients();
      if (!checkoutClientSelect) return;
      checkoutClientSelect.innerHTML = `<option value="">Selecione o cliente</option>`;
      clients.filter(c => (c.status||"").toUpperCase()==="ATIVO" || !c.status)
        .forEach(c => {
          const opt = document.createElement("option");
          opt.value = String(c.id);
          opt.textContent = c.nome || c.name || "Cliente sem nome";
          checkoutClientSelect.appendChild(opt);
        });
    }

    function populateExchangeBookSelect() {
      if (!exchangeBookSelect) return;
      exchangeBookSelect.innerHTML = `<option value="">Selecione um livro para troca</option>`;
      allBooks().forEach(b => {
        const opt = document.createElement("option");
        opt.value = String(b.id);
        opt.textContent = `${b.titulo || b.title || "Sem título"} — ${b.autor || b.author || ""}`;
        exchangeBookSelect.appendChild(opt);
      });
    }

    function populateFilterClients() {
      const select = document.getElementById("filterSalesClient");
      if (!select) return;
      select.innerHTML = `<option value="">Todos os clientes</option>`;
      allClients().forEach(c => {
        const opt = document.createElement("option");
        opt.value = String(c.id);
        opt.textContent = c.nome || c.name || "Cliente";
        select.appendChild(opt);
      });
    }

    let cart = []; 

    function updateCartUI() {
      if (!cartItemsContainer) return;
      cartItemsContainer.innerHTML = "";
      if (cartItemCount) cartItemCount.textContent = cart.reduce((a,c)=>a+c.qtd,0);

      if (!cart.length) {
        cartItemsContainer.innerHTML = `<div style="padding:16px;color:#777">Nenhum item no carrinho.</div>`;
        if (checkoutSection) checkoutSection.style.display = "none";
        if (finalTotalSpan) finalTotalSpan.textContent = "R$ 0,00";
        return;
      }

      cart.forEach((it, idx) => {
        const el = document.createElement("div");
        el.className = "cart-item-card";
        el.innerHTML = `
          <div style="flex:1">
            <strong>${it.titulo}</strong><br><small>${it.autor||""}</small>
            <div style="margin-top:6px;color:#666">Preço: ${formatCurrency(it.preco)} • Estoque: ${it.estoque||0}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <button class="btn-decrease" data-idx="${idx}">−</button>
            <input class="cart-qty-input" value="${it.qtd}" style="width:48px;text-align:center" />
            <button class="btn-increase" data-idx="${idx}">+</button>
            <button class="btn-delete" data-idx="${idx}" title="Remover">🗑️</button>
          </div>
        `;
        cartItemsContainer.appendChild(el);
      });

      if (checkoutSection) checkoutSection.style.display = "block";
      recalcFinalTotal();
    }

    function recalcFinalTotal() {
      const subtotal = cart.reduce((a,it)=>a + (it.preco * it.qtd), 0);
      const desconto = Number(checkoutDiscount?.value) || 0;
      const total = subtotal - (subtotal * desconto / 100);
      if (finalTotalSpan) finalTotalSpan.textContent = formatCurrency(total);
      return total;
    }

    
    addToCartBtn && addToCartBtn.addEventListener("click", () => {
      const id = cartBookSelect ? cartBookSelect.value : null;
      const qtd = Number(cartQuantity ? cartQuantity.value : 0) || 0;
      if (!id || qtd <= 0) { showToast("Selecione livro e quantidade"); return; }
      const b = allBooks().find(x => String(x.id) === String(id));
      if (!b) { showToast("Livro não encontrado"); return; }
      const existing = cart.find(i => String(i.id) === String(id));
      if (existing) existing.qtd += qtd;
      else cart.push({ id: String(b.id), titulo: b.titulo||b.title||"Sem título", autor: b.autor||b.author, preco: b.preco||b.value||b.valor||0, qtd, estoque: b.quantidade||b.stock||0 });
      cartBookSelect && (cartBookSelect.value = "");
      cartQuantity && (cartQuantity.value = "");
      updateCartUI();
      showToast("Livro adicionado ao carrinho");
    });

    
    clearCartBtn && clearCartBtn.addEventListener("click", () => {
      cart = [];
      updateCartUI();
      showToast("Carrinho limpo");
    });

    
    cartItemsContainer && cartItemsContainer.addEventListener("click", (ev) => {
      const dec = ev.target.closest(".btn-decrease");
      const inc = ev.target.closest(".btn-increase");
      const del = ev.target.closest(".btn-delete");
      if (dec) {
        const i = Number(dec.dataset.idx);
        if (cart[i]) cart[i].qtd = Math.max(1, cart[i].qtd - 1);
        updateCartUI();
      } else if (inc) {
        const i = Number(inc.dataset.idx);
        if (cart[i]) cart[i].qtd = cart[i].qtd + 1;
        updateCartUI();
      } else if (del) {
        const i = Number(del.dataset.idx);
        if (cart[i]) cart.splice(i,1);
        updateCartUI();
      }
    });

    cartItemsContainer && cartItemsContainer.addEventListener("change", (ev) => {
      const input = ev.target;
      if (input.classList && input.classList.contains("cart-qty-input")) {
        const card = input.closest(".cart-item-card");
        const idx = Array.from(cartItemsContainer.children).indexOf(card);
        if (idx >= 0 && cart[idx]) {
          cart[idx].qtd = Math.max(1, Number(input.value) || 1);
          updateCartUI();
        }
      }
    });

  
    checkoutForm && checkoutForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      if (!cart.length) { showToast("Carrinho vazio"); return; }
      const clienteId = checkoutClientSelect ? checkoutClientSelect.value : null;
      if (!clienteId) { showToast("Selecione o cliente"); return; }
      const pagamento = checkoutPaymentMethod ? checkoutPaymentMethod.value : "";
      if (!pagamento) { showToast("Selecione forma de pagamento"); return; }
      const desconto = Number(checkoutDiscount?.value) || 0;
      const total = recalcFinalTotal();
      const venda = {
        id: Date.now(),
        data: new Date().toISOString(),
        clienteId,
        pagamento,
        desconto,
        total,
        status: "ATIVA",
        itens: cart.map(c => ({ id: c.id, titulo: c.titulo, qtd: c.qtd, preco: c.preco }))
      };
      sales.unshift(venda);
      saveSales();
      cart = []; updateCartUI();
      checkoutForm.reset();
      if (checkoutSection) checkoutSection.style.display = "none";
      renderSalesTable();
      showToast("Venda concluída com sucesso!");
    });

    
    function renderSalesTable(dataArray) {
      const arr = Array.isArray(dataArray) ? dataArray : (allSales() || []);
      if (!sales || sales.length === 0) {
        // If no global sales, fallback to local storage arr
        if (!arr.length && sales.length === 0 && !arr.length) {
          if (salesTableBody) salesTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#999;">Nenhuma venda registrada</td></tr>`;
          return;
        }
      }
      
      const toUse = Array.isArray(dataArray) ? dataArray : sales;
      if (!salesTableBody) return;
      salesTableBody.innerHTML = "";
      if (!toUse || toUse.length === 0) {
        salesTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#999;">Nenhuma venda encontrada</td></tr>`;
        return;
      }
      toUse.forEach(s => {
        const cliente = (allClients() || clients).find(c => String(c.id) === String(s.clienteId));
        const nomeCliente = cliente ? (cliente.nome || cliente.name) : "—";
        const item = s.itens && s.itens[0];
        const titulo = item?.titulo || "Item sem título";
        const autor = item?.autor || "Autor desconhecido";
        const qtdTotal = s.itens ? s.itens.reduce((a,i)=>a+i.qtd,0) : 0;
        // pagamento label + emoji
        const tipo = (s.pagamento || "").toLowerCase().replace(/_/g," ");
        let icon="💵", label=s.pagamento || "";
        if (tipo.includes("credito")) { icon="💳"; label="Crédito"; }
        else if (tipo.includes("debito")) { icon="💳"; label="Débito"; }
        else if (tipo.includes("pix")) { icon="📱"; label="Pix"; }
        else if (tipo.includes("transfer")) { icon="🏦"; label="Transferência"; }
        else if (tipo.includes("cheque")) { icon="📄"; label="Cheque"; }
        else if (tipo.includes("dinheiro")) { icon="💵"; label="Dinheiro"; }

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><div>${formatDate(s.data)}</div><small>${formatTime(s.data)}</small></td>
          <td><strong>${titulo}</strong><br><small>${autor}</small></td>
          <td>${nomeCliente}</td>
          <td>${qtdTotal}</td>
          <td><span class="payment-badge">${icon} ${label}</span></td>
          <td><strong>${formatCurrency(s.total)}</strong></td>
          <td><span class="status-badge ${s.status === "ATIVA" ? "ativa" : "inativa"}">${s.status}</span></td>
          <td><button class="btn-action" data-sale-id="${s.id}">🔁</button></td>
        `;
        salesTableBody.appendChild(tr);
      });

      
      document.querySelectorAll(".btn-action").forEach(btn=>{
        btn.removeEventListener("click", btn._clickFn);
        const fn = (e) => {
          const saleId = e.currentTarget.getAttribute("data-sale-id");
          if (!saleId) return;
          populateReturnSalesSelect();
          returnModal && returnModal.classList.add("show");
          if (saleSelect) saleSelect.value = saleId;
        };
        btn._clickFn = fn;
        btn.addEventListener("click", fn);
      });
    }

    
    function populateReturnSalesSelect() {
      if (!saleSelect) return;
      saleSelect.innerHTML = `<option value="">Selecione a venda que será devolvida</option>`;
      const arr = allSales();
      if (!arr || arr.length === 0) { saleSelect.innerHTML += `<option disabled>Nenhuma venda registrada</option>`; return; }
      arr.forEach(s => {
        const cliente = (allClients() || clients).find(c => String(c.id) === String(s.clienteId));
        const nomeCliente = cliente ? (cliente.nome || cliente.name) : "—";
        const total = formatCurrency(s.total);
        const dataVenda = formatDate(s.data);
        const itensTxt = (s.itens||[]).map(i=>`${i.titulo} (${i.qtd}x)`).join(", ");
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = `${dataVenda} - ${nomeCliente} - ${total} → ${itensTxt}`;
        saleSelect.appendChild(opt);
      });
    }


    processReturnBtn && processReturnBtn.addEventListener("click", () => { populateReturnSalesSelect(); returnModal && returnModal.classList.add("show"); });
    closeReturnModal && closeReturnModal.addEventListener("click", ()=> returnModal && returnModal.classList.remove("show"));
    cancelReturnBtn && cancelReturnBtn.addEventListener("click", ()=> returnModal && returnModal.classList.remove("show"));

    
    returnType && returnType.addEventListener("change", (e)=> {
      const v = e.target.value;
      const group = document.getElementById("exchangeBookGroup");
      if (group) group.style.display = (v === "TROCA") ? "block" : "none";
      if (v === "TROCA") populateExchangeBookSelect();
    });

    // processar devolução
    returnForm && returnForm.addEventListener("submit", (ev)=> {
      ev.preventDefault();
      if (!saleSelect) return alert("Seletor de venda ausente.");
      const saleId = saleSelect.value;
      if (!saleId) return alert("Selecione a venda.");
      const sale = (allSales()||[]).find(s => String(s.id) === String(saleId)) || sales.find(s=>String(s.id)===String(saleId));
      if (!sale) return alert("Venda não encontrada.");
      const notes = returnNotes ? returnNotes.value.trim() : "";
      const quant = returnQuantity ? Number(returnQuantity.value) || 1 : 1;
      const rtype = returnType ? (returnType.value || "DEVOLUCAO") : "DEVOLUCAO";
      const reason = returnReason ? (returnReason.value || "") : "";

     
      sale.itens.forEach(it => {
        const book = (allBooks()||[]).find(b => String(b.id) === String(it.id));
        if (book) {
          book.quantidade = (Number(book.quantidade) || 0) + (it.qtd || quant);
          
        }
      });
      books = allBooks();
      saveBooks();

      
      const saleObj = sales.find(s => String(s.id) === String(saleId));
      if (saleObj) {
        saleObj.status = "Devolvida";
        saveSales();
      } else {
        
        const arr = allSales();
        const idx = arr.findIndex(s => String(s.id) === String(saleId));
        if (idx >= 0) { arr[idx].status = "Devolvida"; localStorage.setItem("livraria_sales", JSON.stringify(arr)); sales = arr; }
      }

      
      const devolucao = {
        id: Date.now(),
        saleId: sale.id,
        clienteId: sale.clienteId,
        itens: sale.itens,
        total: sale.total,
        notes: notes || reason || "Outro",
        data: new Date().toISOString(),
        status: "Processada",
        type: rtype
      };
      returns.unshift(devolucao);
      saveReturns();
      renderReturnsTable();
      renderSalesTable();
      showToast("Devolução/Troca registrada com sucesso!");
      returnModal && returnModal.classList.remove("show");
      returnForm && returnForm.reset();
    });

   
    function renderReturnsTable() {
      if (!returnsTableBody) return;
      returnsTableBody.innerHTML = "";
      if (!returns || returns.length === 0) {
        returnsTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#999;">Nenhuma devolução registrada</td></tr>`;
        return;
      }
      returns.forEach(r => {
        const cliente = (allClients()||clients).find(c => String(c.id) === String(r.clienteId));
        const nomeCliente = cliente ? (cliente.nome || cliente.name) : "—";
        const venda = (allSales()||sales).find(v=>String(v.id)===String(r.saleId));
        const dataVenda = venda ? formatDate(venda.data) : "—";
        const livro = r.itens && r.itens[0] ? r.itens[0].titulo : "—";
        const qtd = r.itens && r.itens[0] ? r.itens[0].qtd : 0;
        const valor = formatCurrency(r.total || 0);
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${formatDate(r.data)}</td>
          <td>${dataVenda}</td>
          <td>${nomeCliente}</td>
          <td>${livro}</td>
          <td>${qtd}</td>
          <td><span class="payment-badge">💬 ${r.notes || "Outro"}</span></td>
          <td><strong style="color:#b22222">${valor}</strong></td>
          <td><span class="status-badge ativa">${r.status}</span></td>
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

      const all = allSales();
      if (!dateFromRaw && !dateToRaw && !category && !author && !publisher && !client) {
        renderSalesTable(all);
        return;
      }

      const normalize = s => (s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
      const from = dateFromRaw ? new Date(dateFromRaw + "T00:00:00") : null;
      const to = dateToRaw ? new Date(dateToRaw + "T23:59:59") : null;

      const filtered = (all || []).filter(sale => {
        const sd = new Date(sale.data);
        if (from && sd < from) return false;
        if (to && sd > to) return false;
        if (client && String(sale.clienteId) !== String(client)) return false;
        if (!category && !author && !publisher) return true;
        // verifica livros da venda
        return (sale.itens || []).some(item => {
          const book = (allBooks()||[]).find(b => String(b.id) === String(item.id));
          if (!book) return false;
          const cat = normalize(book.categoria || book.category || "");
          const aut = normalize(book.autor || book.author || "");
          const pub = normalize(book.editora || book.publisher || "");
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

    
    try {
      populateBookSelect();
      populateClientSelect();
      populateFilterClients();
      populateExchangeBookSelect();
      renderSalesTable();
      renderReturnsTable();
    } catch(e) {
      console.error("Erro init:", e);
    }

    
    window.__livraria = {
      refresh: function() {
        books = JSON.parse(localStorage.getItem("livraria_books")) || [];
        clients = JSON.parse(localStorage.getItem("livraria_clients")) || [];
        sales = JSON.parse(localStorage.getItem("livraria_sales")) || [];
        returns = JSON.parse(localStorage.getItem("livraria_returns")) || [];
        populateBookSelect(); populateClientSelect(); populateFilterClients(); renderSalesTable(); renderReturnsTable();
      },
      data: () => ({ books, clients, sales, returns })
    };

  } catch (err) {
    console.error("Erro venda.js:", err);
  }
});
