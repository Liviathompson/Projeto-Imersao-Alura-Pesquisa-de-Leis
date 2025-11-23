// =================================================================
// ⚠️ CONFIGURAÇÃO OBRIGATÓRIA
// =================================================================
// Cole sua chave dentro das aspas abaixo. 
// Exemplo: const API_KEY = "AIzaSy...";
const API_KEY = "COLAIzaSyBedsueqoVxey1ChLb4pI1Nd1aTn6o2RPM"; 

// =================================================================
// VARIÁVEIS GLOBAIS
// =================================================================
let cardContainer = document.querySelector(".card-container");
let campoBusca = document.querySelector("#campo-busca");
let dados = [];

// =================================================================
// FUNÇÕES DE BUSCA E FILTRO
// =================================================================

// Função principal que busca os dados e filtra
async function iniciarBusca() {
    // 1. Carrega o JSON se ainda não estiver na memória
    if (dados.length === 0) {
        try {
            let resposta = await fetch("data.json");
            dados = await resposta.json();
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            alert("Erro: Não foi possível carregar o arquivo data.json");
            return;
        }
    }

    // 2. Prepara o termo de busca
    const termoBusca = campoBusca.value.toLowerCase().trim();
    
    // 3. Filtra (procura no nome, na descrição ou na área)
    const dadosFiltrados = dados.filter(dado => 
        dado.nome.toLowerCase().includes(termoBusca) || 
        dado.descricao.toLowerCase().includes(termoBusca) ||
        dado.area.toLowerCase().includes(termoBusca)
    );

    // 4. Desenha os cards na tela
    renderizarCards(dadosFiltrados);
}

// Função para os botões de filtro rápido
function filtroRapido(categoria) {
    campoBusca.value = categoria; // Preenche o input
    iniciarBusca(); // Dispara a busca
}

// Função que escolhe a cor da etiqueta baseada no texto
function obterClasseCor(area) {
    area = area.toLowerCase();
    if (area.includes('civil') || area.includes('consumidor')) return 'tag-civil';
    if (area.includes('penal')) return 'tag-penal';
    if (area.includes('trabalho')) return 'tag-trabalho';
    if (area.includes('digital')) return 'tag-digital';
    return 'tag-padrao';
}

// =================================================================
// INTELIGÊNCIA ARTIFICIAL (CONEXÃO MANUAL)
// =================================================================

async function explicarComIA(nomeDaLei, idBotao) {
    const botao = document.getElementById(idBotao);
    const areaResultado = document.getElementById(`res-${idBotao}`);
    
    // 1. Feedback visual (mostra que está pensando)
    botao.innerText = "✨ Gerando explicação...";
    botao.disabled = true;
    areaResultado.innerText = "Consultando a inteligência artificial...";
    areaResultado.style.display = "block";

    // 2. O comando para a IA
    const prompt = `Explique de forma muito simples e resumida, como se fosse para uma criança, o que é: ${nomeDaLei}. Máximo 2 frases curtas.`;

    try {
        // Limpa a chave de espaços acidentais
        const chaveLimpa = API_KEY.trim();
        
        // Verifica se a chave foi configurada
        if (chaveLimpa === "COLE_SUA_NOVA_CHAVE_AQUI" || chaveLimpa === "") {
            throw new Error("A chave da API não foi configurada no script.js");
        }

        // URL direta da API do Google (Modelo Flash - Mais rápido)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${chaveLimpa}`;
        
        // Configura o pacote de dados para enviar
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        // Verifica erros da API
        if (!response.ok) {
            const erroData = await response.json();
            console.error("ERRO DO GOOGLE:", erroData);
            throw new Error(`Erro na API (${response.status})`);
        }

        // 3. Pega o texto da resposta
        const data = await response.json();
        const textoResposta = data.candidates[0].content.parts[0].text;

        // 4. Mostra na tela
        areaResultado.innerHTML = `<strong>🤖 Gemini Explica:</strong> ${textoResposta}`;
        botao.innerText = "✨ Explicar novamente";

    } catch (error) {
        console.error("Erro capturado:", error);
        areaResultado.innerHTML = `⚠️ Ops! Não consegui explicar agora. <br><small>Erro: ${error.message}</small>`;
        botao.innerText = "Tentar de novo";
    } finally {
        botao.disabled = false;
    }
}

// =================================================================
// RENDERIZAÇÃO (CRIAÇÃO DO HTML)
// =================================================================

function renderizarCards(listaDeDados) {
    cardContainer.innerHTML = ""; // Limpa a tela

    if (listaDeDados.length === 0) {
        cardContainer.innerHTML = "<p class='mensagem-inicial'>Nenhum resultado encontrado.</p>";
        return;
    }

    // Cria um card para cada item da lista
    listaDeDados.forEach((dado, index) => {
        let article = document.createElement("article");
        article.classList.add("card");
        
        let corClasse = obterClasseCor(dado.area);
        let idUnico = `btn-${index}`; // ID único para o botão e a resposta

        article.innerHTML = `
            <span class="tag-area ${corClasse}">${dado.area}</span>
            <h2>${dado.nome}</h2>
            <p class="lei-info">${dado.lei}</p>
            <p>${dado.descricao}</p>
            
            <button id="${idUnico}" class="botao-ia" onclick="explicarComIA('${dado.nome}', '${idUnico}')">
                ✨ Explicar com IA
            </button>
            <div id="res-${idUnico}" class="resposta-ia" style="display:none;"></div>

            <a href="${dado.link}" target="_blank" style="display:block; margin-top:1rem">Ver Lei Oficial →</a>
        `;
        
        cardContainer.appendChild(article);
    });
}

// =================================================================
// EVENTOS E INICIALIZAÇÃO
// =================================================================

// Permite buscar apertando ENTER
campoBusca.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        iniciarBusca();
    }
});

// Torna as funções acessíveis no HTML (importante para o onclick funcionar)
window.iniciarBusca = iniciarBusca;
window.filtroRapido = filtroRapido;
window.explicarComIA = explicarComIA;