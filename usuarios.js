document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "sistema_usuarios";
  const form = document.getElementById("userForm");
  const tabelaBody = document.getElementById("usersTableBody");
  const modal = document.getElementById("userModal");
  const addBtn = document.getElementById("addUserBtn");
  const closeModalBtn = document.getElementById("closeUserModal");
  const cancelBtn = document.getElementById("cancelUserBtn");

  const nameInput = document.getElementById("userName");
  const emailInput = document.getElementById("userEmail");
  const passwordInput = document.getElementById("userPassword");
  const typeInput = document.getElementById("userType");
  const statusInput = document.getElementById("userStatus");

  const filterName = document.getElementById("filterUserName");
  const filterType = document.getElementById("filterUserType");
  const filterStatus = document.getElementById("filterUserStatus");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  let usuarios = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let editId = null;

  if (!usuarios.some((u) => u.tipo === "Administrador Principal")) {
    usuarios.unshift({
      id: "admin001",
      nome: "Administrador Principal",
      email: "admin@livraria.com",
      senha: "admin123",
      tipo: "Administrador Principal",
      status: "Ativo",
      dataCadastro: new Date().toLocaleDateString("pt-BR"),
      fixo: true,
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
  }

  const salvarLocal = () =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));

  const abrirModal = () => modal.classList.add("show");
  const fecharModal = () => modal.classList.remove("show");

  const limparForm = () => {
    form.reset();
    editId = null;
    form.querySelector("button[type='submit'] i").className = "fas fa-save";
    form.querySelector("button[type='submit']").lastChild.textContent = " Salvar";
  };

  const toast = (msg, cor = "#3c0d00") => {
    const el = document.createElement("div");
    el.textContent = msg;
    Object.assign(el.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: cor,
      color: "#fff",
      padding: "10px 18px",
      borderRadius: "8px",
      zIndex: 9999,
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  };

  const formatarData = (data) => {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
  };

  function renderTabela() {
    tabelaBody.innerHTML = "";

    let lista = usuarios.slice();

    const nomeFiltro = filterName.value.trim().toLowerCase();
    const tipoFiltro = filterType.value;
    const statusFiltro = filterStatus.value;

    if (nomeFiltro)
      lista = lista.filter((u) =>
        u.nome.toLowerCase().includes(nomeFiltro)
      );
    if (tipoFiltro) lista = lista.filter((u) => u.tipo === tipoFiltro);
    if (statusFiltro) lista = lista.filter((u) => u.status === statusFiltro);

    if (!lista.length) {
      tabelaBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;color:#777;padding:10px">
            Nenhum usuário encontrado
          </td>
        </tr>`;
      return;
    }

    lista.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${u.nome}</strong></td>
        <td>${u.email}</td>
        <td>${u.tipo}</td>
        <td>${u.status}</td>
        <td>${u.dataCadastro}</td>
        <td style="text-align:center;">
          ${
            u.fixo
              ? `<span style="color:#aaa;">Bloqueado</span>`
              : `
            <button class="btn btn-secondary btn-sm editar" data-id="${u.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm excluir" data-id="${u.id}">
              <i class="fas fa-trash"></i>
            </button>`
          }
        </td>
      `;
      tabelaBody.appendChild(tr);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = nameInput.value.trim();
    const email = emailInput.value.trim();
    const senha = passwordInput.value.trim();
    const tipo = typeInput.value;
    const status = statusInput.value;

    if (!nome || !email || !senha || !tipo) {
      toast("Preencha todos os campos obrigatórios!", "#a00");
      return;
    }

    if (editId) {
      const index = usuarios.findIndex((u) => u.id === editId);
      usuarios[index] = {
        ...usuarios[index],
        nome,
        email,
        senha,
        tipo,
        status,
      };
      toast("Usuário atualizado com sucesso!");
    } else {
      const novo = {
        id: Date.now().toString(),
        nome,
        email,
        senha,
        tipo,
        status,
        dataCadastro: new Date().toLocaleDateString("pt-BR"),
        fixo: false,
      };
      usuarios.push(novo);
      toast("Usuário cadastrado com sucesso!");
    }

    salvarLocal();
    renderTabela();
    fecharModal();
    limparForm();
  });

  tabelaBody.addEventListener("click", (e) => {
    const btnEditar = e.target.closest(".editar");
    const btnExcluir = e.target.closest(".excluir");

    if (btnEditar) {
      const id = btnEditar.dataset.id;
      const user = usuarios.find((u) => u.id === id);
      if (user) {
        editId = id;
        nameInput.value = user.nome;
        emailInput.value = user.email;
        passwordInput.value = user.senha;
        typeInput.value = user.tipo;
        statusInput.value = user.status;
        form.querySelector("button[type='submit'] i").className = "fas fa-sync";
        form.querySelector("button[type='submit']").lastChild.textContent = " Atualizar";
        abrirModal();
      }
    }

    if (btnExcluir) {
      const id = btnExcluir.dataset.id;
      const user = usuarios.find((u) => u.id === id);
      if (user && user.fixo) {
        toast("Esse usuário não pode ser excluído!", "#a00");
        return;
      }
      if (confirm("Tem certeza que deseja excluir este usuário?")) {
        usuarios = usuarios.filter((u) => u.id !== id);
        salvarLocal();
        renderTabela();
        toast("Usuário excluído com sucesso!", "#a00");
      }
    }
  });

  [filterName, filterType, filterStatus].forEach((f) =>
    f.addEventListener("input", renderTabela)
  );

  if (clearFiltersBtn)
    clearFiltersBtn.addEventListener("click", () => {
      filterName.value = "";
      filterType.value = "";
      filterStatus.value = "";
      renderTabela();
    });

  addBtn.addEventListener("click", () => {
    limparForm();
    abrirModal();
  });

  closeModalBtn.addEventListener("click", fecharModal);
  cancelBtn.addEventListener("click", fecharModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  renderTabela();
});
