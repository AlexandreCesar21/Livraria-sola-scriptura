document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const reportType = $("reportType");
  const reportFilter = $("reportFilter");
  const generateBtn = $("generateReportBtn");
  const tableHead = $("reportTableHead");
  const tableBody = $("reportTableBody");
  const tableContainer = $("reportResults");
  const reportSummary = $("reportSummary");
  const reportInfo = $("reportInfo");

  const KEY_BOOKS = "livraria_books";
  const KEY_LOANS = "livraria_loans";
  const KEY_CLIENTS = "livraria_clients";
  const KEY_SALES = "livraria_sales";

  const load = (key) => JSON.parse(localStorage.getItem(key) || "[]");
  const formatMoney = (v) =>
    (Number(v) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  const nowDate = () =>
    new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const nowDateTime = () =>
    new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  function filtrarLivros(tipo, filtro) {
    const livros = load(KEY_BOOKS);
    const texto = filtro.trim().toLowerCase();

    switch (tipo) {
      case "general":
        return livros;
      case "author":
        return livros.filter((l) => l.author?.toLowerCase().includes(texto));
      case "publisher":
        return livros.filter((l) => l.publisher?.toLowerCase().includes(texto));
      case "category":
        return livros.filter((l) => l.category?.toLowerCase().includes(texto));
      case "value":
        if (!texto) return [];
        const val = parseFloat(texto);
        return livros.filter((l) => Number(l.value) === val);
      case "stock":
        return livros.filter((l) => Number(l.quantity) === 0);
      case "status":
        return livros.filter(
          (l) => l.status?.toLowerCase() === texto.toLowerCase()
        );
      default:
        return livros;
    }
  }

  function renderTabela(livros) {
    tableHead.innerHTML = `
      <tr>
        <th>Título</th>
        <th>Autor</th>
        <th>Categoria</th>
        <th>Valor</th>
        <th>Estoque</th>
        <th>Status</th>
      </tr>
    `;

    tableBody.innerHTML = "";

    if (!livros.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;color:#999;padding:12px;">
            Nenhum registro encontrado
          </td>
        </tr>`;
      return;
    }

    livros.forEach((l) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${l.title || ""}</td>
        <td>${l.author || ""}</td>
        <td>${l.category || ""}</td>
        <td>${formatMoney(l.value)}</td>
        <td>${l.quantity}</td>
        <td>${l.status || ""}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

 function atualizarInformacoes(livros, filtroUsado, tipoRelatorio) {
  const loans = JSON.parse(localStorage.getItem("livraria_loans") || "[]");
  const clients = JSON.parse(localStorage.getItem("livraria_clients") || "[]");
  const sales = JSON.parse(localStorage.getItem("livraria_sales") || "[]");
  const books = JSON.parse(localStorage.getItem("livraria_books") || "[]");

  const totalVendas = sales.reduce((soma, v) => soma + (Number(v.total) || 0), 0);
  const emprestimosAtivos = loans.filter(
    (l) => l.status?.toUpperCase() === "ATIVO"
  ).length;
  const clientesCadastrados = clients.length;

  const totalTitulos = books.length;
  const livrosAtivos = books.filter(
    (b) => b.status?.toUpperCase() === "ATIVO"
  ).length;
  const totalExemplares = books.reduce(
    (soma, b) => soma + (Number(b.quantity) || 0),
    0
  );
  const valorTotalEstoque = books.reduce(
    (soma, b) => soma + (Number(b.quantity) * (Number(b.value) || 0)),
    0
  );

  const nowDateTime = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  document.getElementById("reportInfo").innerHTML = `
    <div class="info-box">
      <!-- Estatísticas Gerais -->
      <div class="info-card">
        <h4>Estatísticas Gerais</h4>
        <div class="row"><strong>Total de títulos:</strong> <span>${totalTitulos}</span></div>
        <div class="row"><strong>Livros ativos:</strong> <span>${livrosAtivos}</span></div>
        <div class="row"><strong>Total de exemplares:</strong> <span>${totalExemplares}</span></div>
        <div class="row"><strong>Valor total do estoque:</strong> <span>${valorTotalEstoque.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div>
      </div>

      <!-- Resumo do Sistema -->
      <div class="info-card">
        <h4>Resumo do Sistema</h4>
        <div class="row"><strong>Total de vendas:</strong> <span>${totalVendas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div>
        <div class="row"><strong>Empréstimos ativos:</strong> <span>${emprestimosAtivos}</span></div>
        <div class="row"><strong>Clientes cadastrados:</strong> <span>${clientesCadastrados}</span></div>
        <div class="row"><strong>Última atualização:</strong> <span>${nowDateTime}</span></div>
      </div>
    </div>
  `;
}


  generateBtn.addEventListener("click", () => {
    const tipo = reportType.value;
    const filtro = reportFilter.value;

    const livros = filtrarLivros(tipo, filtro);
    renderTabela(livros);
    atualizarInformacoes(livros, filtro, tipo);

    tableContainer.style.display = "block";
    reportSummary.style.display = "block";
  });

  const livros = load(KEY_BOOKS);
  renderTabela(livros);
  atualizarInformacoes(livros, "", "general");
  tableContainer.style.display = "block";
  reportSummary.style.display = "block";
});
