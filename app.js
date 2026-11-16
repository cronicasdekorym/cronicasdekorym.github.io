
const app = document.querySelector('#app');

const books = {
  origem: {
    title: 'A Origem',
    numeral: 'I',
    chapters: [],
    loaded: false,
    intro: 'Antes de Korym existir, havia seis líderes, seis visões e um mesmo destino. Esta é a história de como diferentes povos, com suas próprias perdas, convicções e ambições, encontraram um caminho para construir uma aliança e um legado que atravessaria gerações.',
    subtitle: 'Os primeiros registros',
    description: 'Acompanhe os acontecimentos que levaram à Fundação de Korym.'
  },
  ascensao: {
    title: 'A Ascensão',
    numeral: 'II',
    chapters: [],
    loaded: false,
    intro: 'A Fundação foi apenas o começo. Com o passar dos anos, Korym cresce, novas gerações assumem seu lugar e as escolhas dos fundadores continuam a moldar o destino de seus povos.',
    subtitle: 'Uma nova geração',
    description: 'Os herdeiros crescem em um mundo transformado pela união dos seis fundadores.'
  }
};

const VISITOR_COUNTER_URL =
  'https://abacus.jasoncameron.dev/hit/biblioteca-korym/visitas';

function chapterCode(n) {
  return String(n).padStart(3, '0');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, x => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[x]));
}

function go(path) {
  if (location.hash.slice(1) === path) {
    render();
    window.scrollTo(0, 0);
  } else {
    location.hash = path;
  }
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
        <small>Livro II · 10 capítulos disponíveis</small>
      </button>
    </div>
  </section>`;
}

function bookIntro(which) {
  const book = books[which];

  return `<section class="paper-stage">
    <div class="openbook turn">
      <article class="page">
        <div class="eyebrow">
          AS CRÔNICAS DE KORYM · LIVRO ${book.numeral}
        </div>
        <h1>${book.title}</h1>
        <div class="ornament">✦ ───── ✦ ───── ✦</div>
        <p class="intro-text">${book.intro}</p>
        <div class="page-actions">
          ${btn('← Biblioteca', 'home')}
          ${btn('Avançar página →', 'indice/' + which)}
        </div>
      </article>
      <article class="page desktop-only">
        <h2>${book.subtitle}</h2>
        <div class="ornament">✧</div>
        <p class="intro-text">${book.description}</p>
      </article>
    </div>
  </section>`;
}

function indexPage(which) {
  const book = books[which];

  if (!book.loaded) {
    return `<section class="reader-stage">
      <div class="reading">Carregando índice…</div>
    </section>`;
  }

  if (!book.chapters.length) {
    return `<section class="reader-stage">
      <div class="reading">
        Os capítulos de ${book.title} não estão disponíveis.
        ${btn('← Biblioteca', 'home')}
      </div>
    </section>`;
  }

  const chapters = book.chapters;
  const half = Math.ceil(chapters.length / 2);

  const col = arr => `<ol class="index-list">
    ${arr.map(c => `<li>
      <a href="#${which}/capitulo/${chapterCode(c.n)}">
        <b>${chapterCode(c.n)}</b>
        <span>${escapeHtml(c.title)}</span>
      </a>
    </li>`).join('')}
  </ol>`;

  return `<section class="paper-stage">
    <div class="openbook turn">
      <article class="page index-page">
        <h2>Índice · ${book.title}</h2>
        ${col(chapters.slice(0, half))}
      </article>
      <article class="page index-page">
        <h2 class="desktop-only">Continuação</h2>
        ${col(chapters.slice(half))}
        <div class="page-actions">
          ${btn('← Introdução', which)}
        </div>
      </article>
    </div>
  </section>`;
}

function reader(which, n) {
  const book = books[which];

  if (!book.loaded) {
    return `<section class="reader-stage">
      <article class="reading">Carregando capítulo…</article>
    </section>`;
  }

  const chapters = book.chapters;
  const index = chapters.findIndex(c => Number(c.n) === n);

  if (index < 0) {
    return `<section class="reader-stage">
      <article class="reading">
        Capítulo indisponível.
        ${btn('Voltar ao índice', 'indice/' + which)}
      </article>
    </section>`;
  }

  const c = chapters[index];
  const previous = chapters[index - 1];
  const next = chapters[index + 1];

  return `<section class="reader-stage">
    <article class="reading">
      <p class="mini">
        LIVRO ${book.numeral} — ${book.title.toUpperCase()}
        · CAPÍTULO ${chapterCode(c.n)}
      </p>
      <h1>${chapterCode(c.n)} — ${escapeHtml(c.title)}</h1>
      <div class="ornament">✦</div>
      <div class="chapter-body">${c.html}</div>
      <div class="chapter-nav">
        ${previous
          ? btn('← Capítulo anterior',
              which + '/capitulo/' + chapterCode(previous.n))
          : btn('← Índice', 'indice/' + which)}
        ${btn('Índice', 'indice/' + which)}
        ${next
          ? btn('Próximo capítulo →',
              which + '/capitulo/' + chapterCode(next.n))
          : btn('Voltar à biblioteca', 'home')}
      </div>
    </article>
  </section>`;
}

function records() {
  return `<section class="paper-stage">
    <div class="openbook turn">
      <article class="page">
        <h1>Registros de Kor’hal</h1>
        <div class="ornament">✧</div>
        <p class="intro-text">
          Relatos complementares sobre personagens, territórios
          e acontecimentos de Korym, sempre respeitando
          os registros oficiais.
        </p>
      </article>
      <article class="page">
        <h2>Em preparação</h2>
        <p class="intro-text">
          Os primeiros registros serão publicados
          após revisão do cânone.
        </p>
        <div class="page-actions">
          ${btn('← Biblioteca', 'home')}
        </div>
      </article>
    </div>
  </section>`;
}

function render() {
  let p;

  try {
    p = decodeURIComponent(location.hash.slice(1) || 'home');
  } catch {
    p = 'home';
  }

  const parts = p.split('/');

  if (p === 'home' || p === 'books') {
    app.innerHTML = home();
  } else if (p === 'origem' || p === 'ascensao') {
    app.innerHTML = bookIntro(p);
  } else if (p === 'indice') {
    // Compatibilidade com links antigos do Livro I
    app.innerHTML = indexPage('origem');
  } else if (parts[0] === 'indice' && books[parts[1]]) {
    app.innerHTML = indexPage(parts[1]);
  } else if (parts[0] === 'capitulo' && parts.length === 2) {
    // Compatibilidade com links antigos do Livro I
    app.innerHTML = reader('origem', Number(parts[1]));
  } else if (
    books[parts[0]] &&
    parts[1] === 'capitulo' &&
    parts.length === 3
  ) {
    app.innerHTML = reader(parts[0], Number(parts[2]));
  } else if (p === 'records') {
    app.innerHTML = records();
  } else {
    app.innerHTML = home();
  }

  let title = 'Biblioteca de Kor’hal';

  if (p === 'records') {
    title = 'Registros de Kor’hal';
  } else if (p === 'origem' || p === 'ascensao') {
    title = books[p].title;
  } else if (p === 'indice') {
    title = 'Índice — A Origem';
  } else if (parts[0] === 'indice' && books[parts[1]]) {
    title = 'Índice — ' + books[parts[1]].title;
  } else if (parts[0] === 'capitulo') {
    title = 'Capítulo — A Origem';
  } else if (books[parts[0]] && parts[1] === 'capitulo') {
    title = 'Capítulo — ' + books[parts[0]].title;
  }

  document.title = title + ' | Korym';
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

// Carregamento independente dos dois livros.
for (const which of ['origem', 'ascensao']) {
  fetch(which + '.json', { cache: 'no-cache' })
    .then(r => {
      if (!r.ok) throw new Error('Arquivo não encontrado: ' + which);
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data)) {
        throw new Error('Formato inválido: ' + which);
      }

      books[which].chapters = data;
      books[which].loaded = true;
      render();
    })
    .catch(error => {
      console.error('Erro ao carregar ' + which + '.json:', error);
      books[which].loaded = true;
      render();
    });
}

// Contador de visitas.
// Incrementa uma vez por carregamento do site.
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
        element.textContent =
          new Intl.NumberFormat('pt-BR').format(count);
      }
    })
    .catch(error => {
      console.warn('Não foi possível atualizar o contador:', error);
    });
}
