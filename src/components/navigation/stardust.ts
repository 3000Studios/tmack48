/**
 * Hamburger splash-menu tap effect (Boss order 2026-11-07): the chosen
 * tab flashes gold, fizzles out into stardust, and only then does the
 * page change. Imperative DOM so every splash link (NavIdleLink tabs,
 * editor-added tabs, Admin, Support) gets the identical treatment.
 */
export function stardustBurst(el: HTMLElement, done: () => void): void {
  if (el.dataset.bursting === "1") return;
  el.dataset.bursting = "1";
  el.classList.add("nav-bursting");

  const rect = el.getBoundingClientRect();
  const bits = 18;
  for (let i = 0; i < bits; i++) {
    const bit = document.createElement("span");
    bit.className = "stardust-bit";
    const fromLeft = 8 + Math.random() * 84;
    const fromTop = 15 + Math.random() * 70;
    const dx = (Math.random() - 0.5) * rect.width * 0.9;
    const dy = -20 - Math.random() * 70 + (Math.random() - 0.5) * 24;
    bit.style.left = `${fromLeft}%`;
    bit.style.top = `${fromTop}%`;
    bit.style.setProperty("--dx", `${dx.toFixed(0)}px`);
    bit.style.setProperty("--dy", `${dy.toFixed(0)}px`);
    const size = 3 + Math.random() * 4;
    bit.style.width = `${size.toFixed(1)}px`;
    bit.style.height = `${size.toFixed(1)}px`;
    bit.style.animationDelay = `${(Math.random() * 0.12).toFixed(2)}s`;
    el.appendChild(bit);
    window.setTimeout(() => bit.remove(), 900);
  }

  window.setTimeout(() => {
    el.classList.remove("nav-bursting");
    delete el.dataset.bursting;
    done();
  }, 680);
}
