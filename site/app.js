(() => {
  const questions = window.QUESTIONS;
  const storageKey = 'aventura-matematica-progreso-v1';
  const $ = id => document.getElementById(id);
  let solved = {};
  try { solved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (_) { /* La práctica también funciona sin almacenamiento. */ }
  let selectedTopic = 'Todos';
  let index = 0;
  let wrongChoice = null;

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(solved)); } catch (_) { /* Algunos navegadores bloquean el almacenamiento. */ }
  }
  function currentList() {
    return selectedTopic === 'Todos' ? questions : questions.filter(q => q.topic === selectedTopic);
  }
  function updateProgress() {
    const count = questions.filter(q => solved[q.id] === true).length;
    const percentage = Math.round(count / questions.length * 100);
    $('progress-count').textContent = `${count} / ${questions.length}`;
    $('progress-bar').style.width = `${percentage}%`;
    document.querySelector('.progress-track').setAttribute('aria-valuenow', percentage);
  }
  function renderTopics() {
    const topics = ['Todos', ...new Set(questions.map(q => q.topic))];
    $('topics').replaceChildren();
    topics.forEach(topic => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'topic';
      button.textContent = topic;
      button.setAttribute('aria-pressed', String(topic === selectedTopic));
      button.addEventListener('click', () => { selectedTopic = topic; index = 0; wrongChoice = null; render(); });
      $('topics').append(button);
    });
  }
  function render() {
    const list = currentList();
    const q = list[index];
    const isSolved = solved[q.id] === true;
    renderTopics();
    updateProgress();
    $('category').textContent = q.topic;
    $('position').textContent = `Pregunta ${index + 1} de ${list.length}`;
    $('question').textContent = q.question;
    const visual = $('visual');
    visual.replaceChildren();
    if (q.id === 25 || q.id === 26) {
      const count = q.id === 25 ? 8 : 4;
      const filled = q.id === 25 ? 3 : 0;
      const bar = document.createElement('div');
      bar.className = 'fraction-bar';
      bar.setAttribute('role', 'img');
      bar.setAttribute('aria-label', q.id === 25 ? 'Barra de 8 partes iguales, 3 coloreadas' : 'Barra de 4 partes iguales sin colorear');
      for (let i = 0; i < count; i++) {
        const part = document.createElement('span');
        if (i < filled) part.className = 'filled';
        bar.append(part);
      }
      visual.append(bar);
    } else if (q.id === 35) {
      const picture = document.createElement('p');
      picture.className = 'pictogram';
      picture.setAttribute('aria-label', 'Cuatro estrellas; cada estrella representa dos libros');
      picture.textContent = '★  ★  ★  ★';
      visual.append(picture);
    } else if (q.id === 38) {
      const chart = document.createElement('div');
      chart.className = 'bar-chart';
      chart.setAttribute('role', 'img');
      chart.setAttribute('aria-label', 'Barra que llega a cinco votos');
      chart.innerHTML = '<span>5 votos</span><div></div><small>Votos</small>';
      visual.append(chart);
    } else if (q.id >= 43 && q.id <= 45) {
      const endpoints = { 43: '151 49', 44: '95 25', 45: '39 49' };
      const degrees = { 43: 45, 44: 90, 45: 135 };
      const diagram = document.createElement('div');
      diagram.innerHTML = `<svg viewBox="0 0 200 120" width="200" height="120" role="img" aria-label="Ángulo de ${degrees[q.id]} grados"><path d="M 175 105 L 95 105 L ${endpoints[q.id]}" fill="none" stroke="#7452de" stroke-width="4" stroke-linecap="round"/><circle cx="95" cy="105" r="4" fill="#20345a"/></svg>`;
      visual.append(diagram);
    } else if (q.id === 46 || q.id === 47) {
      const diagram = document.createElement('div');
      if (q.id === 46) {
        diagram.innerHTML = '<svg viewBox="0 0 260 100" width="260" height="100" role="img" aria-label="Un triángulo se desliza hacia la derecha sin girar"><path d="M 20 80 L 55 20 L 85 80 Z" fill="#cfc3fa" stroke="#7452de" stroke-width="3"/><path d="M 100 50 H 150 M 140 42 L 150 50 L 140 58" fill="none" stroke="#64718a" stroke-width="3"/><path d="M 170 80 L 205 20 L 235 80 Z" fill="#bceee1" stroke="#34866e" stroke-width="3"/></svg>';
      } else {
        diagram.innerHTML = '<svg viewBox="0 0 230 180" width="230" height="180" role="img" aria-label="Una figura gira un cuarto de vuelta en torno al punto marcado"><path d="M 70 85 h60 v-15 h-45 v-45 h-15 Z" fill="#cfc3fa" stroke="#7452de" stroke-width="3"/><path d="M 70 85 h60 v-15 h-45 v-45 h-15 Z" transform="rotate(90 70 85)" fill="#bceee1" stroke="#34866e" stroke-width="3"/><circle cx="70" cy="85" r="5" fill="#20345a"/></svg>';
      }
      visual.append(diagram);
    } else if (q.id >= 48 && q.id <= 52) {
      const hint = document.createElement('p');
      hint.textContent = q.id <= 50 ? 'Tabla de longitud: km → hm → dam → m → dm → cm → mm' : q.id === 51 ? 'Tabla de masa: kg → hg → dag → g → dg → cg → mg' : 'Tabla de capacidad: kL → hL → daL → L → dL → cL → mL';
      hint.style.color = '#6242ce';
      visual.append(hint);
    }
    $('options').replaceChildren();
    q.options.forEach((option, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option';
      button.textContent = option;
      if (isSolved && i === q.answer) button.classList.add('correct');
      if (!isSolved && i === wrongChoice) button.classList.add('wrong');
      button.disabled = isSolved;
      button.addEventListener('click', () => {
        if (i === q.answer) { solved[q.id] = true; wrongChoice = null; save(); }
        else wrongChoice = i;
        render();
        $('feedback').focus();
      });
      $('options').append(button);
    });
    const feedback = $('feedback');
    feedback.tabIndex = -1;
    feedback.className = 'feedback' + (isSolved ? ' good' : wrongChoice !== null ? ' retry' : '');
    feedback.textContent = isSolved ? `¡Muy bien! ${q.explanation}` : wrongChoice !== null ? 'Casi. Revisa con calma y vuelve a intentarlo.' : '';
    $('previous').disabled = index === 0;
    $('next').disabled = index === list.length - 1;
  }
  $('previous').addEventListener('click', () => { index--; wrongChoice = null; render(); });
  $('next').addEventListener('click', () => { index++; wrongChoice = null; render(); });
  $('reset').addEventListener('click', () => {
    if (!confirm('¿Quieres borrar tu progreso y empezar de nuevo?')) return;
    solved = {}; save(); index = 0; wrongChoice = null; render();
  });
  render();
})();
