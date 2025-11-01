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
