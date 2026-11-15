// Velha Guarda · página da Temporada 2

// Contagem regressiva para a live de demonstração
document.querySelectorAll(".contagem[data-alvo]").forEach(caixa => {
  const alvo = new Date(caixa.dataset.alvo).getTime();
  const campos = { d: caixa.querySelector('[data-c="d"]'), h: caixa.querySelector('[data-c="h"]'), m: caixa.querySelector('[data-c="m"]'), s: caixa.querySelector('[data-c="s"]') };
  const numeros = caixa.querySelector(".contagem-numeros");
  const fim = caixa.querySelector(".contagem-fim");
  const dois = n => String(n).padStart(2, "0");
  const atualizar = () => {
    const falta = alvo - Date.now();
    if (falta <= 0) {
      numeros.hidden = true; fim.hidden = false;
      caixa.querySelector("small").hidden = true;
      clearInterval(timer); return;
    }
    const seg = Math.floor(falta / 1000);
    campos.d.textContent = dois(Math.floor(seg / 86400));
    campos.h.textContent = dois(Math.floor(seg % 86400 / 3600));
    campos.m.textContent = dois(Math.floor(seg % 3600 / 60));
    campos.s.textContent = dois(seg % 60);
  };
  const timer = setInterval(atualizar, 1000);
  atualizar();
});

// Vídeos do Instagram: o script oficial só carrega quando o vídeo se aproxima da tela
const videos = document.querySelectorAll(".instagram-media");
if (videos.length) {
  const carregar = () => {
    if (document.getElementById("ig-embed")) return;
    const s = document.createElement("script");
    s.id = "ig-embed"; s.async = true; s.src = "https://www.instagram.com/embed.js";
    s.onload = () => window.instgrm && window.instgrm.Embeds.process();
    document.body.appendChild(s);
  };
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(e => { if (e.some(x => x.isIntersecting)) { carregar(); obs.disconnect(); } }, { rootMargin: "400px" });
    videos.forEach(v => obs.observe(v));
  } else {
    carregar();
  }
}
