 function toast(mensagem) {
      const container = document.getElementById("toastContainer");
      const toast = document.createElement("div");
      toast.className = "toast-msg";
      toast.textContent = mensagem;
      container.appendChild(toast);
      setTimeout(() => toast.classList.add("show"), 10);
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
      }, 3000);
    }

    document.addEventListener("DOMContentLoaded", () => {
      const form = document.getElementById("loginForm");
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const errorMessage = document.getElementById("errorMessage");

      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const senha = passwordInput.value.trim();

        if (!email || !senha) {
          errorMessage.textContent = "Preencha todos os campos.";
          errorMessage.style.display = "block";
          return;
        }

        const usuarios = JSON.parse(localStorage.getItem("sistema_usuarios")) || [];
        const user = usuarios.find(u => u.email === email && u.senha === senha);

        if (user) {
          toast("✔ Login realizado com sucesso!");
          errorMessage.style.display = "none";

          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1200);
        } else {
          errorMessage.textContent = "E-mail ou senha incorretos.";
          errorMessage.style.display = "block";
        }
      });
    });



