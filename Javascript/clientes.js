document.addEventListener("DOMContentLoaded", () => {

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

  let clientes = JSON.parse(localStorage.getItem("livraria_clients")) || [];
  let clienteEditando = null;

  const salvarClientes = () => {
    localStorage.setItem("livraria_clients", JSON.stringify(clientes));
    window.dispatchEvent(new Event("clientsUpdated"));
  };

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

  function showToast(tipo = "add") {
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
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  const clientType = document.getElementById("clientType");
  const clientDocument = document.getElementById("clientDocument");
  const documentLabel = document.getElementById("documentLabel");
  const clientPhone = document.getElementById("clientPhone");

  
  const aplicarMascaraCPF = (v) => {
    v = v.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    return v
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const aplicarMascaraCNPJ = (v) => {
    v = v.replace(/\D/g, "");
    if (v.length > 14) v = v.slice(0, 14);
    return v
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const aplicarMascaraTelefone = (v) => {
    v = v.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11); 
    if (v.length <= 10) {
      return v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  
  clientType.addEventListener("change", () => {
    clientDocument.value = ""; 

    if (clientType.value === "PESSOA_FISICA") {
      documentLabel.textContent = "CPF *";
      clientDocument.placeholder = "000.000.000-00";
      clientDocument.maxLength = 14;
      clientDocument.oninput = (e) => {
        e.target.value = aplicarMascaraCPF(e.target.value);
      };
    } else if (clientType.value === "PESSOA_JURIDICA") {
      documentLabel.textContent = "CNPJ *";
      clientDocument.placeholder = "00.000.000/0000-00";
      clientDocument.maxLength = 18;
      clientDocument.oninput = (e) => {
        e.target.value = aplicarMascaraCNPJ(e.target.value);
      };
    } else {
      documentLabel.textContent = "CPF/CNPJ *";
      clientDocument.placeholder = "Digite o CPF ou CNPJ";
      clientDocument.removeAttribute("maxlength");
      clientDocument.oninput = null;
    }
  });


  clientPhone.addEventListener("input", (e) => {
    e.target.value = aplicarMascaraTelefone(e.target.value);
  });


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
          <span class="badge ${c.status === "ATIVO" ? "active" : "inactive"}">
            ${c.status === "ATIVO" ? "Ativo" : "Inativo"}
          </span>
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

  function excluirCliente(id) {
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) return;

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

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

    const fecharModalConfirmacao = () => {
      overlay.classList.remove("show");
      setTimeout(() => overlay.remove(), 200);
    };

    modal.querySelector(".btn-cancelar").addEventListener("click", fecharModalConfirmacao);

    modal.querySelector(".btn-confirmar").addEventListener("click", () => {
      clientes = clientes.filter((x) => x.id !== id);
      salvarClientes();
      renderizarClientes();
      showToast("delete");
      fecharModalConfirmacao();
    });

    setTimeout(() => overlay.classList.add("show"), 50);
  }

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

  const inputDoc = document.getElementById("clientDocument");
  const inputTel = document.getElementById("clientPhone");

  inputDoc.addEventListener("input", (e) => {
    e.target.value = aplicarMascaraDocumento(e.target.value);
  });

  inputTel.addEventListener("input", (e) => {
    e.target.value = aplicarMascaraTelefone(e.target.value);
  });

  addClientBtn.addEventListener("click", () => abrirModal());
  closeClientModal.addEventListener("click", fecharModal);
  cancelClientBtn.addEventListener("click", fecharModal);

  renderizarClientes();
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



const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const icon = toggleBtn.querySelector('i');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleBtn.classList.toggle('rotate');
  });