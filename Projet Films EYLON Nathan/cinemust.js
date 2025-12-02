/* ================ cinemust.js =================
   Gère :
   - panneau latéral (toutes pages)
   - toggles de sections
   - page d'accueil : chargement TMDB + slider Splide
   - page résultat : recherche TMDB et affichage plusieurs films
   - clic sur logo -> accueil
   =================================================*/

(function () {
  const TMDB_API_KEY = "01db85cd9d534dc448cc5b69d1b2e5d3";
  const TMDB_IMG_PREFIX = "https://image.tmdb.org/t/p/w500";

  function qs(sel, ctx = document) { return ctx.querySelector(sel); }
  function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }
  function safeText(node, text) { if(node) node.textContent = text ?? ""; }

  // ---------- Panneau latéral ----------
  function initSidePanel() {
    const menu = qs('#menu-dots');
    const panel = qs('#side-panel');
    const closeBtn = qs('#side-panel-close');

    if (!menu || !panel) return;

    function openPanel(){ panel.setAttribute('data-open','true'); panel.setAttribute('aria-hidden','false'); menu.setAttribute('aria-expanded','true'); }
    function closePanel(){ panel.removeAttribute('data-open'); panel.setAttribute('aria-hidden','true'); menu.setAttribute('aria-expanded','false'); }

    menu.addEventListener('click', () => { panel.hasAttribute('data-open') ? closePanel() : openPanel(); });
    closeBtn && closeBtn.addEventListener('click', closePanel);

    const Menu = qs('#side-panel-title');
    if (Menu) Menu.addEventListener('click', () => { window.location.href = 'cinemustAcceuil.html'; });

    document.addEventListener('click', e => {
      if (!panel.hasAttribute('data-open')) return;
      if (panel.contains(e.target) || menu.contains(e.target)) return;
      closePanel();
    });

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
      link.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }} );
    }
    makeToggle('link-intro','content-intro');
    makeToggle('link-about','content-about');
  }

  // ---------- Accessible toggles ----------
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
      h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }} );
    });
  }

  // ---------- TMDB fetch ----------
  async function fetchMovieSearch(title) {
    if (!title) return null;
    try {
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&include_adult=false&language=fr-FR`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      return (json.results && json.results.length > 0) ? json.results : null;
    } catch (err) {
      console.error('TMDB search error', err);
      return null;
    }
  }

  // ---------- Accueil ----------
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
      const dataArr = await fetchMovieSearch(title);
      if (!dataArr) continue;
      const data = dataArr[0];
      const posterUrl = data.poster_path ? (TMDB_IMG_PREFIX + data.poster_path) : 'film-default.jpg';
      const li = document.createElement('li');
      li.className = 'splide__slide';
      li.innerHTML = `
        <a href="cinemustFilm.html?id=${data.id}" class="slide-link" style="text-decoration:none;color:inherit;">
          <img src="${posterUrl}" alt="${data.title}" loading="lazy">
          <h3>${data.title}</h3>
          <p>${data.release_date ? data.release_date.slice(0,4) : "N/A"}</p>
        </a>
      `;
      listEl.appendChild(li);
      slides.push(li);
    }

    if (window.Splide) {
      const splide = new Splide('#slider-films', {
        type: 'loop',
        perPage: 5,
        gap: '10px',
        drag: 'free',
        focus: 0,
        pagination: false,
        arrows: true,
        breakpoints: {1024:{perPage:3},768:{perPage:2},480:{perPage:1}}
      });
      splide.mount();
      let current = 0;
      const total = slides.length || 1;
      setInterval(() => { current = (current + 1) % total; splide.go(current); }, 3000);
    } else console.warn("Splide non chargé : le slider n'aura pas d'animations.");
  }

  // ---------- Page résultat ----------
  async function loadResultPage() {
    const resultsEl = qs('#results');
    if (!resultsEl) return;

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || params.get('movie') || '';

    if (!query.trim()) {
      safeText(resultsEl, "Aucun film spécifié.");
      return;
    }

    safeText(resultsEl, "Chargement...");

    const movies = await fetchMovieSearch(query);
    if (!movies) { safeText(resultsEl, "Aucun film trouvé."); return; }

    resultsEl.innerHTML = "";

    movies.forEach(movie => {
      const link = document.createElement("a");
      link.href = `cinemustFilm.html?id=${movie.id}`;
      link.style.textDecoration = "none";
      link.style.color = "inherit";

      const card = document.createElement("div");
      card.className = "movie-card";

      const posterImg = document.createElement("img");
      posterImg.className = "movie-poster";
      posterImg.src = movie.poster_path ? TMDB_IMG_PREFIX + movie.poster_path : "https://via.placeholder.com/300x450?text=No+Image";
      posterImg.alt = movie.title;

      const title = document.createElement("h3");
      title.className = "movie-title";
      title.textContent = movie.title;

      card.appendChild(posterImg);
      card.appendChild(title);
      link.appendChild(card);
      resultsEl.appendChild(link);
    });
  }

  // ---------- DOM ready ----------
  document.addEventListener('DOMContentLoaded', () => {
    initSidePanel();
    initBoxHeadings();

    // logo click -> accueil
    const logo = qs('#image-responsive');
    if (logo) {
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', () => { window.location.href = 'cinemustAcceuil.html'; });
    }

    if (qs('#slider-films')) loadHomeMovies();
    loadResultPage();
  });

})();
