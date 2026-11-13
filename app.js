
const app = document.querySelector('#app');
let chapters = [];

const VISITOR_COUNTER_URL = 'https://abacus.jasoncameron.dev/hit/biblioteca-korym/visitas';

fetch('chapters.json')
  .then(r => r.json())
  .then(d => chapters = d)
  .catch(() => {
    app.innerHTML = '<div class="reader-stage"><div class="reading">Não foi possível carregar os capítulos. Abra o site por um servidor HTTP, não diretamente como arquivo local.</div></div>';
  });

const intro1 = 'Antes de Korym existir, havia seis líderes, seis visões e um mesmo destino. Esta é a história de como diferentes povos, com suas próprias perdas, convicções e ambições, encontraram um caminho para construir uma aliança e um legado que atravessaria gerações.';

const intro2 = 'A Fundação foi apenas o começo. Com o passar dos anos, Korym cresce, novas gerações assumem seu lugar e as escolhas dos fundadores continuam a moldar o destino de seus povos.';

function go(path) {
  location.hash = path;
  render();
  window.scrollTo(0, 0);
}

function btn(label, path) {
  return `<button class="action" data-go="${path}">${label}</button>`;
}

function home() {
  return `<section class="scene">
    <div class="home-actions">
      <button class="cover-link" data-go="origem">
        <strong>A Origem</strong>
        <small>Livro I · 35 capítulos</small>
      </button>
      <button class="cover-link" data-go="ascensao">
        <strong>A Ascensão</strong>
        <small>Livro II · apresentação</small>
      </button>
    </div>
  </section>`;
}

function bookIntro(which) {
  const first = which === 'origem';

  return `<section class="paper-stage">
    <div class="openbook turn">
      <article class="page">
        <div class="eyebrow">AS CRÔNICAS DE KORYM · LIVRO ${first ? 'I' : 'II'}</div>
        <h1>${first ? 'A Origem' : 'A Ascensão'}</h1>
        <div class="ornament">✦ ───── ✦ ───── ✦</div>
        <p class="intro-text">${first ? intro1 : intro2}</p>
        <div class="page-actions">
          ${btn('← Biblioteca', 'home')}
          ${btn('Avançar página →', first ? 'indice' : 'embreve')}
        </div>
      </article>
      <article class="page desktop-only">
        <h2>${first ? 'Os primeiros registros' : 'Uma nova geração'}</h2>
        <div class="ornament">✧</div>
        <p class="intro-text">${first
          ? 'Acompanhe os acontecimentos que levaram à Fundação de Korym.'
          : 'Os herdeiros crescem em um mundo transformado pela união dos seis fundadores.'}</p>
      </article>
    </div>
  </section>`;
}

function indexPage() {
  if (!chapters.length) {
    return `<section class="reader-stage">
      <div class="reading">Carregando índice…</div>
    </section>`;
  }

  const half = Math.ceil(chapters.length / 2);

  const col = arr => `<ol class="index-list">
    ${arr.map(c => `<li>
      <a href="#capitulo/${String(c.n).padStart(3, '0')}">
        <b>${String(c.n).padStart(3, '0')}</b>
        <span>${escapeHtml(c.title)}</span>
      </a>
    </li>`).join('')}
  </ol>`;

  return `<section class="paper-stage">
    <div class="openbook turn">
      <article class="page index-page">
        <h2>Índice · A Origem</h2>
        ${col(chapters.slice(0, half))}
      </article>
      <article class="page index-page">
        <h2 class="desktop-only">Continuação</h2>
        ${col(chapters.slice(half))}
        <div class="page-actions">${btn('← Introdução', 'origem')}</div>
      </article>
    </div>
  </section>`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, x => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[x]));
}

function reader(n) {
  const c = chapters.find(c => c.n === n);

  if (!c) {
    return `<section class="reader-stage">
      <article class="reading">
        Capítulo indisponível. ${btn('Voltar ao índice', 'indice')}
      </article>
    </section>`;
  }

  return `<section class="reader-stage">
    <article class="reading">
      <p class="mini">LIVRO I — A ORIGEM · CAPÍTULO ${String(n).padStart(3, '0')}</p>
      <h1>${String(n).padStart(3, '0')} — ${escapeHtml(c.title)}</h1>
      <div class="ornament">✦</div>
      <div class="chapter-body">${c.html}</div>
      <div class="chapter-nav">
        ${n > 1
          ? btn('← Capítulo anterior', 'capitulo/' + String(n - 1).padStart(3, '0'))
          : btn('← Índice', 'indice')}
        ${btn('Índice', 'indice')}
        ${n < 35
          ? btn('Próximo capítulo →', 'capitulo/' + String(n + 1).padStart(3, '0'))
          : btn('Voltar à biblioteca', 'home')}
      </div>
    </article>
  </section>`;
}

function soon() {
  return `<section class="paper-stage">
    <div class="openbook turn">
      <article class="page">
        <h1>Em breve</h1>
        <div class="ornament">✦</div>
        <p class="intro-text">Os registros de <em>A Ascensão</em> ainda estão sendo preparados para a Biblioteca de Kor’hal.</p>
        <div class="page-actions">
          ${btn('← Voltar ao livro', 'ascensao')}
          ${btn('Biblioteca', 'home')}
        </div>
      </article>
      <article class="page desktop-only">
        <h2>O próximo volume</h2>
        <p class="intro-text">Novas páginas serão acrescentadas quando o livro estiver pronto para publicação.</p>
      </article>
    </div>
  </section>`;
}

function records() {
  return `<section class="paper-stage">
    <div class="openbook turn">
      <article class="page">
        <h1>Registros de Kor’hal</h1>
        <div class="ornament">✧</div>
        <p class="intro-text">Relatos complementares sobre personagens, territórios e acontecimentos de Korym, sempre respeitando os registros oficiais.</p>
      </article>
      <article class="page">
        <h2>Em preparação</h2>
        <p class="intro-text">Os primeiros registros serão publicados após revisão do cânone.</p>
        <div class="page-actions">${btn('← Biblioteca', 'home')}</div>
      </article>
    </div>
  </section>`;
}

function render() {
  const p = decodeURIComponent(location.hash.slice(1) || 'home');

  app.innerHTML =
    p === 'home' || p === 'books' ? home() :
    p === 'origem' || p === 'ascensao' ? bookIntro(p) :
    p === 'indice' ? indexPage() :
    p === 'embreve' ? soon() :
    p === 'records' ? records() :
    p.startsWith('capitulo/') ? reader(Number(p.split('/')[1])) :
    home();

  document.title = (
    p === 'home' ? 'Biblioteca de Kor’hal' :
    p === 'indice' ? 'Índice — A Origem' :
    p === 'records' ? 'Registros de Kor’hal' :
    'As Crônicas de Korym'
  ) + ' | Korym';
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-nav]');
  if (t) go(t.dataset.go || t.dataset.nav);
});

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});

render();

fetch('chapters.json')
  .then(r => r.json())
  .then(d => {
    chapters = d;
    render();
  });

// Contador de visitas da Biblioteca de Kor'hal.
// Incrementa uma vez por carregamento do site.
// A navegacao entre capitulos nao aumenta a contagem.

if (VISITOR_COUNTER_URL) {
  fetch(VISITOR_COUNTER_URL, { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error('Erro no contador: ' + r.status);
      return r.json();
    })
    .then(d => {
      const count = Number(d.value);
      const element = document.getElementById('visitCount');

      if (element && Number.isFinite(count)) {
        element.textContent = new Intl.NumberFormat('pt-BR').format(count);
      }
    })
    .catch(error => {
      console.warn('Não foi possível atualizar o contador:', error);
    });
}
