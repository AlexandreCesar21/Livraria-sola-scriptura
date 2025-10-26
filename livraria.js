document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editBookstoreBtn");
  const modal = document.getElementById("bookstoreModal");
  const closeModalBtn = document.getElementById("closeBookstoreModal");
  const cancelBtn = document.getElementById("cancelBookstoreBtn");
  const form = document.getElementById("bookstoreForm");

  // Campos de exibição
  const fields = {
    name: document.getElementById("bookstoreName"),
    cnpj: document.getElementById("bookstoreCNPJ"),
    phone: document.getElementById("bookstorePhone"),
    email: document.getElementById("bookstoreEmail"),
    street: document.getElementById("bookstoreStreet"),
    neighborhood: document.getElementById("bookstoreNeighborhood"),
    city: document.getElementById("bookstoreCity"),
    cep: document.getElementById("bookstoreCEP"),
  };

  // Campos do formulário
  const formFields = {
    name: document.getElementById("bookstoreFormName"),
    cnpj: document.getElementById("bookstoreFormCNPJ"),
    phone: document.getElementById("bookstoreFormPhone"),
    email: document.getElementById("bookstoreFormEmail"),
    street: document.getElementById("bookstoreFormStreet"),
    neighborhood: document.getElementById("bookstoreFormNeighborhood"),
    city: document.getElementById("bookstoreFormCity"),
    cep: document.getElementById("bookstoreFormCEP"),
  };

  // Carregar dados salvos
  function loadBookstore() {
    const saved = JSON.parse(localStorage.getItem("bookstoreData"));
    if (saved) {
      Object.keys(fields).forEach((key) => {
        fields[key].textContent = saved[key] || "";
      });
    }
  }

  // Abrir modal
  editBtn.addEventListener("click", () => {
    const saved = JSON.parse(localStorage.getItem("bookstoreData"));
    if (saved) {
      Object.keys(formFields).forEach((key) => {
        formFields[key].value = saved[key] || "";
      });
    } else {
      Object.keys(formFields).forEach((key) => {
        formFields[key].value = fields[key].textContent.trim();
      });
    }
    modal.classList.add("show");
  });

  // Fechar modal
  const closeModal = () => modal.classList.remove("show");
  closeModalBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Salvar informações
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {};
    Object.keys(formFields).forEach((key) => {
      data[key] = formFields[key].value.trim();
    });

    // Salvar no localStorage
    localStorage.setItem("bookstoreData", JSON.stringify(data));

    // Atualizar visualmente
    Object.keys(fields).forEach((key) => {
      fields[key].textContent = data[key];
    });

    // Fechar modal e mostrar mensagem
    modal.classList.remove("show");
    showToast("Informações da livraria atualizadas com sucesso!");
  });

  // Função Toast simples
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast show ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Carregar dados ao iniciar
  loadBookstore();
});
