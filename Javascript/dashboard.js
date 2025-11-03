document.addEventListener("DOMContentLoaded", () => {

  const KEY_SALES = "livraria_sales";
  const KEY_BOOKS = "livraria_books";
  const KEY_PRODUCTS = "produtosDiversos";
  const KEY_CLIENTS = "livraria_clients";
  const KEY_RETURNS = "livraria_returns";
  const KEY_LOANS = "livraria_loans";

  const els = {
    dailySales: document.getElementById("dailySales"),
    monthlySales: document.getElementById("monthlySales"),
    newBooks: document.getElementById("newBooks"),
    newBooksStock: document.getElementById("newBooksStock"),
    usedBooks: document.getElementById("usedBooks"),
    usedBooksStock: document.getElementById("usedBooksStock"),
    totalClients: document.getElementById("totalClients"),
    totalBooksLoaned: document.getElementById("totalBooksLoaned"),
    topSellingBooks: document.getElementById("topSellingBooks"),
    lowStockBooks: document.getElementById("lowStockBooks"),
    recentActivities: document.getElementById("recentActivities"),
    overdueLoans: document.getElementById("overdueLoans"),
  };

  const formatCurrency = n =>
    "R$ " + (Number(n) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  function safeParseKey(k) {
    try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; }
  }


  function safeQty(obj) {
    return Number(obj?.quantidade ?? obj?.stock ?? obj?.qtd ?? obj?.quantity ?? obj?.estoque ?? 0) || 0;
  }

 
  function isNovo(item) {
    const s = ((item?.estado ?? item?.tipo ?? item?.condition ?? "") + "").toString().toLowerCase();
    return s.includes("novo");
  }
  
  function isUsado(item) {
    const s = ((item?.estado ?? item?.tipo ?? item?.condition ?? "") + "").toString().toLowerCase();
  
    return s.includes("usad");
  }

  
  function normalArray(a) {
    if (!a) return [];
    if (Array.isArray(a)) return a;
    if (typeof a === "object") {
  
      if (Array.isArray(a.items)) return a.items;
      if (Array.isArray(a.data)) return a.data;
      if (Array.isArray(a.lista)) return a.lista;
    }
    return [];
  }


  function computeLoansStats() {

    let raw = safeParseKey(KEY_LOANS);
    raw = normalArray(raw);
    if (!raw.length) {
      
      const keys = Object.keys(localStorage).filter(k => /emprest|loan|loans|borrow/i.test(k));
      for (const k of keys) {
        const parsed = normalArray(safeParseKey(k));
        if (parsed.length) { raw = parsed; break; }
      }
    }

    const loans = raw.map(l => {
      return {
        itens: Array.isArray(l.itens) ? l.itens : (Array.isArray(l.items) ? l.items : []),
        dataPrevistaDevolucao: l.dataPrevistaDevolucao || l.dataPrevista || l.dueDate || l.due || null,
        dataDevolucaoReal: l.dataDevolucaoReal || l.returnDate || null,
        status: l.status || ""
      };
    });

    
    const ativos = loans.filter(ld => {
      const returned = ld.dataDevolucaoReal && String(ld.dataDevolucaoReal).trim() !== "";
      const st = (ld.status || "").toString().toLowerCase();
      const ended = /finaliz|finalizado|devolvid|returned|cancel/i.test(st);
      return !returned && !ended;
    });

    let totalLivros = 0;
    ativos.forEach(a => {
      (a.itens || []).forEach(it => {
        const qtd = Number(it.qtd ?? it.quantidade ?? it.quantity ?? it.qty ?? 0) || 0;
        totalLivros += qtd;
      });
    });

    const now = new Date();
    const atrasados = ativos.filter(a => {
      const dp = a.dataPrevistaDevolucao;
      if (!dp) return false;
      const d = new Date(dp);
      if (isNaN(d)) return false;
      return d < now;
    });

    return { totalLivros, totalAtrasados: atrasados.length, ativosCount: ativos.length };
  }

  function atualizarDashboard() {
    try {
      const vendas = normalArray(safeParseKey(KEY_SALES));
      const livros = normalArray(safeParseKey(KEY_BOOKS));
      const produtos = normalArray(safeParseKey(KEY_PRODUCTS));
      const clientes = normalArray(safeParseKey(KEY_CLIENTS));
      const devolucoes = normalArray(safeParseKey(KEY_RETURNS));

     
      const hoje = new Date();
      const hojeStr = hoje.toISOString().slice(0, 10);
      const mes = hoje.getMonth();
      const ano = hoje.getFullYear();

      const vendasHoje = vendas.filter(v => ((v.data || v.dataHora || "") + "").slice(0,10) === hojeStr);
      const vendasMes = vendas.filter(v => {
        const d = new Date(v.data || v.dataHora || v.created || Date.now());
        return d.getMonth() === mes && d.getFullYear() === ano;
      });

      const totalHoje = vendasHoje.reduce((s, v) => s + (Number(v.total) || Number(v.valor) || 0), 0);
      const totalMes = vendasMes.reduce((s, v) => s + (Number(v.total) || Number(v.valor) || 0), 0);

      if (els.dailySales) els.dailySales.textContent = formatCurrency(totalHoje);
      if (els.monthlySales) els.monthlySales.textContent = formatCurrency(totalMes);

  
      const livrosArr = Array.isArray(livros) ? livros : [];
      const novos = livrosArr.filter(isNovo);
      const usados = livrosArr.filter(isUsado);

      const totalNovosEstoque = novos.reduce((s, l) => s + safeQty(l), 0);
      const totalUsadosEstoque = usados.reduce((s, l) => s + safeQty(l), 0);

      if (els.newBooks) els.newBooks.textContent = String(novos.length || 0);
      if (els.newBooksStock) els.newBooksStock.textContent = String(totalNovosEstoque || 0);

      if (els.usedBooks) els.usedBooks.textContent = String(usados.length || 0);
      if (els.usedBooksStock) els.usedBooksStock.textContent = String(totalUsadosEstoque || 0);

  
      const clientesAtivos = (clientes || []).filter(c => ((c.status || "") + "").toString().toUpperCase() === "ATIVO");
      if (els.totalClients) els.totalClients.textContent = String(clientesAtivos.length || 0);

      
      const loanStats = computeLoansStats();
      if (els.totalBooksLoaned) els.totalBooksLoaned.textContent = String(loanStats.totalLivros || 0);
      if (els.overdueLoans) els.overdueLoans.textContent = String(loanStats.totalAtrasados || 0);

      
      const contador = {};
      (vendas || []).forEach(v => {
        (v.itens || v.items || []).forEach(it => {
          const nome = it.titulo || it.nome || it.title || it.name || "Sem título";
          contador[nome] = (contador[nome] || 0) + (Number(it.qtd) || Number(it.quantity) || 1);
        });
      });
      const top = Object.entries(contador).sort((a,b)=>b[1]-a[1]).slice(0,5);
      if (!top.length) {
        if (els.topSellingBooks) els.topSellingBooks.innerHTML = `<div class="empty-state"><i class="fas fa-chart-bar"></i><h3>Nenhuma venda registrada</h3></div>`;
      } else {
        if (els.topSellingBooks) els.topSellingBooks.innerHTML = top.map(([nome,qtd], i)=>`
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.05)">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="background:#4b0d0d;color:white;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold">${i+1}</div>
              <strong>${nome}</strong>
            </div>
            <div><strong>${qtd} vendidos</strong></div>
          </div>`).join("");
      }

      
      const todos = [...(Array.isArray(livros) ? livros : []), ...(Array.isArray(produtos) ? produtos : [])];
      const baixos = todos.filter(p => {
        const qtd = safeQty(p);
        return qtd > 0 && qtd <= 3;
      });
      if (!baixos.length) {
        if (els.lowStockBooks) els.lowStockBooks.innerHTML = `<div class="empty-state"><i class="fas fa-boxes"></i><h3>Estoque OK</h3><p>Nenhum livro com estoque baixo</p></div>`;
      } else {
        if (els.lowStockBooks) els.lowStockBooks.innerHTML = baixos.map(b => {
          const nome = b.titulo || b.nome || b.name || b.produto || b.title || "Sem nome";
          const autor = b.autor || b.marca || b.editora || "";
          const qtd = safeQty(b);
          return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.05)"><div><strong>${nome}</strong><br><small style="color:#666">${autor}</small></div><div><span style="background:#4b0d0d;color:white;border-radius:14px;padding:4px 10px">${qtd} restantes</span></div></div>`;
        }).join("");
      }

      
      const atividades = [];
      (vendas || []).slice().reverse().slice(0,5).forEach(v => atividades.push({data: v.data || v.created || new Date().toISOString(), texto: `Venda realizada: ${(v.itens && v.itens[0] && (v.itens[0].titulo || v.itens[0].nome)) || "—"} — ${formatCurrency(v.total || 0)}`}));
      (devolucoes || []).slice().reverse().slice(0,5).forEach(d => atividades.push({data: d.data || d.created || new Date().toISOString(), texto: `Devolução — ${formatCurrency(d.total || 0)}`}));
      atividades.sort((a,b)=> new Date(b.data) - new Date(a.data));
      if (!atividades.length) {
        if (els.recentActivities) els.recentActivities.innerHTML = `<div class="empty-state"><i class="fas fa-clock"></i><h3>Nenhuma atividade recente</h3></div>`;
      } else {
        if (els.recentActivities) els.recentActivities.innerHTML = atividades.map(a => `<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.05)"><div style="color:#4b0d0d;font-size:12px">•</div><div><strong>${a.texto}</strong><br><small style="color:#666">${new Date(a.data).toLocaleString("pt-BR")}</small></div></div>`).join("");
      }

    } catch (err) {
      console.error("Erro ao atualizar dashboard:", err);
    }
  } 

  
  atualizarDashboard();
  window.addEventListener("storage", (e) => {
    const key = e.key || "";
    if (!key || /venda|sale|livraria_sales|livraria_loans|emprest|loan|loans|livraria_books|produtosDiversos|livraria_clients|livraria_returns/i.test(key)) {
      atualizarDashboard();
    }
  });
  window.addEventListener("clientsUpdated", atualizarDashboard);
  window.addEventListener("loansUpdated", atualizarDashboard);
  window.__dashboard_refresh = atualizarDashboard;
});




  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const icon = toggleBtn.querySelector('i');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleBtn.classList.toggle('rotate');
  });