/* ================ cinemust.js =================
   Gère :
   - panneau latéral (toutes pages)
   - toggles de sections
   - page d'accueil : chargement TMDB + slider Splide
   - page résultat : recherche TMDB et affichage (Option A)
   =================================================*/

(function () {
  // ---------- Configuration TMDB ----------
  const TMDB_API_KEY = "01db85cd9d534dc448cc5b69d1b2e5d3";
  const TMDB_IMG_PREFIX = "https://image.tmdb.org/t/p/w500";

  // ---------- Utilitaires ----------
  function qs(sel, ctx = document) { return ctx.querySelector(sel); }
  function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }
  function safeText(node, text) { if(node) node.textContent = text ?? ""; }

  // ---------- Panneau latéral commun ----------
  function initSidePanel() {
    const menu = qs('#menu-dots');
    const panel = qs('#side-panel');
    const closeBtn = qs('#side-panel-close');

    if (!menu || !panel) return;

    function openPanel(){
      panel.setAttribute('data-open','true');
      panel.setAttribute('aria-hidden','false');
      menu.setAttribute('aria-expanded','true');
    }
    function closePanel(){
      panel.removeAttribute('data-open');
      panel.setAttribute('aria-hidden','true');
      menu.setAttribute('aria-expanded','false');
    }

    menu.addEventListener('click', () => {
      if (panel.hasAttribute('data-open')) closePanel(); else openPanel();
    });
    closeBtn && closeBtn.addEventListener('click', closePanel);

    // fermer en cliquant dehors
    document.addEventListener('click', e => {
      if (!panel.hasAttribute('data-open')) return;
      if (panel.contains(e.target) || menu.contains(e.target)) return;
      closePanel();
    });

    // toggles internes pour Introduction / A propos
    function makeToggle(linkId, contentId){
      const link = qs('#' + linkId);
      const content = qs('#' + contentId);
      if (!link || !content) return;
      function toggle(){
        const open = content.getAttribute('data-open') === 'true';
        content.setAttribute('data-open', !open);
        content.setAttribute('aria-hidden', open ? 'true' : 'false');
      }
      link.addEventListener('click', toggle);
      link.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }});
    }
    makeToggle('link-intro','content-intro');
    makeToggle('link-about','content-about');
  }

  // ---------- Accessible toggles pour boîtes (si présentes) ----------
  function initBoxHeadings() {
    const headings = qsa('#text-box-1 h2, #text-box-2 h2, .text-box h2');
    headings.forEach(h => {
      h.setAttribute('tabindex','0');
      h.setAttribute('role','button');
      h.setAttribute('aria-expanded','false');
      function toggle() {
        const parent = h.parentElement;
        const open = parent.classList.toggle('open');
        h.setAttribute('aria-expanded', open);
      }
      h.addEventListener('click', toggle);
      h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }});
    });
  }

  // ---------- TMDB : fetch movie by title (search) ----------
  async function fetchMovieSearch(title) {
    if (!title) return null;
    try {
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&include_adult=false&language=fr-FR`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      if (json.results && json.results.length > 0) return json.results[0];
      return null;
    } catch (err) {
      console.error('TMDB search error', err);
      return null;
    }
  }

  // ---------- Accueil : load top films (ton tableau) and render Splide ----------
  const moviesList = [
    "Les Évadés (The Shawshank Redemption)",
    "Interstellar",
    "Le Voyage de Chihiro",
    "The Dark Knight",
    "The Green Mile",
    "Parasite",
    "Le Seigneur des anneaux : Le Retour du roi",
    "Your Name.",
    "Forrest Gump",
    "Fight Club"
  ];

  async function loadHomeMovies() {
    const slider = qs('#slider-films');
    if (!slider) return;

    const listEl = qs('#slider-films .splide__list');
    if (!listEl) return;

    listEl.innerHTML = '';

    const slides = [];
    for (const title of moviesList) {
      const data = await fetchMovieSearch(title);
      if (!data) continue;
      const posterUrl = data.poster_path ? (TMDB_IMG_PREFIX + data.poster_path) : 'film-default.jpg';
      const li = document.createElement('li');
      li.className = 'splide__slide';
      li.innerHTML = `
        <a href="cinemustResult.html?q=${encodeURIComponent(title)}" class="slide-link" style="text-decoration:none;color:inherit;">
          <img src="${posterUrl}" alt="${data.title}" loading="lazy">
          <h3 style="margin:6px 0 0 0; font-size:0.95rem;">${data.title}</h3>
          <p style="opacity:0.85; font-size:0.85rem; margin:4px 0 0 0;">${data.release_date ? data.release_date.slice(0,4) : "N/A"}</p>
        </a>
      `;
      listEl.appendChild(li);
      slides.push(li);
    }

    // initialize Splide (only if library loaded)
    if (window.Splide) {
      const splide = new Splide('#slider-films', {
        type: 'loop',
        perPage: 5,
        gap: '10px',
        drag: 'free',
        focus: 0,
        pagination: false,
        arrows: true,
        breakpoints: {
          1024: { perPage: 3 },
          768: { perPage: 2 },
          480: { perPage: 1 }
        }
      });
      splide.mount();

      // auto-scroll simple
      let current = 0;
      const total = slides.length || 1;
      setInterval(() => {
        current = (current + 1) % total;
        splide.go(current);
      }, 3000);
    } else {
      console.warn("Splide non chargé : le slider n'aura pas d'animations.");
    }
  }

  // ---------- Page résultat : fetch premier résultat TMDB et afficher (Option A) ----------
  async function loadResultPage() {
    const titleEl = qs('#movie-title');
    if (!titleEl) return; // on est pas sur la page result

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || params.get('movie') || '';

    const posterEl = qs('#poster');
    const yearEl = qs('#movie-year');
    const plotEl = qs('#movie-plot');
    const messageEl = qs('#message');

    if (!query || !query.trim()) {
      safeText(messageEl, "Aucun film spécifié.");
      return;
    }

    safeText(messageEl, "Chargement...");
    const movie = await fetchMovieSearch(query);
    if (!movie) {
      safeText(messageEl, "Le film que vous avez cherché n'a pas été retrouvé.");
      safeText(titleEl, "");
      safeText(yearEl, "");
      safeText(plotEl, "");
      if (posterEl) posterEl.style.display = 'none';
      return;
    }

    safeText(messageEl, "");
    safeText(titleEl, movie.title || movie.name || "");
    safeText(yearEl, movie.release_date ? "Date de sortie : " + movie.release_date : "");
    safeText(plotEl, movie.overview || "Aucun synopsis disponible.");
    if (posterEl) {
      if (movie.poster_path) {
        posterEl.src = TMDB_IMG_PREFIX + movie.poster_path;
        posterEl.style.display = 'block';
      } else {
        posterEl.style.display = 'none';
      }
    }
  }

  // ---------- DOM ready ----------
  document.addEventListener('DOMContentLoaded', () => {
    initSidePanel();
    initBoxHeadings();

    // Si on est sur l'accueil, charge les slides
    if (qs('#slider-films')) {
      loadHomeMovies();
    }

    // Si on est sur la page résultat
    loadResultPage();
  });

})();
