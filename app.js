(() => {
  const current = document.currentScript;
  const base = current?.src || `${window.location.origin}${window.location.pathname}`;
  const href = new URL("scale.css?v=7", base).href;
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
})();

const buttons = document.querySelectorAll("[data-edition-button]");
const views = document.querySelectorAll("[data-edition-view]");

function showEdition(name) {
  buttons.forEach((button) => button.classList.toggle("active", button.dataset.editionButton === name));
  views.forEach((view) => { view.hidden = view.datasetEditionView !== name; });
  const next = document.querySelector("[data-next-update]");
  if (next) next.textContent = name === "morning" ? "下一次更新 · 17:00" : "下一次更新 · 明日 08:00";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

buttons.forEach((button) => button.addEventListener("click", () => showEdition(button.dataset.editionButton)));

document.querySelectorAll("[data-bookmark]").forEach((button) => {
  const key = `daily-insight:${button.dataset.bookmark}`;
  const render = () => {
    const saved = localStorage.getItem(key) === "1";
    button.classList.toggle("saved", saved);
    button.textContent = saved ? "已收藏" : "＋ 收藏";
  };
  render();
  button.addEventListener("click", () => {
    localStorage.setItem(key, localStorage.getItem(key) === "1" ? "0" : "1");
    render();
  });
});

const overlay = document.querySelector(".overlay");
document.querySelector(".archive-button")?.addEventListener("click", () => overlay.hidden = false);
document.querySelector(".close")?.addEventListener("click", () => overlay.hidden = true);
overlay?.addEventListener("click", (event) => { if (event.target === overlay) overlay.hidden = true; });
