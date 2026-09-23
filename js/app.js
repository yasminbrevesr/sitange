const formatarPreco = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: CONFIG.moeda });

const linkWhatsApp = (mensagem) =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;

const estado = { busca: "", categoria: "Todas" };

const elProdutos = document.getElementById("produtos");
const elCategorias = document.getElementById("categorias");
const elBusca = document.getElementById("busca");
const elVazio = document.getElementById("vazio");

// Normaliza texto para busca sem diferenciar acentos e maiúsculas.
const normalizar = (texto) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function renderCategorias() {
  const categorias = ["Todas", ...new Set(PRODUTOS.map((p) => p.categoria))];
  elCategorias.innerHTML = "";
  categorias.forEach((cat) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = cat;
    botao.className = "categoria" + (cat === estado.categoria ? " ativa" : "");
    botao.addEventListener("click", () => {
      estado.categoria = cat;
      renderCategorias();
      renderProdutos();
    });
    elCategorias.appendChild(botao);
  });
}

function criarCard(produto) {
  const card = document.createElement("article");
  card.className = "card";

  const img = document.createElement("img");
  img.src = produto.imagem;
  img.alt = produto.nome;
  img.loading = "lazy";

  const corpo = document.createElement("div");
  corpo.className = "card__corpo";

  const categoria = document.createElement("span");
  categoria.className = "card__categoria";
  categoria.textContent = produto.categoria;

  const nome = document.createElement("h2");
  nome.textContent = produto.nome;

  const descricao = document.createElement("p");
  descricao.textContent = produto.descricao;

  const preco = document.createElement("strong");
  preco.className = "card__preco";
  preco.textContent = formatarPreco(produto.preco);

  const botao = document.createElement("a");
  botao.className = "botao";
  botao.target = "_blank";
  botao.rel = "noopener";
  botao.textContent = "Pedir pelo WhatsApp";
  botao.href = linkWhatsApp(
    `Olá! Tenho interesse no produto: ${produto.nome} (${formatarPreco(produto.preco)}).`
  );

  corpo.append(categoria, nome, descricao, preco, botao);
  card.append(img, corpo);
  return card;
}

function renderProdutos() {
  const termo = normalizar(estado.busca);
  const filtrados = PRODUTOS.filter((p) => {
    const naCategoria = estado.categoria === "Todas" || p.categoria === estado.categoria;
    const naBusca = normalizar(`${p.nome} ${p.descricao}`).includes(termo);
    return naCategoria && naBusca;
  });

  elProdutos.innerHTML = "";
  filtrados.forEach((p) => elProdutos.appendChild(criarCard(p)));
  elVazio.hidden = filtrados.length > 0;
}

elBusca.addEventListener("input", (e) => {
  estado.busca = e.target.value;
  renderProdutos();
});

document.getElementById("link-whatsapp").href = linkWhatsApp("Olá! Vim pelo site.");
document.getElementById("ano").textContent = new Date().getFullYear();

renderCategorias();
renderProdutos();
