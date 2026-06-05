/* Adtage — umumiy JS */
(function () {
  'use strict';

  const PAGE = document.body.dataset.page;

  /* Active tab */
  document.querySelectorAll('.tab-item').forEach((tab) => {
    if (tab.dataset.page === PAGE) tab.classList.add('active');
  });

  /* Toggles */
  document.querySelectorAll('.toggle').forEach((el) => {
    el.addEventListener('click', () => el.classList.toggle('on'));
  });

  /* Chips */
  document.querySelectorAll('.chip-group').forEach((group) => {
    group.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        group.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  });

  /* Drop zone */
  const drop = document.getElementById('dropZone');
  if (drop) {
    ['dragenter', 'dragover'].forEach((e) => {
      drop.addEventListener(e, (ev) => {
        ev.preventDefault();
        drop.classList.add('drag');
      });
    });
    ['dragleave', 'drop'].forEach((e) => {
      drop.addEventListener(e, () => drop.classList.remove('drag'));
    });
  }

  window.Adtage = window.Adtage || {};
})();
