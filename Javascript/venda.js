
document.addEventListener("DOMContentLoaded", () => {
  try {
    const $ = id => document.getElementById(id);

    
    const KEY_BOOKS = "livraria_books";
    const KEY_PRODUCTS = "produtosDiversos";
    const KEY_CLIENTS = "livraria_clients";
    const KEY_SALES = "livraria_sales";
    const KEY_RETURNS = "livraria_returns";

    const THEME_COLOR = "#3c0d0d"; 
    const ICONS = {
      "LIVROS": "📚",
      "PRODUTOS DIVERSOS": "🎁",
      "PAPELARIA": "🖊️",
      "ELETRÔNICOS": "💻"
    };

    const formatCurrency = v => "R$ " + Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    const formatDate = d => { try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return d || "—"; } };
    const formatTime = d => { try { return new Date(d).toLocaleTimeString("pt-BR"); } catch { return ""; } };

    
    const selectEl = $("cartBookSelect");
    const qtyEl = $("cartQuantity");
    const addBtn = $("addToCartBtn");
    const cartContainer = $("cartItems");
    const clearBtn = $("clearCartBtn");
    const checkoutForm = $("checkoutForm");
    const clientSelect = $("checkoutClientSelect");
    const paymentSelect = $("checkoutPaymentMethod");
    const discountEl = $("checkoutDiscount");
    const finalTotalEl = $("finalTotal");
    const checkoutSection = $("checkoutSection");
    const cartItemCount = $("cartItemCount");
    const salesTable = $("salesTableBody");
    const returnsTable = $("returnsTableBody");
    const processReturnBtn = $("processReturnBtn");
    const returnModal = $("returnModal");
    const returnSaleSelect = $("returnSaleSelect");
    const returnForm = $("returnForm");
    const exchangeBookSelect = $("exchangeBookSelect");
    const returnType = $("returnType");
    const returnQuantity = $("returnQuantity");
    const returnNotes = $("returnNotes");

    
    function allBooks(){ return JSON.parse(localStorage.getItem(KEY_BOOKS) || "[]"); }
    function allProducts(){ return JSON.parse(localStorage.getItem(KEY_PRODUCTS) || "[]"); }
    function allClients(){ return JSON.parse(localStorage.getItem(KEY_CLIENTS) || "[]"); }
    function allSales(){ return JSON.parse(localStorage.getItem(KEY_SALES) || "[]"); }
    function allReturns(){ return JSON.parse(localStorage.getItem(KEY_RETURNS) || "[]"); }

    function saveBooks(v){ localStorage.setItem(KEY_BOOKS, JSON.stringify(v)); }
    function saveProducts(v){ localStorage.setItem(KEY_PRODUCTS, JSON.stringify(v)); }
    function saveSales(v){ localStorage.setItem(KEY_SALES, JSON.stringify(v)); }
    function saveReturns(v){ localStorage.setItem(KEY_RETURNS, JSON.stringify(v)); }


    function normalizeCategory(raw) {
      if (!raw && raw !== 0) return "";
      try {
        if (typeof raw === "string") return raw.trim().toUpperCase();
        if (typeof raw === "number") return String(raw);
        if (typeof raw === "object") {
          const tryKeys = ["categoria","category","genero","cat","categoriaNome","categoria_nome","tipo"];
          for (let k of tryKeys) {
            if (raw[k]) return String(raw[k]).trim().toUpperCase();
          }
          if (raw.label) return String(raw.label).trim().toUpperCase();
          if (raw.name) return String(raw.name).trim().toUpperCase();
        }
      } catch(e){}
      return "";
    }

   
    function toast(message, type = "sucesso") {
      document.querySelectorAll(".v-toast").forEach(t => t.remove());
      const el = document.createElement("div");
      el.className = `v-toast ${type}`;
      el.innerHTML = `<strong>${type==="sucesso" ? "✔" : "✖"}</strong><span style="margin-left:8px">${message}</span>`;
      document.body.appendChild(el);
      requestAnimationFrame(() => el.classList.add("show"));
      setTimeout(() => { el.classList.remove("show"); setTimeout(()=>el.remove(), 300); }, 3500);
      if (!document.getElementById("v-toast-styles")) {
        const s = document.createElement("style");
        s.id = "v-toast-styles";
        s.innerHTML = `
          .v-toast{position:fixed;top:18px;right:18px;background:${THEME_COLOR};color:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.18);opacity:0;transform:translateY(-8px);transition:all .28s;font-weight:600;z-index:99999}
          .v-toast.show{opacity:1;transform:translateY(0)}
          .v-toast.erro{background:#b91c1c}
          .v-toast strong{margin-right:8px}
        `;
        document.head.appendChild(s);
      }
    }

    
    (function injectCartStyles(){
      if (document.getElementById("v-cart-styles")) return;
      const s = document.createElement("style");
      s.id = "v-cart-styles";
      s.innerHTML = `
        /* Select styling */
        select#cartBookSelect{width:100%;padding:12px 14px;border:2px solid ${THEME_COLOR};border-radius:10px;background:#fff;font-family:'Poppins',sans-serif;font-size:15px;color:#3b1a1a}
        select#cartBookSelect:focus{outline:none;box-shadow:0 0 0 4px rgba(60,13,13,0.08);border-color:${THEME_COLOR}}
        select#cartBookSelect optgroup{font-weight:800;color:${THEME_COLOR};font-size:13px;text-transform:uppercase}
        select#cartBookSelect option{padding:8px;font-size:14px;line-height:1.6;color:#222}

        /* Cart item card */
        .cart-card {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:12px;
          background:#fff;
          border-radius:12px;
          box-shadow:0 6px 18px rgba(0,0,0,0.06);
          border:1px solid rgba(0,0,0,0.04);
          margin-bottom:12px;
          font-family:'Poppins',sans-serif;
        }
        .cart-card .left {
          display:flex;
          gap:12px;
          align-items:flex-start;
          flex:1;
        }
        .cart-card .meta {
          display:flex;
          flex-direction:column;
          gap:6px;
        }
        .cart-card .title {
          font-weight:700;
          font-size:15px;
          color:#111;
        }
        .cart-card .subtitle {
          font-size:13px;
          color:#666;
        }
        .cart-card .price {
          font-weight:700;
          color:${THEME_COLOR};
          font-size:14px;
        }
        .cart-card .controls {
          display:flex;
          align-items:center;
          gap:8px;
        }
        .cart-card .qty-btn {
          width:32px;height:32px;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#fafafa;cursor:pointer;font-size:18px;
        }
        .cart-card .qty-input {
          width:56px;height:32px;border-radius:8px;border:1px solid rgba(0,0,0,0.08);text-align:center;font-weight:600;
        }
        .cart-card .subtotal {
          min-width:110px;text-align:right;font-weight:700;
        }
        .cart-card .trash {
          background:none;border:none;cursor:pointer;font-size:18px;color:#b91c1c;margin-left:8px;
        }
      `;
      document.head.appendChild(s);
    })();

    
    function populateSelect() {
      if (!selectEl) return;
      selectEl.innerHTML = `<option value="">Selecione um item disponível</option>`;
      const books = allBooks().map(b => ({
        origem: "BOOK",
        id: String(b.id),
        nome: b.titulo || b.title || b.name || "Sem título",
        autor: b.autor || b.author || "",
        preco: Number(b.preco || b.value || b.valor || 0),
        estoque: Number(b.quantidade || b.quantity || b.stock || 0),
        categoria: normalizeCategory(b.categoria || b.category || b.genero || b.categoriaNome || b.categoria_nome || "LIVROS"),
        editora: b.editora || b.publisher || ""
      }));
      const products = allProducts().map(p => ({
        origem: "PRODUCT",
        id: String(p.id),
        nome: p.nome || p.name || "Sem nome",
        autor: p.marca || p.brand || "",
        preco: Number(p.preco || p.value || p.valor || 0),
        estoque: Number(p.quantidade || p.quantity || p.stock || 0),
        categoria: normalizeCategory(p.categoria || p.category || p.genero || p.categoriaNome || p.categoria_nome || "PRODUTOS DIVERSOS"),
        editora: p.editora || p.publisher || ""
      }));
      const all = [...books, ...products];
      const order = ["LIVROS", "PAPELARIA", "PRODUTOS DIVERSOS", "ELETRÔNICOS"];
      const categories = [...new Set(all.map(x => x.categoria))].sort((a,b)=>{
        const ia = order.indexOf(a), ib = order.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
      categories.forEach(cat => {
        const optg = document.createElement("optgroup");
        optg.label = cat;
        all.filter(x => x.categoria === cat).forEach(item => {
          const opt = document.createElement("option");
          opt.value = `${item.origem}::${item.id}`;
          opt.dataset.origem = item.origem;
          opt.dataset.id = item.id;
          opt.dataset.preco = item.preco;
          opt.dataset.estoque = item.estoque;
          let text = "";
          if (item.origem === "BOOK") {
            text = `${item.nome}${item.autor ? " - " + item.autor : ""} (Estoque: ${item.estoque}) - ${formatCurrency(item.preco)}`;
          } else {
            const emoji = ICONS[item.categoria] || "📦";
            text = `${emoji} ${item.nome}${item.autor ? " - " + item.autor : ""} (Estoque: ${item.estoque}) - ${formatCurrency(item.preco)}`;
          }
          opt.textContent = text;
          optg.appendChild(opt);
        });
        selectEl.appendChild(optg);
      });
    }

    let cart = [];

    if (!document.getElementById("cart-style")) {
  const style = document.createElement("style");
  style.id = "cart-style";
  style.textContent = `
    .controls .qty-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      color: #fff;
      font-weight: bold;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .controls .qty-btn:first-child {
      background-color: #e74c3c; /* botão - vermelho */
    }
    .controls .qty-btn:first-child:hover {
      background-color: #c0392b;
    }
    .controls .qty-btn:last-child {
      background-color: #3c0d0d; /* botão + vinho escuro */
    }
    .controls .qty-btn:last-child:hover {
      background-color: #5a1818;
    }
    .controls .qty-input {
      width: 42px;
      text-align: center;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 3px;
      font-weight: 600;
    }
    .trash {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background-color: rgba(255,0,0,0.1);
      color: #e74c3c;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .trash:hover {
      background-color: rgba(255,0,0,0.2);
      color: #c0392b;
    }
  `;
  document.head.appendChild(style);
}

function updateCartUI() {
  if (!cartContainer) return;
  cartContainer.innerHTML = "";
  if (!cart.length) {
    cartContainer.innerHTML = `<div style="padding:14px;color:#666">Nenhum item no carrinho.</div>`;
    if (finalTotalEl) finalTotalEl.textContent = formatCurrency(0);
    if (checkoutSection) checkoutSection.style.display = "none";
    if (cartItemCount) cartItemCount.textContent = "0";
    return;
  }

  cart.forEach((it, idx) => {
    const card = document.createElement("div");
    card.className = "cart-card";

    const left = document.createElement("div");
    left.className = "left";

    const iconDiv = document.createElement("div");
    iconDiv.style.fontSize = "20px";
    iconDiv.style.lineHeight = "1";
    iconDiv.style.marginTop = "2px";
    iconDiv.textContent = ICONS[it.categoria] || "";
    left.appendChild(iconDiv);

    const meta = document.createElement("div");
    meta.className = "meta";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = it.titulo || it.nome || "Sem título";
    meta.appendChild(title);

    const subtitle = document.createElement("div");
    subtitle.className = "subtitle";
    subtitle.textContent = it.autor ? it.autor : "";
    meta.appendChild(subtitle);

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = formatCurrency(it.preco);
    meta.appendChild(price);

    left.appendChild(meta);
    card.appendChild(left);

    const controlsWrap = document.createElement("div");
    controlsWrap.style.display = "flex";
    controlsWrap.style.alignItems = "center";
    controlsWrap.style.gap = "12px";

    const controls = document.createElement("div");
    controls.className = "controls";

    const btnDec = document.createElement("button");
    btnDec.className = "qty-btn";
    btnDec.textContent = "−";
    btnDec.dataset.idx = idx;
    btnDec.title = "Diminuir";
    controls.appendChild(btnDec);

    const inputQty = document.createElement("input");
    inputQty.className = "qty-input";
    inputQty.value = it.qtd;
    inputQty.dataset.idx = idx;
    inputQty.type = "number";
    inputQty.min = "1";
    controls.appendChild(inputQty);

    const btnInc = document.createElement("button");
    btnInc.className = "qty-btn";
    btnInc.textContent = "+";
    btnInc.dataset.idx = idx;
    btnInc.title = "Aumentar";
    controls.appendChild(btnInc);

    controlsWrap.appendChild(controls);

    const subtotal = document.createElement("div");
    subtotal.className = "subtotal";
    subtotal.textContent = formatCurrency((Number(it.preco) || 0) * (Number(it.qtd) || 0));
    controlsWrap.appendChild(subtotal);

    const trash = document.createElement("button");
    trash.className = "trash";
    trash.innerHTML = `<i class="fas fa-trash"></i>`;
    trash.dataset.idx = idx;
    controlsWrap.appendChild(trash);

    card.appendChild(controlsWrap);
    cartContainer.appendChild(card);
  });

  if (finalTotalEl) finalTotalEl.textContent = formatCurrency(cart.reduce((a, c) => a + (c.preco * c.qtd), 0));
  if (checkoutSection) checkoutSection.style.display = "block";
  if (cartItemCount) cartItemCount.textContent = String(cart.reduce((a, c) => a + (Number(c.qtd) || 0), 0));
}


    function recalcTotal() {
      const subtotal = cart.reduce((a,c)=>a + (Number(c.preco||0) * Number(c.qtd||0)), 0);
      const desconto = Number(discountEl?.value) || 0;
      const total = subtotal - (subtotal * desconto / 100);
      if (finalTotalEl) finalTotalEl.textContent = formatCurrency(total);
      return total;
    }

    addBtn && addBtn.addEventListener("click", () => {
      if (!selectEl) { toast("Seletor ausente","erro"); return; }
      const val = selectEl.value;
      const qtd = Number(qtyEl?.value || 0);
      if (!val || qtd <= 0) { toast("Selecione item e quantidade válidos","erro"); return; }
      const [orig, id] = val.split("::");
      let item = null;
      if (orig === "BOOK") {
        const b = allBooks().find(x=>String(x.id)===String(id));
        if (b) item = { origem:"BOOK", id:String(b.id), titulo:b.titulo||b.title||b.name||"Sem título", autor:b.autor||b.author||"", preco:Number(b.preco||b.valor||b.value||0), estoque:Number(b.quantidade||b.quantity||b.stock||0), categoria: normalizeCategory(b.categoria || b.category || "LIVROS"), editora: b.editora || b.publisher || "" };
      } else {
        const p = allProducts().find(x=>String(x.id)===String(id));
        if (p) item = { origem:"PRODUCT", id:String(p.id), titulo:p.nome||p.name||"Sem nome", autor:p.marca||p.brand||"", preco:Number(p.preco||p.valor||p.value||0), estoque:Number(p.quantidade||p.quantity||p.stock||0), categoria: normalizeCategory(p.categoria || p.category || "PRODUTOS DIVERSOS"), editora: p.editora || p.publisher || "" };
      }
      if (!item) { toast("Item não encontrado","erro"); return; }
      if (qtd > item.estoque) { toast("Quantidade maior que estoque disponível","erro"); return; }
      const existing = cart.find(i=>i.origem===item.origem && String(i.id)===String(item.id));
      if (existing) {
        if (existing.qtd + qtd > item.estoque) { toast("Excede estoque disponível","erro"); return; }
        existing.qtd += qtd;
      } else {
        cart.push({...item, qtd});
      }
      selectEl.value = "";
      if (qtyEl) qtyEl.value = "";
      updateCartUI();
      toast("Item adicionado ao carrinho","sucesso");
    });

    
    cartContainer && cartContainer.addEventListener("click", (e) => {
      const dec = e.target.closest(".qty-btn");
      const inc = e.target.closest(".qty-btn");
      const rm = e.target.closest(".trash");
      
      if (dec && dec.textContent.trim() === "−") {
        const i = Number(dec.dataset.idx);
        if (cart[i]) { cart[i].qtd = Math.max(1, cart[i].qtd - 1); updateCartUI(); }
        return;
      }
      if (inc && inc.textContent.trim() === "+") {
        const i = Number(inc.dataset.idx);
        if (cart[i]) {
          if (cart[i].qtd + 1 > cart[i].estoque) { toast("Excede estoque disponível","erro"); return; }
          cart[i].qtd += 1; updateCartUI();
        }
        return;
      }
      if (rm) {
        const i = Number(rm.dataset.idx);
        if (cart[i]) { cart.splice(i,1); updateCartUI(); toast("Item removido","sucesso"); }
        return;
      }
    });

    
    cartContainer && cartContainer.addEventListener("change", (e) => {
      const input = e.target;
      if (input.classList && input.classList.contains("qty-input")) {
        const idx = Number(input.dataset.idx);
        if (isNaN(idx)) return;
        const val = Math.max(1, Number(input.value) || 1);
        const estoque = Number(cart[idx].estoque || 0);
        cart[idx].qtd = Math.min(val, estoque);
        updateCartUI();
      }
    });

    clearBtn && clearBtn.addEventListener("click", () => { cart = []; updateCartUI(); toast("Carrinho limpo","sucesso"); });

    
function getCategoryForItem(item) {
  
  if (!item) return "";
  if (item.categoria) return normalizeCategory(item.categoria);
  if (item.category) return normalizeCategory(item.category);

  if (item.genero) return normalizeCategory(item.genero);
  if (item.tipo) return normalizeCategory(item.tipo);


  try {
    const origem = item.origem || item.source || "";
    const id = item.id || item.bookId || item.productId || item.idProduto;
    if (!id) return "";

    if (String(origem).toUpperCase().includes("BOOK") || origem === "BOOK") {
      const b = allBooks().find(x => String(x.id) === String(id));
      if (b) return normalizeCategory(b.categoria || b.category || b.genero || "");
    }
   
    const p = allProducts().find(x => String(x.id) === String(id));
    if (p) return normalizeCategory(p.categoria || p.category || p.genero || "");
  } catch (e) {
    console.warn("getCategoryForItem error:", e);
  }
  return "";
}


window.applySalesFilter = function () {
  const dateFrom = document.getElementById("filterSalesDateFrom")?.value || "";
  const dateTo = document.getElementById("filterSalesDateTo")?.value || "";
  const category = document.getElementById("filterSalesCategory")?.value || "";
  const author = document.getElementById("filterSalesAuthor")?.value?.toLowerCase() || "";
  const publisher = document.getElementById("filterSalesPublisher")?.value?.toLowerCase() || "";
  const client = document.getElementById("filterSalesClient")?.value || "";

  let vendas = allSales();
  if (!vendas.length) {
    renderSalesTable([]);
    return;
  }

  const dataIni = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
  const dataFim = dateTo ? new Date(dateTo + "T23:59:59") : null;
  const filtroCategoria = normalizeCategory(category);

  const filtradas = vendas.filter(v => {
    const d = new Date(v.data);

    
    if (dataIni && d < dataIni) return false;
    if (dataFim && d > dataFim) return false;

    
    if (client && String(v.clienteId) !== String(client)) return false;

    
    const itens = v.itens || [];

    
    if (filtroCategoria) {
      const matchCat = itens.some(i => {
        const catItem = getCategoryForItem(i);
        return catItem && catItem === filtroCategoria;
      });
      if (!matchCat) return false;
    }

  
    if (author) {
      const matchAuthor = itens.some(i => {
        const autor = (i.autor || i.author || i.marca || "").toString().toLowerCase();
        return autor.includes(author);
      });
      if (!matchAuthor) return false;
    }

    
    if (publisher) {
      const matchPub = itens.some(i => {
        const pub = (i.editora || i.publisher || i.editor || "").toString().toLowerCase();
        return pub.includes(publisher);
      });
      if (!matchPub) return false;
    }

    return true;
  });

  renderSalesTable(filtradas);
};


    
    checkoutForm && checkoutForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      if (!cart.length) { toast("Carrinho vazio","erro"); return; }
      const clientId = clientSelect ? clientSelect.value : null;
      if (!clientId) { toast("Selecione o cliente","erro"); return; }
      const pagamento = paymentSelect ? paymentSelect.value : "";
      if (!pagamento) { toast("Selecione forma de pagamento","erro"); return; }
      const desconto = Number(discountEl?.value) || 0;
      const total = recalcTotal();

 
      const itensParaSalvar = cart.map(c => ({
        origem: c.origem,
        id: c.id,
        titulo: c.titulo,
        qtd: c.qtd,
        preco: c.preco,
        categoria: normalizeCategory(c.categoria || c.category || ""),
        autor: c.autor || c.marca || "",
        editora: c.editora || c.publisher || ""
      }));

      const sale = { id: Date.now().toString(), data: new Date().toISOString(), clienteId: clientId, pagamento, desconto, total, status: "ATIVA", itens: itensParaSalvar };

      try {
        const sb = allBooks();
        const sp = allProducts();
        cart.forEach(it => {
          if (it.origem === "BOOK") {
            const idx = sb.findIndex(b => String(b.id) === String(it.id));
            if (idx !== -1) {
              const b = sb[idx];
              const cur = Number(b.quantidade || b.quantity || b.stock || 0);
              const novo = Math.max(0, cur - Number(it.qtd || 0));
              if (b.quantidade !== undefined) b.quantidade = novo; else if (b.quantity !== undefined) b.quantity = novo; else b.quantidade = novo;
              sb[idx] = b;
            }
          } else {
            const idx = sp.findIndex(p => String(p.id) === String(it.id));
            if (idx !== -1) {
              const p = sp[idx];
              const cur = Number(p.quantidade || p.quantity || p.stock || 0);
              const novo = Math.max(0, cur - Number(it.qtd || 0));
              if (p.quantidade !== undefined) p.quantidade = novo; else if (p.quantity !== undefined) p.quantity = novo; else p.quantidade = novo;
              sp[idx] = p;
            }
          }
        });
        saveBooks(sb);
        saveProducts(sp);
      } catch (e) { console.warn("Erro ao atualizar estoque:", e); }

      const sales = allSales(); sales.unshift(sale); saveSales(sales);
      cart = []; updateCartUI(); checkoutForm.reset(); if (checkoutSection) checkoutSection.style.display = "none"; renderSalesTable(); renderReturnsTable(); populateReturnSales(); toast(`Venda finalizada — ${formatCurrency(total)}`, "sucesso");
    });

    
    function renderSalesTable(data) {
      if (!salesTable) return;
      const arr = Array.isArray(data) ? data : allSales();
      salesTable.innerHTML = "";
      if (!arr.length) { salesTable.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#999">Nenhuma venda encontrada</td></tr>`; return; }
      arr.forEach(s => {
        const client = allClients().find(c => String(c.id) === String(s.clienteId));
        const clientName = client ? (client.nome || client.name) : "—";
        const qtdTotal = (s.itens || []).reduce((a,i)=>a + (Number(i.qtd)||0), 0);
        const tipo = (s.pagamento || "").toString().toLowerCase();
        let icon = "💵", label = s.pagamento || "";
        if (tipo.includes("credito")||tipo.includes("crédito")){ icon="💳"; label="Crédito"; }
        else if (tipo.includes("debito")||tipo.includes("débito")){ icon="💳"; label="Débito"; }
        else if (tipo.includes("pix")){ icon="📱"; label="Pix"; }
        else if (tipo.includes("transfer")){ icon="🏦"; label="Transferência"; }
        else if (tipo.includes("cheque")){ icon="📄"; label="Cheque"; }
        else if (tipo.includes("dinheiro")){ icon="💵"; label="Dinheiro"; }
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${formatDate(s.data)}<br><small>${formatTime(s.data)}</small></td>
                        <td><strong>${(s.itens && s.itens[0] && s.itens[0].titulo) || "—"}</strong><br><small>${(s.itens && s.itens[0] && (s.itens[0].autor || s.itens[0].marca)) || ""}</small></td>
                        <td>${clientName}</td>
                        <td>${qtdTotal}</td>
                        <td><span class="payment-badge">${icon} ${label}</span></td>
                        <td><strong>${formatCurrency(s.total)}</strong></td>
                        <td><span class="status-badge ${(s.status==="ATIVA")?"ativa":"inativa"}">${s.status}</span></td>
                        <td><button class="btn-action" data-sale-id="${s.id}">🔁</button></td>`;
        salesTable.appendChild(tr);
      });
      document.querySelectorAll(".btn-action").forEach(btn => {
        btn.removeEventListener("click", btn._fn);
        const fn = (e) => {
          const saleId = e.currentTarget.getAttribute("data-sale-id");
          if (!saleId) return;
          populateReturnSales();
          returnModal && returnModal.classList.add("show");
          if (returnSaleSelect) returnSaleSelect.value = saleId;
        };
        btn._fn = fn;
        btn.addEventListener("click", fn);
      });
    }

    function renderReturnsTable() {
      if (!returnsTable) return;
      const arr = allReturns();
      returnsTable.innerHTML = "";
      if (!arr.length) { returnsTable.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#999">Nenhuma devolução registrada</td></tr>`; return; }
      arr.forEach(r => {
        const client = allClients().find(c => String(c.id) === String(r.clienteId));
        const clientName = client ? (client.nome || client.name) : "—";
        const sale = allSales().find(s => String(s.id) === String(r.saleId));
        const saleDate = sale ? formatDate(sale.data) : "—";
        const itemTitle = r.itens && r.itens[0] ? r.itens[0].titulo : "—";
        const qtd = r.itens && r.itens[0] ? r.itens[0].qtd : 0;
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${formatDate(r.data)}</td><td>${saleDate}</td><td>${clientName}</td><td>${itemTitle}</td><td>${qtd}</td><td><span class="payment-badge">💬 ${r.notes || r.type || "Outro"}</span></td><td><strong style="color:#b22222">${formatCurrency(r.total || 0)}</strong></td><td><span class="status-badge ativa">${r.status || "Processada"}</span></td>`;
        returnsTable.appendChild(tr);
      });
    }

    
    function populateReturnSales() {
      if (!returnSaleSelect) return;
      returnSaleSelect.innerHTML = `<option value="">Selecione a venda</option>`;
      const arr = allSales();
      if (!arr.length) { returnSaleSelect.innerHTML += `<option disabled>Nenhuma venda registrada</option>`; return; }
      arr.forEach(s => {
        const client = allClients().find(c => String(c.id) === String(s.clienteId));
        const clientName = client ? (client.nome || client.name) : "—";
        const itemsTxt = (s.itens || []).map(i => `${i.titulo} (${i.qtd}x)`).join(", ");
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = `${formatDate(s.data)} - ${clientName} - ${formatCurrency(s.total)} → ${itemsTxt}`;
        returnSaleSelect.appendChild(opt);
      });
    }

    returnForm && returnForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      if (!returnSaleSelect) return alert("Selecione a venda.");
      const saleId = returnSaleSelect.value;
      if (!saleId) return alert("Selecione a venda.");
      const sale = allSales().find(s => String(s.id) === String(saleId));
      if (!sale) return alert("Venda não encontrada.");
      const notes = returnNotes ? returnNotes.value.trim() : "";
      const quant = returnQuantity ? Number(returnQuantity.value) || 1 : 1;

      try {
        const sb = allBooks();
        const sp = allProducts();
        sale.itens.forEach(it => {
          if (it.origem === "BOOK") {
            const idx = sb.findIndex(b => String(b.id) === String(it.id));
            if (idx !== -1) {
              const b = sb[idx];
              const cur = Number(b.quantidade || b.quantity || b.stock || 0);
              const novo = cur + Number(it.qtd || quant);
              if (b.quantidade !== undefined) b.quantidade = novo; else if (b.quantity !== undefined) b.quantity = novo; else b.quantidade = novo;
              sb[idx] = b;
            }
          } else {
            const idx = sp.findIndex(p => String(p.id) === String(it.id));
            if (idx !== -1) {
              const p = sp[idx];
              const cur = Number(p.quantidade || p.quantity || p.stock || 0);
              const novo = cur + Number(it.qtd || quant);
              if (p.quantidade !== undefined) p.quantidade = novo; else if (p.quantity !== undefined) p.quantity = novo; else p.quantidade = novo;
              sp[idx] = p;
            }
          }
        });
        saveBooks(sb); saveProducts(sp);
      } catch (e) { console.warn("Erro ao repor estoque:", e); }

      const sales = allSales();
      const idx = sales.findIndex(s => String(s.id) === String(saleId));
      if (idx !== -1) { sales[idx].status = "DEVOLVIDA"; saveSales(sales); }
      const returns = allReturns();
      const rec = { id: Date.now().toString(), saleId: sale.id, clienteId: sale.clienteId, itens: sale.itens, total: sale.total, notes, data: new Date().toISOString(), status: "Processada", type: "DEVOLUCAO" };
      returns.unshift(rec); saveReturns(returns);
      renderReturnsTable(); renderSalesTable(); toast("Devolução registrada", "sucesso");
      returnModal && returnModal.classList.remove("show");
      returnForm && returnForm.reset();
    });

  
    function populateClients() {
      if (!clientSelect) return;
      clientSelect.innerHTML = `<option value="">Selecione o cliente</option>`;
      allClients().forEach(c => {
        const opt = document.createElement("option");
        opt.value = String(c.id);
        opt.textContent = c.nome || c.name || "Cliente";
        clientSelect.appendChild(opt);
      });

   
      const filterClient = document.getElementById("filterSalesClient");
      if (filterClient) {
        filterClient.innerHTML = `<option value="">Todos os clientes</option>`;
        allClients().forEach(c => {
          const opt = document.createElement("option");
          opt.value = String(c.id);
          opt.textContent = c.nome || c.name || "Cliente";
          filterClient.appendChild(opt);
        });
      }
    }

    
    const filterIdsLocal = ["filterSalesDateFrom","filterSalesDateTo","filterSalesCategory","filterSalesAuthor","filterSalesPublisher","filterSalesClient"];
    filterIdsLocal.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const ev = (el.type === "date" || el.tagName === "SELECT") ? "change" : "input";
      el.addEventListener(ev, () => {
        if (typeof window.applySalesFilter === "function") window.applySalesFilter();
        else renderSalesTable();
      });
    });

    
    try {
      populateSelect();
      populateClients();
      populateReturnSales();
      renderSalesTable();
      renderReturnsTable();
    } catch (e) { console.error("Erro ao inicializar vendas.js:", e); }

  
    window.__vendas = {
      refresh: () => { populateSelect(); populateClients(); populateReturnSales(); renderSalesTable(); renderReturnsTable(); },
      data: () => ({ books: allBooks(), products: allProducts(), clients: allClients(), sales: allSales(), returns: allReturns(), cart })
    };

  } catch (err) {
    console.error("Erro vendas.js:", err);
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
