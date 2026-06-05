(function () {
  const area = document.getElementById('chatArea');
  const input = document.getElementById('chatInput');
  const form = document.getElementById('chatForm');
  if (!area || !form) return;

  const replies = [
    'Bu mavzu DTM imtihonida muhim. Asosiy formulalar va misollar bilan yordam beraman.',
    '30 kunlik reja tayyor! 1-hafta: algebra, 2-hafta: geometriya, 3-hafta: testlar.',
    "Savolingiz bo'yicha qo'shimcha tushuntirish tayyorladim. Davom etamizmi?",
  ];

  function addBubble(text, role) {
    const div = document.createElement('div');
    div.className = 'bubble ' + (role === 'user' ? 'bubble-user' : 'bubble-ai');
    div.textContent = text;
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addBubble(text, 'user');
    input.value = '';
    setTimeout(() => {
      addBubble(replies[Math.floor(Math.random() * replies.length)], 'ai');
    }, 700);
  });

  document.querySelectorAll('[data-suggest]').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.suggest;
      input.focus();
    });
  });
})();
