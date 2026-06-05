(function () {
  'use strict';

  const steps = document.querySelectorAll('.ke-step');
  const connectors = document.querySelectorAll('.ke-connector');
  const metrics = document.querySelectorAll('.ke-metric');
  const responseEl = document.getElementById('keResponse');
  const btnPlay = document.getElementById('kePlay');
  const btnReset = document.getElementById('keReset');

  const counters = {
    books: { el: document.getElementById('metricBooks'), target: 1247, suffix: '' },
    chunks: {
      el: document.getElementById('metricChunks'),
      target: 2400000,
      suffix: '',
      format: true,
    },
    responses: { el: document.getElementById('metricResponses'), target: 89420, suffix: '' },
    speed: { el: document.getElementById('metricSpeed'), target: 48, suffix: ' ms' },
  };

  const demoText =
    "DTM matematika bo'yicha savolingizga asoslanib: kvadrat tenglamalar mavzusi 3-bobda batafsil yoritilgan. Asosiy formula discriminant orqali yechiladi…";

  let playing = false;
  let stepIndex = 0;
  let intervalId;

  function formatNum(n, format) {
    if (format && n >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',') + 'M';
    if (format && n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toLocaleString('uz-UZ');
  }

  function animateCounter(key, duration) {
    const c = counters[key];
    if (!c.el) return;
    const start = 0;
    const startTime = performance.now();
    function tick(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(start + (c.target - start) * ease);
      c.el.textContent = formatNum(val, c.format) + (c.suffix || '');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    c.el.closest('.ke-metric')?.classList.add('live');
  }

  function setStepStatus(step, state) {
    const status = step.querySelector('.ke-step-status');
    if (!status) return;
    const labels = {
      wait: 'Kutilmoqda',
      active: 'Bajarilmoqda…',
      done: 'Tayyor',
    };
    status.textContent = labels[state] || labels.wait;
  }

  function setSteps(upTo) {
    steps.forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i < upTo) {
        s.classList.add('done');
        setStepStatus(s, 'done');
      } else if (i === upTo) {
        s.classList.add('active');
        setStepStatus(s, 'active');
      } else {
        setStepStatus(s, 'wait');
      }
    });
    connectors.forEach((c, i) => {
      c.classList.toggle('lit', i < upTo);
    });
  }

  function typeResponse() {
    if (!responseEl) return;
    responseEl.textContent = '';
    responseEl.classList.add('typing');
    let i = 0;
    const typeInterval = setInterval(() => {
      responseEl.textContent = demoText.slice(0, i);
      i += 2;
      if (i >= demoText.length) {
        clearInterval(typeInterval);
        responseEl.classList.remove('typing');
        playing = false;
        if (btnPlay) btnPlay.disabled = false;
      }
    }, 24);
  }

  function runPipeline() {
    if (playing) return;
    playing = true;
    if (btnPlay) btnPlay.disabled = true;
    stepIndex = 0;
    setSteps(0);

    Object.keys(counters).forEach((k) => animateCounter(k, 2200));

    intervalId = setInterval(() => {
      setSteps(stepIndex);
      stepIndex++;
      if (stepIndex >= steps.length) {
        clearInterval(intervalId);
        setSteps(steps.length - 1);
        steps[steps.length - 1]?.classList.add('done');
        typeResponse();
      }
    }, 900);
  }

  function reset() {
    clearInterval(intervalId);
    playing = false;
    stepIndex = 0;
    setSteps(-1);
    steps.forEach((s) => s.classList.remove('active', 'done'));
    connectors.forEach((c) => c.classList.remove('lit'));
    metrics.forEach((m) => m.classList.remove('live'));
    if (responseEl) {
      responseEl.textContent = "Javob shu yerda paydo bo'ladi…";
      responseEl.classList.remove('typing');
    }
    if (counters.books.el) counters.books.el.textContent = '—';
    if (counters.chunks.el) counters.chunks.el.textContent = '—';
    if (counters.responses.el) counters.responses.el.textContent = '—';
    if (counters.speed.el) counters.speed.el.textContent = '—';
    if (btnPlay) btnPlay.disabled = false;
  }

  btnPlay?.addEventListener('click', runPipeline);
  btnReset?.addEventListener('click', reset);

  /* Initial display */
  reset();
  setTimeout(runPipeline, 800);
})();
