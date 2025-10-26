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
  const filterMinValue = document.getElementById("filterMinValue");
  const filterMaxValue = document.getElementById("filterMaxValue");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  const STORAGE_KEY = "produtosDiversos";
  let produtos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  let editId = null;

  const salvarLocal = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));

  const limparFormulario = () => {
    form.reset();
    editId = null;
    form.querySelector("button[type='submit'] i").className = "fas fa-save";
    form.querySelector("button[type='submit']").lastChild.textContent = " Salvar";
  };

  const abrirModal = () => modal.classList.add("show");
  const fecharModal = () => modal.classList.remove("show");

  const formatarValor = (valor) =>
    (Number(valor) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function renderizarTabela() {
    tabelaBody.innerHTML = "";

    let lista = produtos.slice();

    const nomeFiltro = filterName?.value.trim().toLowerCase() || "";
    const marcaFiltro = filterBrand?.value.trim().toLowerCase() || "";
    const categoriaFiltro = filterCategory?.value || "";
    const estadoFiltro = filterCondition?.value || "";
    const statusFiltro = filterStatus?.value || "";
    const valorMin = parseFloat(filterMinValue?.value) || 0;
    const valorMax = parseFloat(filterMaxValue?.value) || Infinity;

    if (nomeFiltro) lista = lista.filter((p) => p.nome.toLowerCase().includes(nomeFiltro));
    if (marcaFiltro) lista = lista.filter((p) => p.marca.toLowerCase().includes(marcaFiltro));
    if (categoriaFiltro) lista = lista.filter((p) => p.categoria === categoriaFiltro);
    if (estadoFiltro) lista = lista.filter((p) => p.estado === estadoFiltro);
    if (statusFiltro) lista = lista.filter((p) => p.status === statusFiltro);
    if (valorMin || valorMax < Infinity)
      lista = lista.filter((p) => p.valor >= valorMin && p.valor <= valorMax);

    if (lista.length === 0) {
      tabelaBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center; color:#777; padding:10px">
            Nenhum produto encontrado
          </td>
        </tr>`;
      return;
    }

    lista.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${p.nome}</strong><br><small style="color:#888">Código: ${p.codigo}</small></td>
        <td>${p.marca || "-"}</td>
        <td>
          <span style="background:#f1f1f1; padding:4px 8px; border-radius:6px; font-size:0.85rem;">
            ${p.categoria}
          </span>
        </td>
        <td>
          <span style="background:${p.estado === "Novo" ? "#e6f5ea" : "#fdeaea"};
                       color:${p.estado === "Novo" ? "#1a6b3d" : "#b02222"};
                       border-radius:6px; padding:4px 8px; font-size:0.85rem;">
            ${p.estado}
          </span>
        </td>
        <td>${formatarValor(p.valor)}</td>
        <td style="color:${p.quantidade < 10 ? "red" : "#333"};">${p.quantidade}</td>
        <td>${p.dataCadastro}</td>
        <td>${p.status}</td>
        <td style="text-align:center;">
          <button class="btn btn-secondary btn-sm editar" data-id="${p.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm excluir" data-id="${p.id}" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tabelaBody.appendChild(tr);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = nameInput.value.trim();
    if (!nome) {
      alert("Por favor, insira o nome do produto.");
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
      valor: parseFloat(valueInput.value),
      quantidade: parseInt(quantityInput.value),
      descricao: descriptionInput.value.trim(),
      dataCadastro: new Date().toLocaleDateString("pt-BR"),
    };

    if (editId) {
      const index = produtos.findIndex((p) => p.id === editId);
      produtos[index] = novoProduto;
    } else {
      produtos.push(novoProduto);
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
        codeInput.value = produto.codigo;
        nameInput.value = produto.nome;
        brandInput.value = produto.marca;
        categoryInput.value = produto.categoria;
        conditionInput.value = produto.estado;
        statusInput.value = produto.status;
        valueInput.value = produto.valor;
        quantityInput.value = produto.quantidade;
        descriptionInput.value = produto.descricao;
        form.querySelector("button[type='submit'] i").className = "fas fa-sync";
        form.querySelector("button[type='submit']").lastChild.textContent = " Atualizar";
        abrirModal();
      }
    }

    if (btnExcluir) {
      const id = btnExcluir.dataset.id;
      if (confirm("Tem certeza que deseja excluir este produto?")) {
        produtos = produtos.filter((p) => p.id !== id);
        salvarLocal();
        renderizarTabela();
      }
    }
  });

  addBtn.addEventListener("click", () => {
    limparFormulario();
    abrirModal();
  });
  closeBtn.addEventListener("click", fecharModal);
  cancelBtn.addEventListener("click", fecharModal);

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
});
