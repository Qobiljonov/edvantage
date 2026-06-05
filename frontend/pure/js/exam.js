(function () {
  const start = document.getElementById('examStart');
  const intro = document.getElementById('examIntro');
  const main = document.getElementById('examMain');
  const finish = document.getElementById('examFinish');
  const timerEl = document.getElementById('examTimer');
  const qText = document.getElementById('questionText');
  const optionsEl = document.getElementById('options');
  const prevBtn = document.getElementById('prevQ');
  const nextBtn = document.getElementById('nextQ');
  const dotsEl = document.getElementById('questionDots');

  const questions = [
    { text: '2x + 5 = 15 tenglamaning yechimi:', options: ['x = 5', 'x = 10', 'x = 7', 'x = 3'] },
    { text: '√144 ning qiymati:', options: ['10', '11', '12', '14'] },
    { text: 'sin(90°) qiymati:', options: ['0', '0.5', '1', '−1'] },
  ];

  let current = 0;
  let answers = [];
  let time = 90 * 60;
  let interval;

  if (!start) return;

  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ':' + String(sec).padStart(2, '0');
  }

  const qNumEl = document.getElementById('qNum');
  const progressEl = document.querySelector('#examMain .progress-fill');

  function render() {
    const q = questions[current];
    qText.textContent = q.text;
    if (qNumEl) qNumEl.textContent = current + 1;
    if (progressEl) progressEl.style.width = ((current + 1) / questions.length) * 100 + '%';
    optionsEl.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn' + (answers[current] === i ? ' selected' : '');
      btn.innerHTML =
        '<span class="option-letter">' +
        String.fromCharCode(65 + i) +
        '</span><span>' +
        opt +
        '</span>';
      btn.addEventListener('click', () => {
        answers[current] = i;
        render();
        renderDots();
      });
      optionsEl.appendChild(btn);
    });
    prevBtn.disabled = current === 0;
    nextBtn.textContent = current === questions.length - 1 ? 'Yakunlash' : 'Keyingi';
    renderDots();
  }

  function renderDots() {
    dotsEl.innerHTML = '';
    questions.forEach((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className =
        'dot' + (answers[i] != null ? ' answered' : '') + (i === current ? ' current' : '');
      d.textContent = i + 1;
      d.addEventListener('click', () => {
        current = i;
        render();
      });
      dotsEl.appendChild(d);
    });
  }

  start.addEventListener('click', () => {
    intro.hidden = true;
    main.hidden = false;
    interval = setInterval(() => {
      time--;
      timerEl.textContent = fmt(time);
      if (time < 300) timerEl.classList.add('warning');
      if (time <= 0) clearInterval(interval);
    }, 1000);
    render();
  });

  nextBtn.addEventListener('click', () => {
    if (current < questions.length - 1) {
      current++;
      render();
    } else {
      main.hidden = true;
      finish.hidden = false;
      clearInterval(interval);
    }
  });

  prevBtn.addEventListener('click', () => {
    if (current > 0) {
      current--;
      render();
    }
  });
})();
