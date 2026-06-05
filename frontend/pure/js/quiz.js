(function () {
  const btn = document.getElementById('generateBtn');
  const result = document.getElementById('quizResult');
  const loading = document.getElementById('quizLoading');
  if (!btn) return;

  btn.addEventListener('click', () => {
    loading.hidden = false;
    result.hidden = true;
    btn.disabled = true;
    setTimeout(() => {
      loading.hidden = true;
      result.hidden = false;
      btn.disabled = false;
    }, 1800);
  });
})();
