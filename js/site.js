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
