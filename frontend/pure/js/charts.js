/* Oddiy canvas grafiklar */
function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.rect(x, y, w, h);
}

function drawBarChart(canvasId, labels, values, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);
  const w = rect.width;
  const h = rect.height;
  const pad = { t: 16, r: 12, b: 28, l: 12 };
  const max = Math.max(...values, 1);
  const barW = ((w - pad.l - pad.r) / values.length) * 0.55;
  const gap = ((w - pad.l - pad.r) / values.length) * 0.45;
  ctx.clearRect(0, 0, w, h);
  values.forEach((v, i) => {
    const bh = ((h - pad.t - pad.b) * v) / max;
    const x = pad.l + i * (barW + gap) + gap / 2;
    const y = h - pad.b - bh;
    const grad = ctx.createLinearGradient(0, y, 0, h - pad.b);
    grad.addColorStop(0, color || '#0071e3');
    grad.addColorStop(1, 'rgba(0,113,227,0.2)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    roundRect(ctx, x, y, barW, bh, 6);
    ctx.fill();
    ctx.fillStyle = '#86868b';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, h - 8);
  });
}

function drawLineChart(canvasId, labels, values) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);
  const w = rect.width;
  const h = rect.height;
  const pad = { t: 20, r: 12, b: 28, l: 12 };
  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 5;
  const range = max - min || 1;
  const step = (w - pad.l - pad.r) / (values.length - 1);
  ctx.clearRect(0, 0, w, h);
  const points = values.map((v, i) => ({
    x: pad.l + i * step,
    y: pad.t + (h - pad.t - pad.b) * (1 - (v - min) / range),
  }));
  const grad = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
  grad.addColorStop(0, 'rgba(0,113,227,0.25)');
  grad.addColorStop(1, 'rgba(0,113,227,0)');
  ctx.beginPath();
  ctx.moveTo(points[0].x, h - pad.b);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, h - pad.b);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.strokeStyle = '#0071e3';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();
  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#0071e3';
    ctx.fill();
  });
  ctx.fillStyle = '#86868b';
  ctx.font = '11px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((l, i) => ctx.fillText(l, pad.l + i * step, h - 8));
}

window.addEventListener('resize', () => {
  if (window.__chartData) {
    const d = window.__chartData;
    if (d.bar) drawBarChart(d.bar.id, d.bar.labels, d.bar.values, d.bar.color);
    if (d.line) drawLineChart(d.line.id, d.line.labels, d.line.values);
  }
});
