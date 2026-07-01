// =========================
// FINANÇA SX - SCRIPT COMPLETO
// =========================

// ELEMENTOS
const desc = document.getElementById("desc");
const valor = document.getElementById("valor");
const data = document.getElementById("data");
const categoria = document.getElementById("categoria");
const tipo = document.getElementById("tipo");

const btnAdicionar = document.getElementById("btnAdicionar");
const lista = document.getElementById("lista");

const saldoEl = document.getElementById("saldo");
const entradasEl = document.getElementById("entradas");
const saidasEl = document.getElementById("saidas");

const totalRegistros = document.getElementById("totalRegistros");
const maiorEntrada = document.getElementById("maiorEntrada");
const maiorSaida = document.getElementById("maiorSaida");

const pesquisa = document.getElementById("pesquisa");
const limparTudo = document.getElementById("limparTudo");
const filtros = document.querySelectorAll(".btnFiltro");

// DADOS
let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];
let filtroAtual = "all";

// =========================
// SALVAR NO LOCALSTORAGE
// =========================
function salvar() {
    localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

// =========================
// ADICIONAR TRANSAÇÃO
// =========================
btnAdicionar.addEventListener("click", () => {
    if (!desc.value || !valor.value || !data.value) return;

    const novaTransacao = {
        id: Date.now(),
        desc: desc.value,
        valor: parseFloat(valor.value),
        data: data.value,
        categoria: categoria.value,
        tipo: tipo.value
    };

    transacoes.push(novaTransacao);
    salvar();
    render();
    limparInputs();
});

// =========================
// LIMPAR INPUTS
// =========================
function limparInputs() {
    desc.value = "";
    valor.value = "";
    data.value = "";
}

// =========================
// REMOVER TRANSAÇÃO
// =========================
function remover(id) {
    transacoes = transacoes.filter(t => t.id !== id);
    salvar();
    render();
}

// =========================
// RENDER LISTA
// =========================
function render() {
    lista.innerHTML = "";

    let filtradas = filtrarTransacoes();

    filtradas.forEach(t => {
        const div = document.createElement("div");
        div.classList.add("transacao");

        div.innerHTML = `
            <div>
                <strong>${t.desc}</strong><br>
                <small>${t.categoria} | ${t.data}</small>
            </div>

            <div>
                <span style="color:${t.tipo === "entrada" ? "#22c55e" : "#ef4444"}">
                    R$ ${t.valor.toFixed(2)}
                </span>
                <button onclick="remover(${t.id})">🗑️</button>
            </div>
        `;

        lista.appendChild(div);
    });

    atualizarResumo();
    atualizarEstatisticas();
    atualizarGrafico();
}

// =========================
// FILTROS
// =========================
function filtrarTransacoes() {
    let texto = pesquisa.value.toLowerCase();

    return transacoes.filter(t => {
        let matchTexto =
            t.desc.toLowerCase().includes(texto) ||
            t.categoria.toLowerCase().includes(texto);

        let matchTipo =
            filtroAtual === "all" || t.tipo === filtroAtual;

        return matchTexto && matchTipo;
    });
}

// =========================
// EVENTOS FILTROS
// =========================
filtros.forEach(btn => {
    btn.addEventListener("click", () => {
        filtros.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");

        filtroAtual = btn.dataset.filter;
        render();
    });
});

pesquisa.addEventListener("input", render);

// =========================
// RESUMO (SALDO / ENTRADAS / SAÍDAS)
// =========================
function atualizarResumo() {
    let entradas = transacoes
        .filter(t => t.tipo === "entrada")
        .reduce((acc, t) => acc + t.valor, 0);

    let saidas = transacoes
        .filter(t => t.tipo === "saida")
        .reduce((acc, t) => acc + t.valor, 0);

    let saldo = entradas - saidas;

    saldoEl.textContent = `R$ ${saldo.toFixed(2)}`;
    entradasEl.textContent = `R$ ${entradas.toFixed(2)}`;
    saidasEl.textContent = `R$ ${saidas.toFixed(2)}`;
}

// =========================
// ESTATÍSTICAS
// =========================
function atualizarEstatisticas() {
    totalRegistros.textContent = transacoes.length;

    let entradas = transacoes.filter(t => t.tipo === "entrada");
    let saidas = transacoes.filter(t => t.tipo === "saida");

    let maiorE = entradas.length
        ? Math.max(...entradas.map(t => t.valor))
        : 0;

    let maiorS = saidas.length
        ? Math.max(...saidas.map(t => t.valor))
        : 0;

    maiorEntrada.textContent = `R$ ${maiorE.toFixed(2)}`;
    maiorSaida.textContent = `R$ ${maiorS.toFixed(2)}`;
}

// =========================
// GRÁFICO (CHART.JS)
// =========================
let grafico;

function atualizarGrafico() {
    let entradas = transacoes
        .filter(t => t.tipo === "entrada")
        .reduce((acc, t) => acc + t.valor, 0);

    let saidas = transacoes
        .filter(t => t.tipo === "saida")
        .reduce((acc, t) => acc + t.valor, 0);

    const ctx = document.getElementById("grafico");

    if (grafico) grafico.destroy();

    grafico = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Entradas", "Saídas"],
            datasets: [{
                data: [entradas, saidas],
                backgroundColor: ["#22c55e", "#ef4444"]
            }]
        }
    });
}

// =========================
// LIMPAR TUDO
// =========================
limparTudo.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja apagar tudo?")) {
        transacoes = [];
        salvar();
        render();
    }
});

// =========================
// INICIALIZAÇÃO
// =========================
render();
