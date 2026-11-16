
const app = document.querySelector('#app');

const VISITOR_COUNTER_URL =
  'https://abacus.jasoncameron.dev/hit/biblioteca-korym/visitas';

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

const chapterCode = n => String(n).padStart(3, '0');

const escapeHtml = s => String(s).replace(
  /[&<>"']/g,
  x => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[x])
);

let currentReader = null;
let resizeTimer;
let goLastPage = false;

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
  const b = books[which];

  return `<section class="paper-stage">
    <div class="openbook">
      <article class="page">
        <div class="eyebrow">
          AS CRÔNICAS DE KORYM · LIVRO ${b.numeral}
        </div>
        <h1>${b.title}</h1>
        <div class="ornament">✦ ───── ✦ ───── ✦</div>
        <p class="intro-text">${b.intro}</p>
        <div class="page-actions">
          ${btn('← Biblioteca', 'home')}
          ${btn('Avançar página →', 'indice/' + which)}
        </div>
      </article>
      <article class="page desktop-only">
        <h2>${b.subtitle}</h2>
        <div class="ornament">✧</div>
        <p class="intro-text">${b.description}</p>
      </article>
    </div>
  </section>`;
}

function indexPage(which) {
  const b = books[which];

  if (!b.loaded) {
    return `<section class="reader-stage">
      <div class="reading">Carregando índice…</div>
    </section>`;
  }

  if (!b.chapters.length) {
    return `<section class="reader-stage">
      <div class="reading">
        Capítulos indisponíveis.
        ${btn('Biblioteca', 'home')}
      </div>
    </section>`;
  }

  const half = Math.ceil(b.chapters.length / 2);

  const col = arr => `<ol class="index-list">
    ${arr.map(c => `<li>
      <a href="#${which}/capitulo/${chapterCode(c.n)}">
        <b>${chapterCode(c.n)}</b>
        <span>${escapeHtml(c.title)}</span>
      </a>
    </li>`).join('')}
  </ol>`;

  return `<section class="paper-stage">
    <div class="openbook">
      <article class="page index-page">
        <h2>Índice · ${b.title}</h2>
        ${col(b.chapters.slice(0, half))}
      </article>
      <article class="page index-page">
        <h2 class="desktop-only">Continuação</h2>
        ${col(b.chapters.slice(half))}
        <div class="page-actions">
          ${btn('← Introdução', which)}
        </div>
      </article>
    </div>
  </section>`;
}

function records() {
  return `<section class="paper-stage">
    <div class="openbook">
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

function reader(which, n) {
  const b = books[which];

  if (!b.loaded) {
    return `<section class="reader-stage">
      <div class="reading">Carregando capítulo…</div>
    </section>`;
  }

  const idx = b.chapters.findIndex(c => Number(c.n) === n);

  if (idx < 0) {
    return `<section class="reader-stage">
      <div class="reading">
        Capítulo indisponível.
        ${btn('Voltar ao índice', 'indice/' + which)}
      </div>
    </section>`;
  }

  return `<section class="reader-stage paged-stage">
    <div class="paged-reader">
      <div class="paged-book" id="pagedBook">
        <article class="paged-sheet">
          <div class="paged-content" id="pageLeft"></div>
        </article>
        <article class="paged-sheet" id="rightSheet">
          <div class="paged-content" id="pageRight"></div>
        </article>
      </div>

      <nav class="paged-controls" aria-label="Navegação de páginas">
        <button id="prevPage" type="button">← Anterior</button>
        <span id="pageStatus" aria-live="polite"></span>
        <button id="nextPage" type="button">Próxima →</button>
      </nav>

      <div class="paged-links">
        ${btn('Índice', 'indice/' + which)}
        ${btn('Biblioteca', 'home')}
      </div>
    </div>
  </section>`;
}

function makeBlocks(html) {
  const holder = document.createElement('div');
  holder.innerHTML = html;

  const blocks = [];

  for (const node of Array.from(holder.childNodes)) {
    if (node.nodeType === 3) {
      const t = node.textContent.trim();

      if (t) {
        const p = document.createElement('p');
        p.textContent = t;
        blocks.push(p);
      }
    } else if (node.nodeType === 1) {
      if (
        node.tagName === 'DIV' &&
        node.classList.contains('chapter-body')
      ) {
        blocks.push(
          ...Array.from(node.children).map(x => x.cloneNode(true))
        );
      } else {
        blocks.push(node.cloneNode(true));
      }
    }
  }

  return blocks;
}

function buildPages(which, n) {
  const b = books[which];
  const idx = b.chapters.findIndex(c => Number(c.n) === n);
  const c = b.chapters[idx];

  const left = document.getElementById('pageLeft');
  if (!left || !c) return;

  const sheet = document.querySelector('.paged-sheet');

  const measure = document.createElement('div');
  measure.className = 'paged-content paged-measure';
  measure.style.width = sheet.clientWidth + 'px';
  measure.style.height = sheet.clientHeight + 'px';

  document.body.appendChild(measure);

  const pages = [];

  let page = document.createElement('div');
  page.className = 'paged-inner';
  measure.appendChild(page);

  const available = () =>
    measure.clientHeight -
    parseFloat(getComputedStyle(measure).paddingTop) -
    parseFloat(getComputedStyle(measure).paddingBottom);

  const fits = () => page.scrollHeight <= available() + 1;

  const finish = () => {
    if (page.childNodes.length) {
      pages.push(page.innerHTML);
    }

    page = document.createElement('div');
    page.className = 'paged-inner';
    measure.replaceChildren(page);
  };

  const addBlock = block => {
    page.appendChild(block);

    if (fits()) return;

    page.removeChild(block);

    if (page.childNodes.length) {
      finish();
      page.appendChild(block);

      if (fits()) return;

      page.removeChild(block);
    }

    // Parágrafos longos são divididos entre palavras.
    const words = (block.textContent || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return;

    const tag = /^(P|BLOCKQUOTE|LI)$/.test(block.tagName)
      ? block.tagName
      : 'P';

    let start = 0;

    while (start < words.length) {
      let low = 1;
      let high = words.length - start;
      let best = 0;
      let el = null;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);

        const candidate = document.createElement(tag);
        candidate.textContent = words
          .slice(start, start + mid)
          .join(' ');

        page.appendChild(candidate);
        const ok = fits();
        page.removeChild(candidate);

        if (ok) {
          best = mid;
          el = candidate;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      if (!best) {
        if (page.childNodes.length) {
          finish();
          continue;
        }

        best = 1;
        el = document.createElement(tag);
        el.textContent = words[start];
      }

      page.appendChild(el);
      start += best;

      if (start < words.length) finish();
    }
  };

  const header = document.createElement('div');
  header.className = 'paged-chapter-heading';

  header.innerHTML = `
    <div class="mini">
      LIVRO ${b.numeral} — ${escapeHtml(b.title.toUpperCase())}
      · CAPÍTULO ${chapterCode(n)}
    </div>
    <h1>${chapterCode(n)} — ${escapeHtml(c.title)}</h1>
    <div class="ornament">✦</div>
  `;

  addBlock(header);

  for (const block of makeBlocks(c.html)) {
    addBlock(block);
  }

  finish();
  measure.remove();

  currentReader = {
    which,
    n,
    idx,
    pages,
    position: 0
  };

  showPages();
}

function showPages() {
  const s = currentReader;
  if (!s) return;

  const mobile = window.matchMedia('(max-width:680px)').matches;
  const step = mobile ? 1 : 2;

  const left = document.getElementById('pageLeft');
  const right = document.getElementById('pageRight');

  if (!left) return;

  left.innerHTML = s.pages[s.position] || '';

  if (right) {
    right.innerHTML = mobile
      ? ''
      : (s.pages[s.position + 1] || '');
  }

  const rightSheet = document.getElementById('rightSheet');
  if (rightSheet) rightSheet.hidden = mobile;

  const total = s.pages.length;
  const end = Math.min(total, s.position + step);

  document.getElementById('pageStatus').textContent =
    `${s.position + 1}${end > s.position + 1 ? '–' + end : ''} de ${total}`;

  const prev = document.getElementById('prevPage');
  const next = document.getElementById('nextPage');

  prev.disabled = s.position === 0 && s.idx === 0;

  next.textContent = s.position + step >= total
    ? (s.idx < books[s.which].chapters.length - 1
      ? 'Próximo capítulo →'
      : 'Voltar ao índice →')
    : 'Próxima →';
}

function movePage(direction) {
  const s = currentReader;
  if (!s) return;

  const step = window.matchMedia('(max-width:680px)').matches
    ? 1
    : 2;

  if (direction > 0) {
    if (s.position + step < s.pages.length) {
      s.position += step;
      showPages();
    } else {
      const b = books[s.which];

      if (s.idx + 1 < b.chapters.length) {
        go(
          s.which + '/capitulo/' +
          chapterCode(b.chapters[s.idx + 1].n)
        );
      } else {
        go('indice/' + s.which);
      }
    }
  } else if (s.position > 0) {
    s.position = Math.max(0, s.position - step);
    showPages();
  } else if (s.idx > 0) {
    const b = books[s.which];
    goLastPage = true;

    go(
      s.which + '/capitulo/' +
      chapterCode(b.chapters[s.idx - 1].n)
    );
  }
}

function render() {
  let p;

  try {
    p = decodeURIComponent(location.hash.slice(1) || 'home');
  } catch {
    p = 'home';
  }

  const parts = p.split('/');
  currentReader = null;

  let target = null;

  if (p === 'home' || p === 'books') {
    app.innerHTML = home();
  } else if (books[p]) {
    app.innerHTML = bookIntro(p);
  } else if (p === 'indice') {
    app.innerHTML = indexPage('origem');
  } else if (parts[0] === 'indice' && books[parts[1]]) {
    app.innerHTML = indexPage(parts[1]);
  } else if (p === 'records') {
    app.innerHTML = records();
  } else if (parts[0] === 'capitulo' && parts.length === 2) {
    target = ['origem', Number(parts[1])];
    app.innerHTML = reader(...target);
  } else if (
    books[parts[0]] &&
    parts[1] === 'capitulo' &&
    parts.length === 3
  ) {
    target = [parts[0], Number(parts[2])];
    app.innerHTML = reader(...target);
  } else {
    app.innerHTML = home();
  }

  document.title = (
    target
      ? 'Capítulo — ' + books[target[0]].title
      : p === 'home'
        ? 'Biblioteca de Kor’hal'
        : books[p]?.title || 'As Crônicas de Korym'
  ) + ' | Korym';

  if (target && books[target[0]].loaded) {
    requestAnimationFrame(() => {
      buildPages(...target);

      if (goLastPage && currentReader) {
        const step = window.matchMedia('(max-width:680px)').matches
          ? 1
          : 2;

        currentReader.position =
          Math.floor((currentReader.pages.length - 1) / step) * step;

        goLastPage = false;
        showPages();
      }
    });
  }
}

document.addEventListener('click', e => {
  const nav = e.target.closest('[data-go],[data-nav]');

  if (nav) {
    go(nav.dataset.go || nav.dataset.nav);
    return;
  }

  if (e.target.closest('#prevPage')) movePage(-1);
  if (e.target.closest('#nextPage')) movePage(1);
});

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    if (!currentReader) return;

    const { which, n, position, pages } = currentReader;
    const fraction = pages.length > 1
      ? position / (pages.length - 1)
      : 0;

    buildPages(which, n);

    if (currentReader) {
      const step = window.matchMedia('(max-width:680px)').matches
        ? 1
        : 2;

      currentReader.position = Math.min(
        Math.floor(
          fraction * (currentReader.pages.length - 1) / step
        ) * step,
        Math.floor(
          (currentReader.pages.length - 1) / step
        ) * step
      );

      showPages();
    }
  }, 200);
});

render();

// Carregar os dois livros separadamente.
for (const which of ['origem', 'ascensao']) {
  fetch(which + '.json', { cache: 'no-cache' })
    .then(r => {
      if (!r.ok) {
        throw Error('Arquivo não encontrado: ' + which);
      }

      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data)) {
        throw Error('Formato inválido: ' + which);
      }

      books[which].chapters = data;
      books[which].loaded = true;
      render();
    })
    .catch(error => {
      console.error(error);
      books[which].loaded = true;
      render();
    });
}

// Contador de visitas.
if (VISITOR_COUNTER_URL) {
  fetch(VISITOR_COUNTER_URL, { cache: 'no-store' })
    .then(r => {
      if (!r.ok) {
        throw Error('Erro no contador: ' + r.status);
      }

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
