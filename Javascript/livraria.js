document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editBookstoreBtn");
  const modal = document.getElementById("bookstoreModal");
  const closeModalBtn = document.getElementById("closeBookstoreModal");
  const cancelBtn = document.getElementById("cancelBookstoreBtn");
  const form = document.getElementById("bookstoreForm");

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

  const aplicarMascaraCEP = (v) => {
    v = v.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    return v.replace(/(\d{5})(\d{0,3})/, "$1-$2");
  };

 
  formFields.cnpj.addEventListener("input", (e) => {
    e.target.value = aplicarMascaraCNPJ(e.target.value);
  });
  formFields.phone.addEventListener("input", (e) => {
    e.target.value = aplicarMascaraTelefone(e.target.value);
  });
  formFields.cep.addEventListener("input", (e) => {
    e.target.value = aplicarMascaraCEP(e.target.value);
  });


  function loadBookstore() {
    const saved = JSON.parse(localStorage.getItem("bookstoreData"));
    if (saved) {
      Object.keys(fields).forEach((key) => {
        fields[key].textContent = saved[key] || "";
      });
    }
  }

 
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

  
  const closeModal = () => modal.classList.remove("show");
  closeModalBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {};
    Object.keys(formFields).forEach((key) => {
      data[key] = formFields[key].value.trim();
    });

    
    if (data.cnpj.replace(/\D/g, "").length !== 14) {
      showToast("CNPJ inválido!", "error");
      return;
    }
    if (data.phone.replace(/\D/g, "").length < 10) {
      showToast("Telefone inválido!", "error");
      return;
    }
    if (data.cep.replace(/\D/g, "").length !== 8) {
      showToast("CEP inválido!", "error");
      return;
    }

    localStorage.setItem("bookstoreData", JSON.stringify(data));
    Object.keys(fields).forEach((key) => {
      fields[key].textContent = data[key];
    });

    modal.classList.remove("show");
    showToast("Informações da livraria atualizadas com sucesso!");
  });


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

  loadBookstore();
});


const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const icon = toggleBtn.querySelector('i');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleBtn.classList.toggle('rotate');
  });