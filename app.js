// Bloop · página de descarga.
// Lee latest.json (lo publica publish.sh) para mostrar y descargar siempre la versión más reciente.
// Si algo falla, el botón ya apunta a bloop-latest.apk, que también es siempre la última.

const RELEASES = "https://zmwipaxignckzkjwbjhj.supabase.co/storage/v1/object/public/releases";
const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (id) => document.getElementById(id);
const btn = $("descarga");
let version = null;

// ------------------------------------------------------------ última versión
// Con mala señal la primera petición a veces se corta: se reintenta hasta 4 veces.
async function fetchLatest() {
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(`${RELEASES}/latest.json?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch (_) { /* reintenta */ }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  throw new Error("sin latest.json");
}

async function loadLatest() {
  try {
    const latest = await fetchLatest();
    version = latest.versionName;
    const file = `Bloop-${version}.apk`;
    btn.href = `${latest.apkUrl}?download=${encodeURIComponent(file)}`;
    btn.setAttribute("download", file);
    $("archivo").textContent = file;
    $("nuevo-version").textContent = `la ${version}`;
    if (latest.notes) $("notas").textContent = latest.notes.endsWith(".") ? latest.notes : `${latest.notes}.`;
    if (latest.sha256) {
      const sha = $("sha");
      sha.textContent = `Huella SHA-256 de la versión ${version}: ${latest.sha256}`;
      sha.hidden = false;
    }
    let size = "";
    try {
      const head = await fetch(latest.apkUrl, { method: "HEAD" });
      const bytes = Number(head.headers.get("content-length"));
      if (bytes) size = `, ${Math.round(bytes / 1e6)} MB`;
    } catch (_) { /* el tamaño es opcional */ }
    $("version").innerHTML = `Versión <b>${version}</b> para Android 8 o superior${size}.`;
  } catch (_) {
    // sin conexión al servidor: se queda el enlace fijo a la última versión
  }
}
loadLatest();

// ------------------------------------------------------------ según el dispositivo
const ua = navigator.userAgent;
const android = /Android/i.test(ua);
const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
if (ios) $("ios").hidden = false;
else if (!android) $("qr").hidden = false;

// ------------------------------------------------------------ la criatura
// Respira: el cuerpo es la misma gota de Blob.kt (un círculo con armónicos de seno).
const bodies = document.querySelectorAll(".creature .body, .creature .body-light");
function blobPath(cx, cy, r, t, wobble, seed) {
  let d = "";
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const rr = r * (1 + wobble * (0.07 * Math.sin(3 * a + t + seed) + 0.05 * Math.sin(5 * a - 2 * t + 2 * seed) + 0.03 * Math.cos(2 * a - t + 3 * seed)));
    d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }
  return d + "Z";
}
let excite = 0;
function breathe(now) {
  const t = (now / 7000) * Math.PI * 2;
  const d = blobPath(200, 200, 140, t, 1 + excite, 0.7);
  bodies.forEach((p) => p.setAttribute("d", d));
  excite *= 0.94;
  requestAnimationFrame(breathe);
}
if (!quiet) requestAnimationFrame(breathe);
else bodies.forEach((p) => p.setAttribute("d", blobPath(200, 200, 140, 0, 1, 0.7)));

// Te mira: los ojos siguen el puntero.
const eyes = document.querySelector(".creature .eyes");
window.addEventListener("pointermove", (e) => {
  if (quiet) return;
  const box = btn.getBoundingClientRect();
  const dx = (e.clientX - (box.left + box.width / 2)) / window.innerWidth;
  const dy = (e.clientY - (box.top + box.height / 2)) / window.innerHeight;
  eyes.style.transform = `translate(${Math.max(-1, Math.min(1, dx * 2)) * 14}px, ${Math.max(-1, Math.min(1, dy * 2)) * 10}px)`;
}, { passive: true });

// Parpadea a ratos, como algo vivo.
function blink() {
  btn.classList.add("blink");
  setTimeout(() => btn.classList.remove("blink"), 120);
  if (Math.random() < 0.25) setTimeout(() => { btn.classList.add("blink"); setTimeout(() => btn.classList.remove("blink"), 110); }, 240);
  setTimeout(blink, 2200 + Math.random() * 3600);
}
if (!quiet) setTimeout(blink, 1800);

// ------------------------------------------------------------ al tocarla
let audio;
function bloopSound() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator();
    const g = audio.createGain();
    const t = audio.currentTime;
    o.type = "sine";
    o.frequency.setValueAtTime(320, t);
    o.frequency.exponentialRampToValueAtTime(880, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + 0.26);
  } catch (_) { /* sin audio, sin problema */ }
}

btn.addEventListener("click", () => {
  btn.classList.remove("squish");
  void btn.offsetWidth; // reinicia la animación si tocan dos veces
  btn.classList.add("squish");
  excite = 0.8;
  bloopSound();
  const aviso = $("aviso");
  aviso.textContent = android
    ? `Descargando Bloop${version ? " " + version : ""}. Cuando termine, ábrelo desde tus notificaciones para instalarlo.`
    : ios
      ? "Este archivo es para Android. En iPhone no se puede instalar."
      : `Descargando Bloop${version ? " " + version : ""}. Pásalo a tu celular Android, o mejor escanea el código QR con el celular.`;
  aviso.hidden = false;
});

// ------------------------------------------------------------ fondo vivo
// Gotas grandes detrás de cada sección: respiran con la misma fórmula y flotan un poco al hacer scroll.
const blobs = [...document.querySelectorAll(".bg-blob")].map((svg, i) => {
  const color = getComputedStyle(svg).getPropertyValue("--c").trim() || "#FF5FA2";
  const id = `bgb${i}`;
  svg.insertAdjacentHTML(
    "afterbegin",
    `<defs><radialGradient id="${id}" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="${color}" stop-opacity=".42"/><stop offset=".55" stop-color="${color}" stop-opacity=".16"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>`,
  );
  const path = svg.querySelector("path");
  path.setAttribute("fill", `url(#${id})`);
  path.setAttribute("d", blobPath(200, 200, 190, i, 1.2, i * 1.7));
  return { svg, path, seed: i * 1.7, period: 9000 + i * 1300, visible: false };
});
const seen = new IntersectionObserver((entries) => {
  entries.forEach((e) => { const b = blobs.find((x) => x.svg === e.target); if (b) b.visible = e.isIntersecting; });
}, { rootMargin: "200px" });
blobs.forEach((b) => seen.observe(b.svg));

// Burbujas que suben, como en el Aurora de la app.
const canvas = $("burbujas");
const ctx = canvas.getContext("2d");
const BUBBLE_COLORS = ["255,95,162", "255,196,220", "185,140,255", "255,160,122"];
let bubbles = [];
function sizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.round(Math.min(46, Math.max(16, (innerWidth * innerHeight) / 32000)));
  bubbles = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: 3 + Math.random() ** 2 * 26,
    speed: 8 + Math.random() * 26,
    sway: Math.random() * Math.PI * 2,
    color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    alpha: 0.08 + Math.random() * 0.2,
  }));
}
sizeCanvas();
addEventListener("resize", sizeCanvas);

function drawBubbles(dt, now) {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const b of bubbles) {
    b.y -= b.speed * dt;
    if (b.y < -b.r * 2) { b.y = innerHeight + b.r * 2; b.x = Math.random() * innerWidth; }
    const x = b.x + Math.sin(now / 2400 + b.sway) * 16;
    const g = ctx.createRadialGradient(x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.1, x, b.y, b.r);
    g.addColorStop(0, `rgba(255,255,255,${b.alpha * 1.4})`);
    g.addColorStop(0.35, `rgba(${b.color},${b.alpha})`);
    g.addColorStop(1, `rgba(${b.color},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

let last = performance.now();
function backgroundLoop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  drawBubbles(dt, now);
  for (const b of blobs) {
    if (!b.visible) continue;
    b.path.setAttribute("d", blobPath(200, 200, 170, (now / b.period) * Math.PI * 2, 1.3, b.seed));
    const r = b.svg.parentElement.getBoundingClientRect();
    b.svg.style.transform = `translateY(${(r.top + r.height / 2 - innerHeight / 2) * -0.12}px) rotate(${now / 900 + b.seed * 40}deg)`;
  }
  requestAnimationFrame(backgroundLoop);
}
if (!quiet) requestAnimationFrame(backgroundLoop);
else drawBubbles(0, 0);
