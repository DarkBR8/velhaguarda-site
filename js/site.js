// Velha Guarda · scripts do site

// Ano no rodapé
document.querySelectorAll("[data-ano]").forEach(el => el.textContent = new Date().getFullYear());

// Topo fica sólido ao rolar
const topo = document.querySelector(".topo");
if (topo && !topo.classList.contains("fixo-solido")) {
  const atualizar = () => topo.classList.toggle("solido", window.scrollY > 40);
  atualizar();
  window.addEventListener("scroll", atualizar, { passive: true });
}

// Menu do celular
const botaoMenu = document.querySelector(".menu-botao");
const menu = document.querySelector(".menu");
if (botaoMenu && menu) {
  botaoMenu.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", aberto);
  });
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("aberto")));
}

// Elementos aparecem ao rolar
const revelar = document.querySelectorAll(".revelar");
if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visivel"); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revelar.forEach(el => obs.observe(el));
} else {
  revelar.forEach(el => el.classList.add("visivel"));
}

// Copiar IP do servidor
document.querySelectorAll("[data-copiar]").forEach(botao => {
  botao.addEventListener("click", () => {
    const texto = document.querySelector(botao.dataset.copiar).textContent.trim();
    navigator.clipboard.writeText(texto).then(() => {
      const original = botao.textContent;
      botao.textContent = "Copiado!";
      setTimeout(() => botao.textContent = original, 1500);
    });
  });
});

// Cinzas e brasas subindo na capa
const canvas = document.getElementById("cinzas");
if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const ctx = canvas.getContext("2d");
  let w, h, particulas = [];
  const ajustar = () => {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    const qtd = Math.min(90, Math.floor(w / 14));
    particulas = Array.from({ length: qtd }, () => nova(true));
  };
  const nova = (inicio) => ({
    x: Math.random() * w,
    y: inicio ? Math.random() * h : h + 10,
    r: Math.random() * 2.2 + 0.6,
    vy: Math.random() * 0.6 + 0.25,
    vx: (Math.random() - 0.5) * 0.4,
    brasa: Math.random() < 0.35,
    fase: Math.random() * Math.PI * 2,
  });
  const desenhar = () => {
    ctx.clearRect(0, 0, w, h);
    particulas.forEach((p, i) => {
      p.y -= p.vy;
      p.fase += 0.02;
      p.x += p.vx + Math.sin(p.fase) * 0.3;
      if (p.y < -10) particulas[i] = nova(false);
      const alpha = Math.min(1, p.y / h + 0.15);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.brasa
        ? `rgba(240, 138, 62, ${alpha * 0.9})`
        : `rgba(191, 181, 166, ${alpha * 0.35})`;
      ctx.fill();
    });
    requestAnimationFrame(desenhar);
  };
  ajustar();
  window.addEventListener("resize", ajustar);
  desenhar();
}

// =========================================================
// v2.2 · Gás tóxico, status do Discord, barra de leitura,
// voltar ao topo e menu que acompanha a rolagem
// =========================================================
const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Gás tóxico: nuvens esverdeadas que se arrastam devagar pela tela
function criarGas(canvas, opcoes) {
  if (!canvas || semMovimento) return;
  const ctx = canvas.getContext("2d");
  const escala = 0.25; // desenha em baixa resolução: fica mais suave e mais leve
  const cores = opcoes.cores;
  let w, h, nuvens = [];

  // Uma "baforada" pronta, reaproveitada em todas as nuvens
  const puff = document.createElement("canvas");
  puff.width = puff.height = 128;
  const p = puff.getContext("2d");
  const g = p.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  p.fillStyle = g; p.fillRect(0, 0, 128, 128);
  const tintas = cores.map(cor => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d");
    x.drawImage(puff, 0, 0); x.globalCompositeOperation = "source-in";
    x.fillStyle = cor; x.fillRect(0, 0, 128, 128);
    return c;
  });

  const nova = (inicio) => {
    const r = (Math.random() * 0.5 + 0.35) * Math.max(w, h) * opcoes.tamanho;
    return {
      x: inicio ? Math.random() * w : -r,
      y: h * (opcoes.topo + Math.random() * (1 - opcoes.topo)),
      r, vx: (Math.random() * 0.12 + 0.04) * opcoes.velocidade,
      vy: (Math.random() - 0.5) * 0.03,
      a: Math.random() * 0.5 + 0.35, fase: Math.random() * Math.PI * 2,
      t: tintas[Math.floor(Math.random() * tintas.length)],
    };
  };
  const ajustar = () => {
    w = canvas.width = Math.max(1, Math.round(canvas.offsetWidth * escala));
    h = canvas.height = Math.max(1, Math.round(canvas.offsetHeight * escala));
    nuvens = Array.from({ length: opcoes.quantidade }, () => nova(true));
  };
  let visivel = true;
  const desenhar = () => {
    if (visivel) {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nuvens.length; i++) {
        const n = nuvens[i];
        n.x += n.vx; n.y += n.vy; n.fase += 0.004;
        if (n.x - n.r > w) nuvens[i] = nova(false);
        ctx.globalAlpha = n.a * (0.75 + Math.sin(n.fase) * 0.25) * opcoes.intensidade;
        ctx.drawImage(n.t, n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
      }
    }
    requestAnimationFrame(desenhar);
  };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(e => { visivel = e[0].isIntersecting; }).observe(canvas);
  }
  ajustar();
  window.addEventListener("resize", ajustar);
  desenhar();
}
// Névoa leve no site todo, concentrada na parte de baixo da tela
criarGas(document.querySelector(".gas"), {
  cores: ["rgb(120,150,50)", "rgb(150,170,60)", "rgb(90,120,40)"],
  quantidade: 10, tamanho: 0.55, topo: 0.4, velocidade: 1, intensidade: 0.42,
});
// Gás mais denso no pé da capa
criarGas(document.querySelector(".gas-capa"), {
  cores: ["rgb(130,160,55)", "rgb(170,185,70)", "rgb(100,130,45)"],
  quantidade: 12, tamanho: 0.45, topo: 0.35, velocidade: 1.4, intensidade: 0.55,
});

// Membros online no Discord (pelo convite público)
const campoDiscord = document.querySelector("[data-discord-online]");
if (campoDiscord) {
  fetch("https://discord.com/api/v9/invites/vVRFBYRUVg?with_counts=true")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => {
      if (d.approximate_presence_count) {
        campoDiscord.textContent = d.approximate_presence_count.toLocaleString("pt-BR") + " online";
      }
    })
    .catch(() => {});
}

// Barra de leitura e botão de voltar ao topo
const barra = document.querySelector(".progresso");
const voltar = document.querySelector(".topo-voltar");
const aoRolar = () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (barra) barra.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + "%";
  if (voltar) voltar.classList.toggle("visivel", window.scrollY > 700);
};
window.addEventListener("scroll", aoRolar, { passive: true });
aoRolar();
if (voltar) voltar.addEventListener("click", e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });

// Menu marca a seção que está na tela (página inicial)
const linksSecao = [...document.querySelectorAll('.menu a[href^="#"], .menu a[href^="index.html#"]')]
  .filter(a => document.getElementById(a.getAttribute("href").split("#")[1]));
const linkInicio = document.querySelector('.menu a[href="index.html"]');
if (linksSecao.length && "IntersectionObserver" in window) {
  const marcar = (link) => {
    document.querySelectorAll(".menu a.ativo").forEach(a => a.classList.remove("ativo"));
    (link || linkInicio)?.classList.add("ativo");
  };
  const obsMenu = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (e.isIntersecting) marcar(linksSecao.find(a => a.getAttribute("href").endsWith("#" + e.target.id)));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  linksSecao.forEach(a => obsMenu.observe(document.getElementById(a.getAttribute("href").split("#")[1])));
  const capa = document.querySelector(".capa");
  if (capa) new IntersectionObserver(e => { if (e[0].isIntersecting) marcar(null); }, { rootMargin: "-45% 0px -50% 0px" }).observe(capa);
}

// Índice lateral (regras e lore) marca o item que está sendo lido
const linksIndice = [...document.querySelectorAll(".indice a")];
if (linksIndice.length && "IntersectionObserver" in window) {
  const obsIndice = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      linksIndice.forEach(a => a.classList.toggle("atual", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-20% 0px -70% 0px" });
  linksIndice.forEach(a => { const alvo = document.querySelector(a.getAttribute("href")); if (alvo) obsIndice.observe(alvo); });
}
