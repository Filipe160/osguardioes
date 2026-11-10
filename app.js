/* ==========================================================================
   COORDENADAS GEOGRÁFICAS DOS BAIRROS DE BELO HORIZONTE (Privacy by Design)
   ========================================================================== */
const COORDENADAS_BAIRROS_BH = {
  "Coração Eucarístico": [-19.9227, -43.9926],
  "Barreiro": [-19.9760, -44.0195],
  "Buritis": [-19.9710, -43.9660],
  "Venda Nova": [-19.8180, -43.9560],
  "Zona Leste": [-19.9140, -43.9180],
  "Centro": [-19.9191, -43.9386],
  "Savassi": [-19.9360, -43.9350],
  "Pampulha": [-19.8580, -43.9780]
};

/* ==========================================================================
   BANCO DE DADOS INICIAL SIMULADO (Contexto Urbano de Belo Horizonte)
   ========================================================================== */
const RELATOS_INICIAIS = [
  {
    id: 101,
    categoria: "Furto/Roubo de Celular",
    bairro: "Coração Eucarístico",
    referencia: "Próximo à passarela de acesso ao metrô e ponto de ônibus principal",
    data: new Date().toISOString().split("T")[0],
    hora: "22:15",
    descricao: "Dois indivíduos em uma motocicleta escura passaram abordando estudantes que aguardavam o ônibus com o celular na mão no fim do turno da noite. Recomenda-se aguardar próximo à portaria iluminada.",
    confirmacoes: 18,
    contestacoes: 1,
    lat: -19.9227,
    lng: -43.9926,
    votoUsuarioAtual: null,
    denuncias: [],
    oculto: false
  },
  {
    id: 102,
    categoria: "Arrombamento/Comércio",
    bairro: "Barreiro",
    referencia: "Quarteirão comercial próximo à Av. Afonso Vaz de Melo",
    data: new Date().toISOString().split("T")[0],
    hora: "14:30",
    descricao: "Espalharam em grupos de mensagem que estaria ocorrendo um arrastão nas lojas agora à tarde, mas os próprios lojistas verificaram que foi apenas um alarme disparado acidentalmente. Comércio funcionando normalmente.",
    confirmacoes: 3,
    contestacoes: 14,
    lat: -19.9760,
    lng: -44.0195,
    votoUsuarioAtual: null,
    denuncias: [
      { motivo: "Boato Falso / Pânico Infundado", detalhe: "Alarme falso que assustou os clientes da galeria." }
    ],
    oculto: false
  },
  {
    id: 103,
    categoria: "Assalto a Transeunte",
    bairro: "Buritis",
    referencia: "Praça próxima à pista de caminhada na Av. Professor Mário Werneck",
    data: obterDataPassada(1),
    hora: "07:10",
    descricao: "Moradora relatou abordagem rápida no início da manhã enquanto caminhava próximo à área arborizada. Levaram correntinha e aparelho celular. Viaturas da Rede de Vizinhos Protegidos foram avisadas.",
    confirmacoes: 11,
    contestacoes: 0,
    lat: -19.9710,
    lng: -43.9660,
    votoUsuarioAtual: null,
    denuncias: [],
    oculto: false
  },
  {
    id: 104,
    categoria: "Roubo/Furto de Veículos",
    bairro: "Venda Nova",
    referencia: "Cruzamento semaforizado próximo à Estação Vilarinho",
    data: obterDataPassada(2),
    hora: "23:40",
    descricao: "Tentativa de abordagem a entregador de aplicativo parado no sinal vermelho. O motociclista conseguiu arrancar porque a via estava livre. Evitem parar isolados após as 23h neste trecho.",
    confirmacoes: 24,
    contestacoes: 2,
    lat: -19.8180,
    lng: -43.9560,
    votoUsuarioAtual: null,
    denuncias: [],
    oculto: false
  },
  {
    id: 105,
    categoria: "Arrombamento/Comércio",
    bairro: "Zona Leste",
    referencia: "Esquina da praça principal do bairro Santa Tereza",
    data: obterDataPassada(3),
    hora: "03:20",
    descricao: "Furto de cabos de iluminação pública deixando metade do quarteirão no escuro durante a madrugada. Moradores já abriram chamado na prefeitura e registraram protocolo.",
    confirmacoes: 9,
    contestacoes: 0,
    lat: -19.9140,
    lng: -43.9180,
    votoUsuarioAtual: null,
    denuncias: [],
    oculto: false
  },
  {
    id: 106,
    categoria: "Furto/Roubo de Celular",
    bairro: "Centro",
    referencia: "Entorno da Praça Sete de Setembro",
    data: obterDataPassada(1),
    hora: "18:20",
    descricao: "Furto de celular de dentro da bolsa durante horário de pico na travessia de pedestres. Atenção redobrada com mochilas e bolsas abertas.",
    confirmacoes: 19,
    contestacoes: 0,
    lat: -19.9191,
    lng: -43.9386,
    votoUsuarioAtual: null,
    denuncias: [],
    oculto: false
  }
];

function obterDataPassada(diasAtras) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().split("T")[0];
}

/* ==========================================================================
   ESTADO DA APLICAÇÃO E VARIÁVEIS DO MAPA
   ========================================================================== */
let relatos = JSON.parse(localStorage.getItem("guardioes_relatos")) || RELATOS_INICIAIS;
let usuarioLogado = JSON.parse(localStorage.getItem("guardioes_usuario")) || null;
let categoriaFiltroAtual = "TODAS";
let relatoSelecionadoId = null;
let modoAuth = "entrar";

// Variáveis do Leaflet (Mapa e Heatmap)
let mapaBH = null;
let camadaCalor = null;
let camadaMarcadores = null;
let calorAtivo = true;

function salvarDadosLocais() {
  localStorage.setItem("guardioes_relatos", JSON.stringify(relatos));
}

/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  configurarDataMaximaFormulario();
  inicializarMapaBH();
  atualizarInterfaceUsuario();
  renderizarFeed();
});

function configurarDataMaximaFormulario() {
  const inputData = document.getElementById("relato-data");
  if (inputData) {
    const hoje = new Date().toISOString().split("T")[0];
    inputData.max = hoje;
    inputData.value = hoje;
  }
}

/* ==========================================================================
   MAPA INTERATIVO E MAPA DE CALOR (LEAFLET + OPENSTREETMAP)
   ========================================================================== */
function inicializarMapaBH() {
  const elementoMapa = document.getElementById("mapa-bh");
  if (!elementoMapa || typeof L === "undefined") return;

  // Coordenadas centrais de Belo Horizonte
  mapaBH = L.map("mapa-bh").setView([-19.9191, -43.9586], 12);

  // Usando o servidor público alternativo do OpenStreetMap (Cicلي/Humanitário) ou tiles livres sem chave
  L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "© OpenStreetMap France | © OpenStreetMap contributors • Os Guardiões BH"
  }).addTo(mapaBH);

  camadaMarcadores = L.layerGroup().addTo(mapaBH);
}

function atualizarMapaCalor(listaRelatosVisiveis) {
  if (!mapaBH || typeof L === "undefined") return;

  // Limpa os pinos atuais
  camadaMarcadores.clearLayers();

  // Remove camada de calor anterior se existir
  if (camadaCalor) {
    mapaBH.removeLayer(camadaCalor);
  }

  const pontosCalor = [];

  listaRelatosVisiveis.forEach((relato) => {
    const coordsPadrao = COORDENADAS_BAIRROS_BH[relato.bairro] || [-19.9191, -43.9386];
    const lat = relato.lat || coordsPadrao[0];
    const lng = relato.lng || coordsPadrao[1];

    // Intensidade baseada nas confirmações da comunidade (entre 0.4 e 1.0)
    const intensidade = Math.min(1.0, Math.max(0.4, relato.confirmacoes / 15));

    // Adiciona pontos para formar a mancha de calor na região
    pontosCalor.push([lat, lng, intensidade]);
    pontosCalor.push([lat + 0.002, lng + 0.002, intensidade * 0.8]);
    pontosCalor.push([lat - 0.002, lng - 0.002, intensidade * 0.8]);

    // Cria pino clicável com resumo e botão para abrir detalhes
    const marcador = L.marker([lat, lng]);
    marcador.bindPopup(`
      <div style="font-family: sans-serif; min-width: 190px;">
        <strong style="color: #1e3a8a;">${relato.categoria}</strong><br>
        <span>📍 <strong>${relato.bairro}</strong> (${relato.referencia})</span><br>
        <small>👍 ${relato.confirmacoes} confirmações | 👎 ${relato.contestacoes} contestações</small><br>
        <button onclick="abrirDetalhesRelato(${relato.id})" style="margin-top:8px; padding:4px 10px; background:#1e3a8a; color:#fff; border:none; border-radius:4px; cursor:pointer; width:100%;">
          Ver Relato Completo
        </button>
      </div>
    `);
    camadaMarcadores.addLayer(marcador);
  });

  // Renderiza a mancha de calor (Heatmap)
  if (calorAtivo && typeof L.heatLayer !== "undefined" && pontosCalor.length > 0) {
    camadaCalor = L.heatLayer(pontosCalor, {
      radius: 32,
      blur: 22,
      maxZoom: 15,
      gradient: {
        0.3: "#3b82f6", // Azul (Baixa)
        0.6: "#f59e0b", // Laranja (Moderada)
        0.9: "#ef4444"  // Vermelho (Alta Concentração)
      }
    }).addTo(mapaBH);
  }
}

function alternarCamadaCalor() {
  calorAtivo = !calorAtivo;
  const btn = document.getElementById("btn-toggle-heat");
  btn.textContent = calorAtivo ? "🔥 Ocultar Calor" : "🔥 Mostrar Calor";
  renderizarFeed();
}

function centralizarMapaBH() {
  if (!mapaBH) return;
  mapaBH.setView([-19.9191, -43.9586], 12);
}

/* ==========================================================================
   NAVEGAÇÃO ENTRE AS 5 TELAS
   ========================================================================== */
function navegarPara(idTela) {
  document.querySelectorAll(".screen").forEach((sec) => sec.classList.add("hidden"));
  document.getElementById(idTela).classList.remove("hidden");

  const fab = document.getElementById("fab-novo-relato");
  if (idTela === "tela-feed") {
    fab.classList.remove("hidden");
    renderizarFeed();
    // Corrige o redimensionamento do mapa ao voltar para a tela inicial
    if (mapaBH) {
      setTimeout(() => mapaBH.invalidateSize(), 150);
    }
  } else {
    fab.classList.add("hidden");
  }

  if (idTela === "tela-moderacao") {
    renderizarPainelModeracao();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================================================================
   TELA 1: RENDERIZAÇÃO DO HISTÓRICO E FILTROS (CSU01 / CSU02)
   ========================================================================== */
function selecionarCategoria(categoria, elementoChip) {
  categoriaFiltroAtual = categoria;
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  if (elementoChip) elementoChip.classList.add("active");
  aplicarFiltros();
}

function aplicarFiltros() {
  const bairroSelecionado = document.getElementById("filtro-bairro").value;
  if (mapaBH && bairroSelecionado !== "TODOS" && COORDENADAS_BAIRROS_BH[bairroSelecionado]) {
    mapaBH.setView(COORDENADAS_BAIRROS_BH[bairroSelecionado], 14);
  } else if (mapaBH && bairroSelecionado === "TODOS") {
    mapaBH.setView([-19.9191, -43.9586], 12);
  }
  renderizarFeed();
}

function limparFiltros() {
  document.getElementById("filtro-texto").value = "";
  document.getElementById("filtro-bairro").value = "TODOS";
  document.getElementById("filtro-periodo").value = "TODOS";
  categoriaFiltroAtual = "TODAS";

  const chips = document.querySelectorAll(".chip");
  chips.forEach((c) => c.classList.remove("active"));
  if (chips[0]) chips[0].classList.add("active");

  centralizarMapaBH();
  renderizarFeed();
}

function renderizarFeed() {
  const container = document.getElementById("lista-relatos");
  const textoBusca = document.getElementById("filtro-texto").value.toLowerCase().trim();
  const bairroSelecionado = document.getElementById("filtro-bairro").value;
  const periodoSelecionado = document.getElementById("filtro-periodo").value;

  const barraAtivos = document.getElementById("barra-filtros-ativos");
  const descAtivos = [];
  if (categoriaFiltroAtual !== "TODAS") descAtivos.push(categoriaFiltroAtual);
  if (bairroSelecionado !== "TODOS") descAtivos.push(`Bairro: ${bairroSelecionado}`);
  if (periodoSelecionado !== "TODOS") descAtivos.push(`Período: ${periodoSelecionado}`);
  if (textoBusca) descAtivos.push(`Busca: "${textoBusca}"`);

  if (descAtivos.length > 0) {
    barraAtivos.classList.remove("hidden");
    document.getElementById("texto-filtros-ativos").textContent = descAtivos.join(" • ");
  } else {
    barraAtivos.classList.add("hidden");
  }

  let listaFiltrada = relatos.filter((r) => !r.oculto);

  if (bairroSelecionado !== "TODOS") {
    listaFiltrada = listaFiltrada.filter((r) => r.bairro === bairroSelecionado);
  }

  if (categoriaFiltroAtual !== "TODAS" && categoriaFiltroAtual !== "CONFIRMADOS") {
    listaFiltrada = listaFiltrada.filter((r) => r.categoria === categoriaFiltroAtual);
  }

  if (periodoSelecionado !== "TODOS") {
    const hoje = new Date();
    listaFiltrada = listaFiltrada.filter((r) => {
      const dataRelato = new Date(r.data + "T00:00:00");
      const diffHoras = (hoje - dataRelato) / (1000 * 60 * 60);
      return periodoSelecionado === "24H" ? diffHoras <= 36 : diffHoras <= 168;
    });
  }

  if (textoBusca) {
    listaFiltrada = listaFiltrada.filter(
      (r) =>
        r.descricao.toLowerCase().includes(textoBusca) ||
        r.referencia.toLowerCase().includes(textoBusca) ||
        r.bairro.toLowerCase().includes(textoBusca)
    );
  }

  if (categoriaFiltroAtual === "CONFIRMADOS") {
    listaFiltrada.sort((a, b) => b.confirmacoes - a.confirmacoes);
  } else {
    listaFiltrada.sort((a, b) => b.id - a.id);
  }

  // Atualiza o Mapa de Calor com os relatos filtrados
  atualizarMapaCalor(listaFiltrada);

  if (listaFiltrada.length === 0) {
    container.innerHTML = `
      <div class="detail-card">
        <h3>Nenhum relato encontrado para estes filtros</h3>
        <p class="section-desc">Tente limpar os filtros de busca ou selecionar outro bairro de Belo Horizonte.</p>
        <button class="btn-secondary" onclick="limparFiltros()">Mostrar Todos os Relatos</button>
      </div>
    `;
    return;
  }

  container.innerHTML = listaFiltrada
    .map((relato) => {
      const classeConfirmado = relato.votoUsuarioAtual === "CONFIRMAR" ? "voted" : "";
      const classeContestado = relato.votoUsuarioAtual === "CONTESTAR" ? "voted" : "";

      return `
      <article class="relato-card">
        <div class="card-header">
          <span class="badge-categoria">${relato.categoria}</span>
          <span class="card-meta">📅 ${formatarDataBR(relato.data)} às ${relato.hora}</span>
        </div>

        <div class="card-location">
          📍 ${relato.bairro} — <span style="font-weight: 500;">${relato.referencia}</span>
        </div>

        <p class="card-desc">${relato.descricao}</p>

        <div class="card-footer">
          <div class="vote-group" aria-label="Avaliação da Comunidade">
            <button class="btn-sm btn-success-vote ${classeConfirmado}" onclick="votarRelato(${relato.id}, 'CONFIRMAR')">
              👍 Confirmar (${relato.confirmacoes})
            </button>
            <button class="btn-sm btn-contest-vote ${classeContestado}" onclick="votarRelato(${relato.id}, 'CONTESTAR')">
              👎 Contestar (${relato.contestacoes})
            </button>
          </div>

          <button class="btn-secondary btn-sm" onclick="abrirDetalhesRelato(${relato.id})">
            Ver Detalhes Completos →
          </button>
        </div>
      </article>
    `;
    })
    .join("");
}

/* ==========================================================================
   TELA 2: DETALHES DO RELATO, VOTAÇÃO E SINALIZAÇÃO (CSU04 / CSU05 / CSU06)
   ========================================================================== */
function abrirDetalhesRelato(id) {
  relatoSelecionadoId = id;
  const relato = relatos.find((r) => r.id === id);
  if (!relato) return;

  const totalVotos = relato.confirmacoes + relato.contestacoes;
  const percentualConfirmacao = totalVotos > 0 ? Math.round((relato.confirmacoes / totalVotos) * 100) : 50;

  const classeConfirmado = relato.votoUsuarioAtual === "CONFIRMAR" ? "voted" : "";
  const classeContestado = relato.votoUsuarioAtual === "CONTESTAR" ? "voted" : "";

  const container = document.getElementById("conteudo-detalhe");
  container.innerHTML = `
    <div class="card-header">
      <span class="badge-categoria">${relato.categoria}</span>
      <span class="card-meta">Registrado em ${formatarDataBR(relato.data)} • Horário aprox.: ${relato.hora}</span>
    </div>

    <h2 style="margin: 12px 0 6px 0;">📍 ${relato.bairro}</h2>
    <p style="font-size: 1.05rem; color: #334155; margin-bottom: 18px;">
      <strong>Ponto de referência:</strong> ${relato.referencia}
    </p>

    <div style="background: #f8fafc; padding: 18px; border-radius: 8px; border-left: 4px solid #1e3a8a; margin-bottom: 20px;">
      <h3 style="font-size: 1rem; margin-bottom: 8px;">Descrição do Relato Comunitário:</h3>
      <p style="white-space: pre-line;">${relato.descricao}</p>
    </div>

    <div class="validation-meter">
      <h3>Avaliação Comunitária deste Relato</h3>
      <p class="help-text">Moradores da região podem confirmar se presenciaram/têm ciência do fato ou contestar caso se trate de um boato.</p>
      
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${percentualConfirmacao}%"></div>
      </div>
      <p style="font-size: 0.9rem; margin-bottom: 14px;">
        <strong>${relato.confirmacoes} confirmações</strong> contra <strong>${relato.contestacoes} contestações</strong> (${percentualConfirmacao}% de concordância comunitária)
      </p>

      <div class="vote-group">
        <button class="btn-success-vote ${classeConfirmado}" onclick="votarRelato(${relato.id}, 'CONFIRMAR', true)">
          👍 Confirmar Fato (${relato.confirmacoes})
        </button>
        <button class="btn-contest-vote ${classeContestado}" onclick="votarRelato(${relato.id}, 'CONTESTAR', true)">
          👎 Contestar / Suspeita de Boato (${relato.contestacoes})
        </button>
      </div>
      <small class="help-text" style="margin-top: 8px;">💡 Dica: Clique novamente sobre o mesmo botão caso queira desfazer o seu voto.</small>
    </div>

    <div class="legal-banner" style="border-radius: 8px; padding: 12px;">
      <strong>ℹ️ Nota de Transparência:</strong> Este relato foi compartilhado voluntariamente por um membro da comunidade e <strong>não representa confirmação oficial da Polícia Militar ou Civil</strong>. Em emergências, ligue <strong>190</strong>.
    </div>
  `;

  navegarPara("tela-detalhes");
}

function votarRelato(id, tipoVoto, atualizarTelaDetalhe = false) {
  if (!usuarioLogado) {
    exibirToast("⚠️ Faça login rápido para votar na veracidade de um relato.");
    navegarPara("tela-login");
    return;
  }

  const relato = relatos.find((r) => r.id === id);
  if (!relato) return;

  if (relato.votoUsuarioAtual === tipoVoto) {
    if (tipoVoto === "CONFIRMAR") relato.confirmacoes--;
    if (tipoVoto === "CONTESTAR") relato.contestacoes--;
    relato.votoUsuarioAtual = null;
    exibirToast("↩️ Seu voto foi removido.");
  } else {
    if (relato.votoUsuarioAtual === "CONFIRMAR") relato.confirmacoes--;
    if (relato.votoUsuarioAtual === "CONTESTAR") relato.contestacoes--;

    if (tipoVoto === "CONFIRMAR") relato.confirmacoes++;
    if (tipoVoto === "CONTESTAR") relato.contestacoes++;
    relato.votoUsuarioAtual = tipoVoto;
    exibirToast("✅ Avaliação comunitária registrada com sucesso!");
  }

  salvarDadosLocais();
  if (atualizarTelaDetalhe) {
    abrirDetalhesRelato(id);
  } else {
    renderizarFeed();
  }
}

function abrirModalDenuncia() {
  document.getElementById("motivo-denuncia").value = "";
  document.getElementById("detalhe-denuncia").value = "";
  document.getElementById("modal-denuncia").classList.remove("hidden");
}

function fecharModalDenuncia() {
  document.getElementById("modal-denuncia").classList.add("hidden");
}

function confirmarDenuncia() {
  const motivo = document.getElementById("motivo-denuncia").value;
  const detalhe = document.getElementById("detalhe-denuncia").value.trim();

  if (!motivo) {
    alert("Por favor, selecione o motivo da sinalização.");
    return;
  }

  const relato = relatos.find((r) => r.id === relatoSelecionadoId);
  if (relato) {
    relato.denuncias.push({
      motivo,
      detalhe: detalhe || "Sem observações extras.",
      data: new Date().toLocaleDateString("pt-BR")
    });
    salvarDadosLocais();
    atualizarInterfaceUsuario();
  }

  fecharModalDenuncia();
  exibirToast("🚩 Sinalização enviada com sucesso para análise da moderação!");
}

/* ==========================================================================
   TELA 3: CADASTRO DE RELATO E ATUALIZAÇÃO DO MAPA DE CALOR (CSU03)
   ========================================================================== */
function acionarNovoRelato() {
  if (!usuarioLogado) {
    exibirToast("🔒 Entre ou crie uma conta rápida para publicar um novo relato.");
    navegarPara("tela-login");
    return;
  }
  navegarPara("tela-cadastro");
}

function salvarNovoRelato(event) {
  event.preventDefault();

  const categoria = document.getElementById("relato-categoria").value;
  const bairro = document.getElementById("relato-bairro").value;
  const referencia = document.getElementById("relato-referencia").value.trim();
  const data = document.getElementById("relato-data").value;
  const hora = document.getElementById("relato-hora").value;
  const descricao = document.getElementById("relato-descricao").value.trim();
  const caixaAlerta = document.getElementById("alerta-lgpd");

  const regexPlaca = /[A-Z]{3}[- ]?[0-9][A-Z0-9][0-9]{2}/i;
  const regexCPFouTelefone = /(\d{3}\.?\d{3}\.?\d{3}-?\d{2})|(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/;
  const regexNumeroCasa = /\b(nº|numero|número|casa|apto|apartamento)\s*\d+/i;

  const textoCombinado = `${referencia} ${descricao}`;

  if (regexPlaca.test(textoCombinado) || regexCPFouTelefone.test(textoCombinado) || regexNumeroCasa.test(textoCombinado)) {
    caixaAlerta.classList.remove("hidden");
    caixaAlerta.innerHTML = `
      ⚠️ <strong>Proteção de Privacidade (LGPD):</strong> Identificamos possíveis dados pessoais (placa de veículo, telefone, CPF ou número exato de residência). Remova esses dados e informe apenas pontos de referência públicos.
    `;
    return;
  }

  caixaAlerta.classList.add("hidden");

  const btnSubmit = document.getElementById("btn-submit-relato");
  btnSubmit.disabled = true;
  btnSubmit.textContent = "⏳ Enviando relato...";

  // Coordenada aproximada do bairro com leve variação para não empilhar pinos no mesmo pixel
  const coordBase = COORDENADAS_BAIRROS_BH[bairro] || [-19.9191, -43.9386];
  const desvioLat = (Math.random() - 0.5) * 0.006;
  const desvioLng = (Math.random() - 0.5) * 0.006;

  setTimeout(() => {
    const novoRelato = {
      id: Date.now(),
      categoria,
      bairro,
      referencia,
      data,
      hora,
      descricao,
      confirmacoes: 1,
      contestacoes: 0,
      lat: coordBase[0] + desvioLat,
      lng: coordBase[1] + desvioLng,
      votoUsuarioAtual: "CONFIRMAR",
      denuncias: [],
      oculto: false
    };

    relatos.unshift(novoRelato);
    salvarDadosLocais();

    document.getElementById("form-novo-relato").reset();
    configurarDataMaximaFormulario();
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Publicar Relato na Comunidade";

    exibirToast("✅ Relato publicado e Mapa de Calor atualizado!");
    navegarPara("tela-feed");
  }, 600);
}

/* ==========================================================================
   TELA 4: AUTENTICAÇÃO SIMPLIFICADA (CSU07)
   ========================================================================== */
function alternarAbaAuth(modo) {
  modoAuth = modo;
  document.getElementById("tab-entrar").classList.toggle("active", modo === "entrar");
  document.getElementById("tab-criar").classList.toggle("active", modo === "criar");
  document.getElementById("grupo-nome").classList.toggle("hidden", modo === "entrar");
  document.getElementById("titulo-auth").textContent =
    modo === "entrar" ? "Entrar como Colaborador" : "Criar Conta Simplificada";
}

function mostrarOcultarSenha() {
  const inputSenha = document.getElementById("auth-senha");
  inputSenha.type = inputSenha.type === "password" ? "text" : "password";
}

function processarAutenticacao(event) {
  event.preventDefault();
  const email = document.getElementById("auth-email").value.trim();
  const senha = document.getElementById("auth-senha").value.trim();
  const perfil = document.getElementById("auth-perfil").value;
  const erroAuth = document.getElementById("erro-auth");

  if (senha.length < 4) {
    erroAuth.classList.remove("hidden");
    erroAuth.textContent = "E-mail ou senha incorretos. A senha deve ter pelo menos 4 caracteres.";
    return;
  }

  erroAuth.classList.add("hidden");

  usuarioLogado = {
    email,
    perfil
  };

  localStorage.setItem("guardioes_usuario", JSON.stringify(usuarioLogado));
  atualizarInterfaceUsuario();
  exibirToast(`👋 Sessão iniciada com sucesso (${perfil === "MODERADOR" ? "Moderador" : "Colaborador"})!`);
  navegarPara("tela-feed");
}

function encerrarSessao() {
  usuarioLogado = null;
  localStorage.removeItem("guardioes_usuario");
  atualizarInterfaceUsuario();
  exibirToast("Você saiu da sua conta. A consulta continua livre.");
  navegarPara("tela-feed");
}

function atualizarInterfaceUsuario() {
  const areaUsuario = document.getElementById("area-usuario");
  const btnModeracao = document.getElementById("btn-moderacao");
  const contadorDenuncias = document.getElementById("contador-denuncias");

  const totalSinalizados = relatos.filter((r) => !r.oculto && (r.denuncias.length > 0 || r.contestacoes >= 5)).length;
  contadorDenuncias.textContent = totalSinalizados;

  if (usuarioLogado) {
    areaUsuario.innerHTML = `
      <button class="btn-outline btn-sm" onclick="encerrarSessao()">
        👤 ${usuarioLogado.email.split("@")[0]} (Sair)
      </button>
    `;
    if (usuarioLogado.perfil === "MODERADOR") {
      btnModeracao.classList.remove("hidden");
    } else {
      btnModeracao.classList.add("hidden");
    }
  } else {
    areaUsuario.innerHTML = `
      <button class="btn-primary btn-sm" onclick="navegarPara('tela-login')">Entrar / Cadastrar</button>
    `;
    btnModeracao.classList.add("hidden");
  }
}

/* ==========================================================================
   TELA 5: PAINEL DE GESTÃO DA MODERAÇÃO (CSU08 / RF8)
   ========================================================================== */
function renderizarPainelModeracao() {
  const container = document.getElementById("lista-moderacao");
  const pendentes = relatos.filter((r) => !r.oculto && (r.denuncias.length > 0 || r.contestacoes >= 5));

  if (pendentes.length === 0) {
    container.innerHTML = `
      <div style="padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center;">
        <h3>✅ Tudo em dia!</h3>
        <p class="section-desc">Não há relatos pendentes de moderação no momento.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pendentes
    .map(
      (r) => `
      <div class="relato-card" style="margin-bottom: 16px; border-left: 5px solid #b45309;">
        <div class="card-header">
          <span class="badge-categoria">${r.categoria} • ${r.bairro}</span>
          <span class="card-meta">Contestações: <strong>${r.contestacoes}</strong> | Denúncias: <strong>${r.denuncias.length}</strong></span>
        </div>
        <p style="margin-bottom: 8px;"><strong>Referência:</strong> ${r.referencia}</p>
        <p style="margin-bottom: 12px;">"${r.descricao}"</p>

        <div style="background: #fef3c7; padding: 10px; border-radius: 6px; margin-bottom: 12px; font-size: 0.9rem;">
          <strong>Motivos sinalizados pela comunidade:</strong>
          <ul style="margin-left: 20px; margin-top: 4px;">
            ${
              r.denuncias.length > 0
                ? r.denuncias.map((d) => `<li><strong>${d.motivo}:</strong> ${d.detalhe}</li>`).join("")
                : "<li>Alto índice de contestação popular (suspeita de boato).</li>"
            }
          </ul>
        </div>

        <div class="vote-group">
          <button class="btn-sm btn-success-vote" onclick="decidirModeracao(${r.id}, 'MANTER')">
            ✔️ Aprovar e Manter Relato
          </button>
          <button class="btn-sm btn-danger" onclick="decidirModeracao(${r.id}, 'REMOVER')">
            🗑️ Ocultar / Remover Conteúdo
          </button>
        </div>
      </div>
    `
    )
    .join("");
}

function decidirModeracao(id, acao) {
  const relato = relatos.find((r) => r.id === id);
  if (!relato) return;

  if (acao === "MANTER") {
    relato.denuncias = [];
    exibirToast("✔️ Relato aprovado e mantido no histórico.");
  } else {
    relato.oculto = true;
    exibirToast("🗑️ Relato removido do histórico e do Mapa de Calor.");
  }

  salvarDadosLocais();
  atualizarInterfaceUsuario();
  renderizarPainelModeracao();
}

/* ==========================================================================
   UTILITÁRIOS E ACESSIBILIDADE
   ========================================================================== */
function alternarFonte() {
  document.body.classList.toggle("fonte-ampliada");
  const ampliada = document.body.classList.contains("fonte-ampliada");
  document.getElementById("btn-contraste").textContent = ampliada ? "A- Letra Normal" : "A+ Letra Maior";
}

function exibirToast(mensagem) {
  const toast = document.getElementById("toast-feedback");
  toast.textContent = mensagem;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
}

function formatarDataBR(dataISO) {
  if (!dataISO) return "";
  const partes = dataISO.split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataISO;
}