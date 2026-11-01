/* ==========================================================================
   Drive Car Mecânica — script principal
   ----------------------------------------------------------------------------
   1. Preenche contatos e redes com os dados de js/config.js
   2. Cabeçalho, menu mobile e menu "Todos os serviços"
   3. Faixa de destaques e catálogo (cards de serviço)
   4. Contador da promoção (só aparece se houver data em config.js)
   5. Animações ao rolar e destaque do item do menu
   Depende de js/config.js e js/budget.js (carregados antes).
   ========================================================================== */
(function () {
  'use strict';

  const { business, services, promo } = window.SITE_CONFIG;
  const { money, whatsappUrl } = window.SiteUtils;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ativa as animações de entrada (o CSS só oculta elementos quando a classe .js existe)
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  /* ---------- 1. Dados de contato ---------- */

  const textValues = { whatsapp: business.phoneDisplay, address: business.address };
  document.querySelectorAll('[data-text]').forEach((el) => {
    el.textContent = textValues[el.dataset.text] || '';
  });

  document.querySelectorAll('[data-wa]').forEach((link) => {
    link.href = whatsappUrl(link.dataset.message || 'Olá! Gostaria de falar com a Drive Car Mecânica.');
    link.target = '_blank';
    link.rel = 'noopener';
  });

  const socialUrls = {
    facebook: business.facebookUrl,
    instagram: business.instagramUrl,
    maps: business.mapsUrl,
  };
  document.querySelectorAll('[data-link]').forEach((el) => {
    const key = el.dataset.link;
    if (key === 'maps-embed') {
      el.src = business.mapsEmbedUrl;
    } else if (socialUrls[key]) {
      el.href = socialUrls[key];
    } else {
      el.hidden = true; // oculta redes sem endereço cadastrado
    }
  });

  document.getElementById('currentYear').textContent = new Date().getFullYear();

  /* ---------- 2. Cabeçalho, menu mobile e menu de serviços ---------- */

  const header = document.getElementById('siteHeader');
  const progress = document.getElementById('scrollProgress');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function setNav(open) {
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('is-locked', open);
  }

  navToggle.addEventListener('click', () => {
    setNav(!navMenu.classList.contains('is-open'));
  });
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNav(false));
  });

  const dropdown = document.getElementById('servicesDropdown');
  const dropdownToggle = dropdown.querySelector('.nav__dropdown-toggle');

  function setDropdown(open) {
    dropdown.classList.toggle('is-open', open);
    dropdownToggle.setAttribute('aria-expanded', String(open));
  }

  dropdownToggle.addEventListener('click', () => {
    setDropdown(!dropdown.classList.contains('is-open'));
  });

  // Fecha os menus com Esc ou com um clique fora deles
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) setDropdown(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setDropdown(false);
      setNav(false);
    }
  });

  // Ao voltar para a tela grande, fecha o menu mobile
  window.matchMedia('(min-width: 961px)').addEventListener('change', (event) => {
    if (event.matches) setNav(false);
  });

  /* ---------- 3. Destaques e catálogo ---------- */

  const ICONS = {
    oil: '<path d="M12 3s-5.5 6.2-5.5 10.5a5.5 5.5 0 0 0 11 0C17.5 9.2 12 3 12 3Z"/><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5"/>',
    checklist: '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 9l1.6 1.6L14 7M9 15.5h6"/>',
    scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M8 12h8"/>',
    brake: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2.5V4M12 20v1.5M2.5 12H4M20 12h1.5"/>',
    spring: '<path d="M6 3h12M6 21h12M9 3v3l-3 3v6l3 3v3M15 3v3l3 3v6l-3 3v3"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M9.5 4.5 12 6.5l2.5-2M9.5 19.5 12 17.5l2.5 2"/>',
    battery: '<rect x="3" y="7" width="16" height="11" rx="2"/><path d="M21 11v3M6.5 12.5h4M8.5 10.5v4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  };

  const iconSvg = (key) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[key] || ICONS.gear}</svg>`;

  const dealGrid = document.getElementById('dealGrid');
  const catalogList = document.getElementById('catalogList');
  const catalogCards = document.getElementById('catalogCards');
  const servicesMenu = document.getElementById('servicesMenu');

  // Cria um cartão de serviço. "catalog" adiciona a etiqueta "Destaque".
  function buildCard(service, { catalog = false } = {}) {
    const card = document.createElement('article');
    card.className = 'product reveal';
    card.innerHTML = `
      ${catalog && service.featured ? '<p class="product__tag product__tag--badge">Destaque</p>' : ''}
      <p class="product__tag">${service.tag}</p>
      <div class="product__media">${iconSvg(service.icon)}</div>
      <h3 class="product__title">${service.name}</h3>
      <p class="product__desc">${service.description}</p>
      <p class="product__price"><small>A partir de</small>${money(service.price)}</p>
      <button class="btn btn--red btn--sm" type="button" data-add="${service.id}">Adicionar ao orçamento</button>`;
    return card;
  }

  function renderDeals() {
    const featured = services.filter((service) => service.featured).slice(0, 4);
    dealGrid.replaceChildren(...featured.map((service) => buildCard(service)));
  }

  // Lista lateral do catálogo e itens do menu "Todos os serviços"
  function renderMenus() {
    const links = services
      .map((service) => `<li><a href="#catalogo" data-filter="${service.id}">${service.name}</a></li>`)
      .join('');
    catalogList.innerHTML = `<li><a href="#catalogo" data-filter="all" class="is-active">Todos os serviços</a></li>${links}`;
    servicesMenu.innerHTML = `<li><a href="#catalogo" data-filter="all">Ver todos</a></li>${links}`;
  }

  function renderCatalog(filter) {
    const list = filter === 'all' ? services : services.filter((service) => service.id === filter);
    if (revealObserver) {
      catalogCards.querySelectorAll('.reveal').forEach((el) => revealObserver.unobserve(el));
    }
    catalogCards.replaceChildren(...list.map((service) => buildCard(service, { catalog: true })));
    catalogList.querySelectorAll('a').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.filter === filter);
    });
    observeReveal(catalogCards);
  }

  function scrollToBudget() {
    document.getElementById('orcamento').scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  // Cliques nos cartões, nos banners e nos filtros (delegação de eventos)
  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add], [data-service]');
    if (addButton) {
      window.Budget.addService(addButton.dataset.add || addButton.dataset.service);
      scrollToBudget();
      return;
    }

    const filterLink = event.target.closest('[data-filter]');
    if (filterLink) {
      setDropdown(false);
      setNav(false);
      renderCatalog(filterLink.dataset.filter);
    }
  });

  /* ---------- 4. Contador da promoção ---------- */

  function initCountdown() {
    const el = document.getElementById('countdown');
    if (!el || !promo || !promo.endsAt) return;

    const end = new Date(promo.endsAt).getTime();
    if (Number.isNaN(end)) return;

    const units = {
      d: el.querySelector('[data-unit="d"]'),
      h: el.querySelector('[data-unit="h"]'),
      m: el.querySelector('[data-unit="m"]'),
      s: el.querySelector('[data-unit="s"]'),
    };
    const pad = (n) => String(n).padStart(2, '0');
    let timer = null;

    function tick() {
      let diff = end - Date.now();
      if (diff <= 0) {
        clearInterval(timer);
        el.hidden = true;
        return;
      }
      const d = Math.floor(diff / 86400000); diff %= 86400000;
      const h = Math.floor(diff / 3600000); diff %= 3600000;
      const m = Math.floor(diff / 60000); diff %= 60000;
      const s = Math.floor(diff / 1000);
      units.d.textContent = pad(d);
      units.h.textContent = pad(h);
      units.m.textContent = pad(m);
      units.s.textContent = pad(s);
    }

    el.hidden = false;
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- 5. Animações ao rolar e destaque do menu ---------- */

  const hasIO = 'IntersectionObserver' in window;

  const revealObserver = hasIO
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 })
    : null;

  function observeReveal(scope = document) {
    scope.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('is-visible');
    });
  }

  // Marca no menu a seção que está no centro da tela
  if (hasIO) {
    const navLinks = Array.from(navMenu.querySelectorAll('a:not(.btn)'));
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-50% 0px -50% 0px' });

    document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- Inicialização ---------- */

  renderMenus();
  renderDeals();
  renderCatalog('all');
  initCountdown();
  observeReveal();
})();
