// Pruebas básicas sin dependencias externas: node scripts/test_site.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor() { this.children = []; this.attributes = {}; this.style = {}; this.listeners = {}; this.classList = { add: () => {} }; }
  setAttribute(name, value) { this.attributes[name] = value; }
  append(child) { this.children.push(child); }
  replaceChildren() { this.children = []; }
  addEventListener(event, callback) { this.listeners[event] = callback; }
  click() { if (!this.disabled && this.listeners.click) this.listeners.click(); }
  focus() {}
}
const elements = {};
const track = new Element();
const store = {};
const context = {
  window: {},
  document: {
    getElementById: id => elements[id] ||= new Element(),
    createElement: () => new Element(),
    querySelector: () => track
  },
  localStorage: {
    getItem: key => store[key],
    setItem: (key, value) => { store[key] = value; }
  },
  confirm: () => true
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('site/questions.js', 'utf8'), context);
const questions = context.window.QUESTIONS;
assert.equal(questions.length, 56);
assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
questions.forEach(q => {
  assert.equal(q.options.length, 4, `Opciones de la pregunta ${q.id}`);
  assert.equal(new Set(q.options).size, 4, `Opciones duplicadas en ${q.id}`);
  assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
  assert.ok(q.question && q.explanation && q.topic);
});
vm.runInContext(fs.readFileSync('site/app.js', 'utf8'), context);
assert.equal(elements['progress-count'].textContent, '0 / 56');
elements.options.children[1].click();
assert.match(elements.feedback.textContent, /vuelve a intentarlo/);
assert.equal(elements['progress-count'].textContent, '0 / 56');
elements.options.children[0].click();
assert.match(elements.feedback.textContent, /Muy bien/);
assert.equal(elements['progress-count'].textContent, '1 / 56');
assert.equal(JSON.parse(store['aventura-matematica-progreso-v1'])['1'], true);
elements.next.click();
assert.match(elements.question.textContent, /8.002/);
elements.topics.children.find(button => button.textContent === 'Fracciones').click();
assert.match(elements.question.textContent, /equivalente/);
assert.equal(elements.position.textContent, 'Pregunta 1 de 9');
elements.topics.children.find(button => button.textContent === 'Ángulos y movimientos').click();
assert.match(elements.question.textContent, /45°/);
assert.equal(elements.visual.children.length, 1);
elements.topics.children.find(button => button.textContent === 'Medidas y potencias').click();
assert.match(elements.question.textContent, /3 kilómetros/);
assert.match(elements.visual.children[0].textContent, /km.*mm/);
elements.reset.click();
assert.equal(elements['progress-count'].textContent, '0 / 56');
console.log('Pruebas del sitio y de las preguntas correctas.');
