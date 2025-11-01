document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("productForm");
  const tabelaBody = document.getElementById("productsTableBody");
  const addBtn = document.getElementById("addProductBtn");
  const modal = document.getElementById("productModal");
  const closeBtn = document.getElementById("closeProductModal");
  const cancelBtn = document.getElementById("cancelProductBtn");

  const codeInput = document.getElementById("productCode");
  const nameInput = document.getElementById("productName");
  const brandInput = document.getElementById("productBrand");
  const categoryInput = document.getElementById("productCategory");
  const conditionInput = document.getElementById("productCondition");
  const statusInput = document.getElementById("productStatus");
  const valueInput = document.getElementById("productValue");
  const quantityInput = document.getElementById("productQuantity");
  const descriptionInput = document.getElementById("productDescription");

  const filterName = document.getElementById("filterProductName");
  const filterBrand = document.getElementById("filterProductBrand");
  const filterCategory = document.getElementById("filterProductCategory");
  const filterCondition = document.getElementById("filterProductCondition");
  const filterStatus = document.getElementById("filterProductStatus");
  const filterMinValue = document.getElementById("filterProductMinValue");
  const filterMaxValue = document.getElementById("filterProductMaxValue");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  const STORAGE_KEY = "produtosDiversos";
  let produtos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  let editId = null;

  const salvarLocal = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));

  const limparFormulario = () => {
    form.reset();
    editId = null;
    const btn = form.querySelector("button[type='submit']");
    if (btn) {
      const icon = btn.querySelector("i");
      if (icon) icon.className = "fas fa-save";
      btn.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE) n.textContent = " Salvar"; });
    }
  };

  const abrirModal = () => modal && modal.classList.add("show");
  const fecharModal = () => modal && modal.classList.remove("show");

  const formatarValor = (valor) =>
    (Number(valor) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

 
  function showToast(msg, tipo = "info", tempo = 3000) {
    const cores = { sucesso: "#3c0d0d", erro: "#b02a2a", info: "#444" };
    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.textContent = msg;
    toast.style.background = cores[tipo] || "#3c0d0d";
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => toast.style.opacity = "1");
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, tempo);

    if (!document.getElementById("toast-style")) {
      const s = document.createElement("style");
      s.id = "toast-style";
      s.textContent = `
        .toast-msg {
          position: fixed;
          top: 20px;
          right: 20px;
          color: #fff;
          padding: 12px 18px;
          border-radius: 8px;
          font-weight: 600;
          opacity: 0;
          transition: all 0.3s ease;
          z-index: 9999;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          font-family: "Poppins", sans-serif;
        }
      `;
      document.head.appendChild(s);
    }
  }

  
  if (!document.getElementById("produtos-style")) {
    const style = document.createElement("style");
    style.id = "produtos-style";
    style.textContent = `
      .table-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .table-actions button {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.18s ease;
        font-size: 15px;
      }
      .btn-edit { background-color: rgba(0,136,255,0.12); color:#0088ff; }
      .btn-edit:hover { background-color: rgba(0,136,255,0.22); color:#006edc; transform:translateY(-1px); }
      .btn-delete { background-color: rgba(255,0,0,0.10); color:#e74c3c; }
      .btn-delete:hover { background-color: rgba(255,0,0,0.18); color:#c0392b; transform:translateY(-1px); }

      /* chip base (categoria / estado) */
      .prod-chip {
        background:#f5f6fa;
        padding:6px 12px;
        border-radius:16px;
        font-size:0.85rem;
        display:inline-flex;
        align-items:center;
        gap:8px;
        font-weight:600;
        color:#342626;
      }
      .chip-ico { font-size:1rem; display:inline-flex; align-items:center; justify-content:center; }

      /* categoria specific backgrounds (soft) */
      .cat-papelaria { background:#f4f6fb; }
      .cat-midia { background:#f9f4ff; }
      .cat-vinil { background:#fff7f0; }
      .cat-acessorios { background:#fff6f9; }
      .cat-presentes { background:#f2fff6; }
      .cat-decoracao { background:#fffaf0; }
      .cat-outros { background:#f5f6fa; }

      /* estado chips */
      .estado-chip { padding:6px 12px; border-radius:16px; font-weight:700; display:inline-flex; align-items:center; gap:8px; }
      .estado-novo { background:#fff7e6; color:#c47f17; }
      .estado-usado { background:#fdeaea; color:#b02222; }

      table td { vertical-align: middle; }
    `;
    document.head.appendChild(style);
  }

  
  const categoriaMap = [
    { match: /papel/i, icon: "🧾", cls: "cat-papelaria", label: "PAPELARIA" },
    { match: /midia|mídia|cd|dvd/i, icon: "💿", cls: "cat-midia", label: "MÍDIA (CD/DVD)" },
    { match: /vinil|disco/i, icon: "🎵", cls: "cat-vinil", label: "DISCOS DE VINIL" },
    { match: /acess|acessórios|acessorios/i, icon: "🛍️", cls: "cat-acessorios", label: "ACESSÓRIOS" },
    { match: /present/i, icon: "🎁", cls: "cat-presentes", label: "PRESENTES" },
    { match: /decor|decora/i, icon: "🖼️", cls: "cat-decoracao", label: "DECORAÇÃO" },
    { match: /livro/i, icon: "📖", cls: "cat-outros", label: "LIVROS" },
    
  ];

  function resolveCategoriaInfo(rawCat) {
    const cat = (rawCat || "").toString().trim();
    for (const m of categoriaMap) {
      if (m.match.test(cat)) return { icon: m.icon, cls: m.cls, label: m.label || cat.toUpperCase() };
    }
    
    const lower = cat.toLowerCase();
    if (!cat) return { icon: "📦", cls: "cat-outros", label: "OUTROS" };
    return { icon: "📦", cls: "cat-outros", label: cat.toUpperCase() };
  }

  
  function renderizarTabela() {
    if (!tabelaBody) return;
    tabelaBody.innerHTML = "";
    let lista = (produtos || []).slice();

    const nomeFiltro = filterName?.value.trim().toLowerCase() || "";
    const marcaFiltro = filterBrand?.value.trim().toLowerCase() || "";
    const categoriaFiltro = filterCategory?.value || "";
    const estadoFiltro = filterCondition?.value || "";
    const statusFiltro = filterStatus?.value || "";
    const valorMin = parseFloat(filterMinValue?.value) || 0;
    const valorMax = parseFloat(filterMaxValue?.value) || Infinity;

    if (nomeFiltro) lista = lista.filter((p) => (p.nome || "").toString().toLowerCase().includes(nomeFiltro));
    if (marcaFiltro) lista = lista.filter((p) => (p.marca || "").toString().toLowerCase().includes(marcaFiltro));
    if (categoriaFiltro) lista = lista.filter((p) => (p.categoria || "").toString() === categoriaFiltro);
    if (estadoFiltro) lista = lista.filter((p) => (p.estado || "").toString() === estadoFiltro);
    if (statusFiltro) lista = lista.filter((p) => (p.status || "").toString() === statusFiltro);
    if (valorMin || valorMax < Infinity)
      lista = lista.filter((p) => {
        const v = Number(p.valor || 0);
        return v >= valorMin && v <= valorMax;
      });

    if (!lista.length) {
      tabelaBody.innerHTML = `
        <tr><td colspan="9" style="text-align:center; color:#777; padding:10px">
          Nenhum produto encontrado
        </td></tr>`;
      return;
    }

    lista.forEach((p) => {
      const rawCat = p.categoria || "";
      const catInfo = resolveCategoriaInfo(rawCat);
      
      const estadoRaw = (p.estado || "").toString().trim();
      const estadoNorm = estadoRaw.toLowerCase();
      const isNovo = /novo/i.test(estadoNorm);
      const estadoLabel = estadoRaw ? estadoRaw.toUpperCase() : "—";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="text-align:left; padding:16px 12px;">
          <strong style="display:block;color:#3b1515">${(p.nome||"").toString()}</strong>
          <small style="color:#888; display:block; margin-top:6px">Código: ${p.codigo || "-"}</small>
        </td>
        <td style="padding:16px 12px;">${p.marca || "-"}</td>
        <td style="padding:16px 12px;">
          <span class="prod-chip ${catInfo.cls}">
            <span class="chip-ico">${catInfo.icon}</span>
            ${catInfo.label}
          </span>
        </td>
        <td style="padding:16px 12px;">
          <span class="estado-chip ${isNovo ? "estado-novo" : "estado-usado"}">
            <span style="font-size:1rem;">${isNovo ? "✨" : "♻️"}</span>
            ${estadoLabel}
          </span>
        </td>
        <td style="padding:16px 12px;">${formatarValor(p.valor)}</td>
        <td style="padding:16px 12px; color:${Number(p.quantidade||0) < 10 ? "red" : "#333"};">${p.quantidade||0}</td>
        <td style="padding:16px 12px;">${p.dataCadastro || ""}</td>
        <td style="padding:16px 12px;">${p.status || ""}</td>
        <td style="text-align:center; padding:16px 12px;">
          <div class="table-actions">
            <button class="btn-edit editar" data-id="${p.id}" title="Editar">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn-delete excluir" data-id="${p.id}" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      tabelaBody.appendChild(tr);
    });
  }

 
  function openConfirmModal({ title = "Confirmar", message = "", onConfirm = () => {}, onCancel = () => {} }) {
    const confirmModal = document.getElementById("confirmModal");
    const confirmTitle = document.getElementById("confirmTitle");
    const confirmMessage = document.getElementById("confirmMessage");
    const confirmCancel = document.getElementById("confirmCancel");
    const confirmOk = document.getElementById("confirmOk");

    if (!confirmModal || !confirmCancel || !confirmOk) {
   
      if (window.confirm(message || title)) onConfirm();
      else onCancel();
      return;
    }

    confirmTitle.textContent = title;
    confirmMessage.textContent = message || "";

    
    confirmModal.classList.add("show");

    
    const backdropHandler = (e) => {
      if (e.target === confirmModal) {
        cleanup();
        onCancel();
      }
    };
    confirmModal.addEventListener("click", backdropHandler, { once: true });

    
    const escHandler = (e) => {
      if (e.key === "Escape") {
        cleanup();
        onCancel();
      }
    };
    document.addEventListener("keydown", escHandler, { once: true });


    function cleanup() {
      confirmModal.classList.remove("show");
      
      try { confirmOk.removeEventListener("click", okHandler); } catch {}
      try { confirmCancel.removeEventListener("click", cancelHandler); } catch {}
    }

    
    const okHandler = () => {
      cleanup();
      onConfirm();
    };
    const cancelHandler = () => {
      cleanup();
      onCancel();
    };

    
    confirmOk.addEventListener("click", okHandler, { once: true });
    confirmCancel.addEventListener("click", cancelHandler, { once: true });
  }

 
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = (nameInput?.value || "").toString().trim();
    if (!nome) {
      showToast("Por favor, insira o nome do produto.", "erro");
      return;
    }
    const novoProduto = {
      id: editId || Date.now().toString(),
      codigo: codeInput.value.trim() || `PRD-${Math.floor(Math.random() * 90000 + 10000)}`,
      nome: nameInput.value.trim(),
      marca: brandInput.value.trim(),
      categoria: categoryInput.value,
      estado: conditionInput.value,
      status: statusInput.value,
      valor: parseFloat(valueInput.value) || 0,
      quantidade: parseInt(quantityInput.value) || 0,
      descricao: descriptionInput.value.trim(),
      dataCadastro: new Date().toLocaleDateString("pt-BR"),
    };

    if (editId) {
      const index = produtos.findIndex((p) => p.id === editId);
      if (index !== -1) produtos[index] = novoProduto;
      showToast("Produto atualizado com sucesso!", "sucesso");
    } else {
      produtos.push(novoProduto);
      showToast("Produto adicionado com sucesso!", "sucesso");
    }
    salvarLocal();
    renderizarTabela();
    fecharModal();
    limparFormulario();
  });

  
  tabelaBody.addEventListener("click", (e) => {
    const btnEditar = e.target.closest(".editar");
    const btnExcluir = e.target.closest(".excluir");
    if (btnEditar) {
      const id = btnEditar.dataset.id;
      const produto = produtos.find((p) => p.id === id);
      if (produto) {
        editId = id;
        codeInput.value = produto.codigo || "";
        nameInput.value = produto.nome || "";
        brandInput.value = produto.marca || "";
        categoryInput.value = produto.categoria || "";
        conditionInput.value = produto.estado || "";
        statusInput.value = produto.status || "";
        valueInput.value = produto.valor || "";
        quantityInput.value = produto.quantidade || "";
        descriptionInput.value = produto.descricao || "";
        const btn = form.querySelector("button[type='submit']");
        if (btn) {
          const icon = btn.querySelector("i");
          if (icon) icon.className = "fas fa-sync";
          btn.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE) n.textContent = " Atualizar"; });
        }
        abrirModal();
      }
    }
    if (btnExcluir) {
      const id = btnExcluir.dataset.id;
      const produto = produtos.find((p) => p.id === id);

      
      openConfirmModal({
        title: "Excluir Produto",
        message: `Tem certeza que deseja excluir o produto "${produto?.nome || ""}"?`,
        onConfirm: () => {
          produtos = produtos.filter((p) => p.id !== id);
          salvarLocal();
          renderizarTabela();
          showToast("Produto excluído com sucesso!", "sucesso");
        },
        onCancel: () => {
          
        }
      });
    }
  });


  addBtn && addBtn.addEventListener("click", () => { limparFormulario(); abrirModal(); });
  closeBtn && closeBtn.addEventListener("click", fecharModal);
  cancelBtn && cancelBtn.addEventListener("click", fecharModal);

  if (filterName) filterName.addEventListener("input", renderizarTabela);
  if (filterBrand) filterBrand.addEventListener("input", renderizarTabela);
  if (filterCategory) filterCategory.addEventListener("change", renderizarTabela);
  if (filterCondition) filterCondition.addEventListener("change", renderizarTabela);
  if (filterStatus) filterStatus.addEventListener("change", renderizarTabela);
  if (filterMinValue) filterMinValue.addEventListener("input", renderizarTabela);
  if (filterMaxValue) filterMaxValue.addEventListener("input", renderizarTabela);

  if (clearFiltersBtn)
    clearFiltersBtn.addEventListener("click", () => {
      if (filterName) filterName.value = "";
      if (filterBrand) filterBrand.value = "";
      if (filterCategory) filterCategory.value = "";
      if (filterCondition) filterCondition.value = "";
      if (filterStatus) filterStatus.value = "";
      if (filterMinValue) filterMinValue.value = "";
      if (filterMaxValue) filterMaxValue.value = "";
      renderizarTabela();
    });


  renderizarTabela();

  
  window._produtos_debug = { produtos, renderizarTabela, resolveCategoriaInfo };
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
