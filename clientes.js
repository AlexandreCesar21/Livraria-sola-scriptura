// ============================
// MÓDULO DE CLIENTES (3 toasts - mesmo visual vinho escuro)
// ============================

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------
  // ELEMENTOS DO DOM
  // ----------------------------
  const addClientBtn = document.getElementById("addClientBtn");
  const clientModal = document.getElementById("clientModal");
  const closeClientModal = document.getElementById("closeClientModal");
  const cancelClientBtn = document.getElementById("cancelClientBtn");
  const clientForm = document.getElementById("clientForm");
  const clientModalTitle = document.getElementById("clientModalTitle");
  const clientsTableBody = document.getElementById("clientsTableBody");

  const filterName = document.getElementById("filterClientName");
  const filterCPF = document.getElementById("filterClientCPF");
  const filterStatus = document.getElementById("filterClientStatus");

  // ----------------------------
  // ESTADO E DADOS
  // ----------------------------
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  let clienteEditando = null;

  // ----------------------------
  // FUNÇÕES AUXILIARES
  // ----------------------------
  const salvarClientes = () =>
    localStorage.setItem("clientes", JSON.stringify(clientes));

  const gerarId = () => Date.now();

  const abrirModal = (titulo = "Adicionar Cliente") => {
    clientModalTitle.textContent = titulo;
    clientModal.classList.add("show");
  };

  const fecharModal = () => {
    clientModal.classList.remove("show");
    clientForm.reset();
    clienteEditando = null;
  };

  // =============================
  // TOAST UNIFICADO (vinho escuro)
  // =============================
  function showToast(tipo = "add") {
    // Remove qualquer toast anterior
    document.querySelectorAll(".toast-success").forEach((t) => t.remove());

    let mensagem = "Cliente adicionado com sucesso!";
    if (tipo === "edit") mensagem = "Cliente atualizado com sucesso!";
    if (tipo === "delete") mensagem = "Cliente excluído com sucesso!";

    const toast = document.createElement("div");
    toast.className = "toast-success";
    toast.innerHTML = `
      <span class="toast-icon">✔</span>
      <span class="toast-message">${mensagem}</span>
    `;

    document.body.appendChild(toast);

    // Animação de entrada
    setTimeout(() => toast.classList.add("show"), 100);

    // Remover automaticamente após 3s
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ----------------------------
  // MÁSCARAS
  // ----------------------------
  const aplicarMascaraTelefone = (v) => {
    v = v.replace(/\D/g, "");
    if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const aplicarMascaraDocumento = (v) => {
    v = v.replace(/\D/g, "");
    if (v.length <= 11) {
      return v
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return v
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
  };

  // ----------------------------
  // RENDERIZAÇÃO DA TABELA
  // ----------------------------
  function renderizarClientes(lista = clientes) {
    clientsTableBody.innerHTML = "";

    if (lista.length === 0) {
      clientsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            <i class="fas fa-user-slash"></i>
            <h3>Nenhum cliente encontrado</h3>
          </td>
        </tr>`;
      return;
    }

    lista.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nome}</td>
        <td>${c.documento}</td>
        <td>${c.telefone}</td>
        <td>${c.email}</td>
        <td>
          <span class="badge ${
            c.status === "ATIVO" ? "active" : "inactive"
          }">${c.status === "ATIVO" ? "Ativo" : "Inativo"}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" data-id="${c.id}" title="Editar">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn-icon btn-delete" data-id="${c.id}" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      clientsTableBody.appendChild(tr);
    });

    // Eventos
    document.querySelectorAll(".btn-edit").forEach((btn) =>
      btn.addEventListener("click", (e) =>
        editarCliente(Number(e.currentTarget.dataset.id))
      )
    );

    document.querySelectorAll(".btn-delete").forEach((btn) =>
      btn.addEventListener("click", (e) =>
        excluirCliente(Number(e.currentTarget.dataset.id))
      )
    );
  }

  // ----------------------------
  // CADASTRAR / EDITAR CLIENTE
  // ----------------------------
  clientForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const novoCliente = {
      id: clienteEditando ? clienteEditando.id : gerarId(),
      tipo: document.getElementById("clientType").value,
      nome: document.getElementById("clientName").value.trim(),
      documento: document.getElementById("clientDocument").value.trim(),
      telefone: document.getElementById("clientPhone").value.trim(),
      email: document.getElementById("clientEmail").value.trim(),
      status: document.getElementById("clientStatus").value,
    };

    if (clienteEditando) {
      const i = clientes.findIndex((x) => x.id === clienteEditando.id);
      clientes[i] = novoCliente;
      showToast("edit");
    } else {
      clientes.push(novoCliente);
      showToast("add");
    }

    salvarClientes();
    renderizarClientes();
    fecharModal();
  });

  // ----------------------------
  // EDITAR CLIENTE
  // ----------------------------
  function editarCliente(id) {
    const c = clientes.find((x) => x.id === id);
    if (!c) return;
    clienteEditando = c;
    abrirModal("Editar Cliente");

    document.getElementById("clientType").value = c.tipo || "";
    document.getElementById("clientName").value = c.nome;
    document.getElementById("clientDocument").value = c.documento;
    document.getElementById("clientPhone").value = c.telefone;
    document.getElementById("clientEmail").value = c.email;
    document.getElementById("clientStatus").value = c.status;
  }

  // ----------------------------
  // EXCLUIR CLIENTE
  // ----------------------------
  function excluirCliente(id) {
    if (!confirm("Deseja realmente excluir este cliente?")) return;
    clientes = clientes.filter((x) => x.id !== id);
    salvarClientes();
    renderizarClientes();
    showToast("delete");
  }

  // ----------------------------
  // FILTROS
  // ----------------------------
  function aplicarFiltros() {
    const nome = filterName.value.toLowerCase();
    const doc = filterCPF.value.toLowerCase();
    const status = filterStatus.value;

    const filtrados = clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(nome) &&
        c.documento.toLowerCase().includes(doc) &&
        (status === "" || c.status === status)
    );

    renderizarClientes(filtrados);
  }

  filterName.addEventListener("input", aplicarFiltros);
  filterCPF.addEventListener("input", aplicarFiltros);
  filterStatus.addEventListener("change", aplicarFiltros);

  // ----------------------------
  // MÁSCARAS AO DIGITAR
  // ----------------------------
  const inputDoc = document.getElementById("clientDocument");
  const inputTel = document.getElementById("clientPhone");

  inputDoc.addEventListener("input", (e) => {
    e.target.value = aplicarMascaraDocumento(e.target.value);
  });

  inputTel.addEventListener("input", (e) => {
    e.target.value = aplicarMascaraTelefone(e.target.value);
  });

  // ----------------------------
  // CONTROLE DE MODAL
  // ----------------------------
  addClientBtn.addEventListener("click", () => abrirModal());
  closeClientModal.addEventListener("click", fecharModal);
  cancelClientBtn.addEventListener("click", fecharModal);

  // ----------------------------
  // INICIALIZAÇÃO
  // ----------------------------
  renderizarClientes();


  // ----------------------------
// EXCLUIR CLIENTE (com modal personalizado)
// ----------------------------
function excluirCliente(id) {
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) return;

  // Cria o fundo escuro
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  // Cria o modal
  const modal = document.createElement("div");
  modal.className = "modal-confirmacao";

  modal.innerHTML = `
    <h3>Excluir Cliente</h3>
    <p>Tem certeza que deseja excluir este cliente?</p>
    <div class="botoes">
      <button class="btn-cancelar">Cancelar</button>
      <button class="btn-confirmar">Confirmar</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Fecha modal
  const fecharModal = () => {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 200);
  };

  // Evento Cancelar
  modal.querySelector(".btn-cancelar").addEventListener("click", fecharModal);

  // Evento Confirmar
  modal.querySelector(".btn-confirmar").addEventListener("click", () => {
    clientes = clientes.filter((x) => x.id !== id);
    salvarClientes();
    renderizarClientes();
    showToast("delete");
    fecharModal();
  });

  // Exibe modal suavemente
  setTimeout(() => overlay.classList.add("show"), 50);
}

});



