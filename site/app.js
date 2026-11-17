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
