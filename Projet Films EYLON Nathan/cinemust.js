(function () {  
  // IIFE : Encapsule tout le code pour éviter les variables globales

  const TMDB_API_KEY = "01db85cd9d534dc448cc5b69d1b2e5d3";  
  // Clé API TMDB pour accéder aux données des films

  const TMDB_IMG_PREFIX = "https://image.tmdb.org/t/p/w500";  
  // URL de base pour récupérer les affiches de films depuis TMDB

  function qs(sel, ctx = document) { return ctx.querySelector(sel); }  
  // Raccourci pour document.querySelector, avec contexte optionnel

  function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }  
  // Raccourci pour document.querySelectorAll, converti en tableau

  function safeText(node, text) { if(node) node.textContent = text ?? ""; }  
  // Met du texte dans un élément si celui-ci existe, sinon rien

  // ---------- Panneau latéral ----------
  function initSidePanel() {  
    const menu = qs('#menu-dots');  
    // Sélection du bouton menu (les trois points)

    const panel = qs('#side-panel');  
    // Sélection du panneau latéral

    const closeBtn = qs('#side-panel-close');  
    // Sélection du bouton de fermeture du panneau

    if (!menu || !panel) return;  
    // Si menu ou panneau absent -> quitter

    function openPanel(){  
      panel.setAttribute('data-open','true');  
      // Indique au CSS que le panneau est ouvert

      panel.setAttribute('aria-hidden','false');  
      // Accessibilité : panneau visible

      menu.setAttribute('aria-expanded','true');  
      // Accessibilité : bouton considéré comme ouvert
    }  

    function closePanel(){  
      panel.removeAttribute('data-open');  
      // Supprime l'attribut data-open

      panel.setAttribute('aria-hidden','true');  
      // Accessibilité : panneau caché

      menu.setAttribute('aria-expanded','false');  
      // Accessibilité : bouton considéré comme fermé
    }  

    menu.addEventListener('click', () => {  
      panel.hasAttribute('data-open') ? closePanel() : openPanel();  
      // Clic sur menu : toggle panneau
    });  

    closeBtn && closeBtn.addEventListener('click', closePanel);  
    // Clic sur bouton close -> fermer panneau

    const Menu = qs('#side-panel-title');  
    // Sélection du titre du panneau

    if (Menu) Menu.addEventListener('click', () => {  
      window.location.href = 'cinemustAcceuil.html';  
      // Clic sur titre -> retour accueil
    });  

    document.addEventListener('click', e => {  
      if (!panel.hasAttribute('data-open')) return;  
      // Si panneau fermé -> rien

      if (panel.contains(e.target) || menu.contains(e.target)) return;  
      // Clic dans le panneau ou sur menu -> rien

      closePanel();  
      // Sinon -> fermer panneau
    });  

    function makeToggle(linkId, contentId){  
      const link = qs('#' + linkId);  
      // Sélection du lien (ex: Introduction)

      const content = qs('#' + contentId);  
      // Sélection du contenu associé

      if (!link || !content) return;  
      // Si lien ou contenu absent -> quitter

      function toggle(){  
        const open = content.getAttribute('data-open') === 'true';  
        // Vérifie si la section est ouverte

        content.setAttribute('data-open', !open);  
        // Bascule l'état ouvert/fermé

        content.setAttribute('aria-hidden', open ? 'true' : 'false');  
        // Accessibilité : cacher/montrer le contenu
      }  

      link.addEventListener('click', toggle);  
      // Clic sur le lien -> toggle

      link.addEventListener('keydown', e => {  
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }  
        // Toggle clavier : Enter ou Espace
      });  
    }  

    makeToggle('link-intro','content-intro');  
    // Initialisation toggle section Introduction

    makeToggle('link-about','content-about');  
    // Initialisation toggle section À propos
  }  

  // ---------- Toggle accessibles pour boîtes de texte ----------
  function initBoxHeadings() {  
    const headings = qsa('#text-box-1 h2, #text-box-2 h2, .text-box h2');  
    // Sélection de tous les h2 interactifs

    headings.forEach(h => {  
      h.setAttribute('tabindex','0');  
      // Rendre focusable

      h.setAttribute('role','button');  
      // Rôle bouton pour accessibilité

      h.setAttribute('aria-expanded','false');  
      // État initial fermé

      function toggle() {  
        const parent = h.parentElement;  
        // Récupère parent contenant le h2

        const open = parent.classList.toggle('open');  
        // Bascule classe 'open'

        h.setAttribute('aria-expanded', open);  
        // Met à jour aria-expanded
      }  

      h.addEventListener('click', toggle);  
      // Clic -> toggle

      h.addEventListener('keydown', e => {  
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }  
        // Toggle clavier
      });  
    });  
  }  

  // ---------- Requête TMDB pour recherche ----------
  async function fetchMovieSearch(title) {  
    if (!title) return null;  
    // Titre vide -> null

    try {  
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&include_adult=false&language=fr-FR`;  
      // URL API TMDB

      const res = await fetch(url);  
      // Requête fetch

      if (!res.ok) return null;  
      // Si erreur -> null

      const json = await res.json();  
      // Parse JSON

      return (json.results && json.results.length > 0) ? json.results : null;  
      // Retourne résultats ou null
    } catch (err) {  
      console.error('TMDB search error', err);  
      return null;  
      // En cas d'erreur -> log et null
    }  
  }  

  // ---------- Slider films page accueil ----------
  const moviesList = [  
    "Le Seigneur des anneaux : Le Retour du roi",  
    "Le Seigneur des anneaux : La Communauté de l'anneau (The Lord of the Rings: The Fellowship of the Ring)",  
    "Le Seigneur des anneaux : Les Deux Tours (The Lord of the Rings: The Two Towers)",  
    "Forrest Gump",  
    "La Ligne verte",  
    "Le Parrain (The Godfather)",  
    "Les Évadés (The Shawshank Redemption)",  
    "Le Seigneur des anneaux : le retour du roi",  
    "The Dark Knight : Le Chevalier noir (The Dark Knight)"  
  ];  
  // Liste des films à afficher dans le slider

  async function loadHomeMovies() {  
    const slider = qs('#slider-films');  
    if (!slider) return;  
    // Pas de slider -> quitter

    const listEl = qs('#slider-films .splide__list');  
    if (!listEl) return;  
    // Pas de conteneur -> quitter

    listEl.innerHTML = '';  
    // Vider slider

    const slides = [];  
    for (const title of moviesList) {  
      const dataArr = await fetchMovieSearch(title);  
      if (!dataArr) continue;  
      // Aucun résultat -> passer

      const data = dataArr[0];  
      // Premier résultat

      const posterUrl = data.poster_path ? (TMDB_IMG_PREFIX + data.poster_path) : 'film-default.jpg';  
      // URL affiche ou défaut

      const li = document.createElement('li');  
      li.className = 'splide__slide';  
      // Crée slide

      li.innerHTML = `  
        <a href="cinemustFilm.html?id=${data.id}" class="slide-link" style="text-decoration:none;color:inherit;">  
          <img src="${posterUrl}" alt="${data.title}" loading="lazy">  
          <h3>${data.title}</h3>  
          <p>${data.release_date ? data.release_date.slice(0,4) : "N/A"}</p>  
        </a>  
      `;  
      listEl.appendChild(li);  
      slides.push(li);  
      // Ajoute slide au slider
    }  

    if (window.Splide) {  
      const splide = new Splide('#slider-films', {  
        type: 'loop',  
        perPage: 5,  
        gap: '10px',  
        drag: 'free',  
        focus: 0,  
        pagination: false,  
        arrows: false,  
        breakpoints: {1024:{perPage:3},768:{perPage:2},480:{perPage:1}}  
      });  
      splide.mount();  
      let current = 0;  
      const total = slides.length || 1;  
      setInterval(() => { current = (current + 1) % total; splide.go(current); }, 3000);  
      // Animation automatique toutes les 3s
    } else console.warn("Splide non chargé : le slider n'aura pas d'animations.");  
  }  

  // ---------- Page résultat TMDB ----------
  async function loadResultPage() {  
    const resultsEl = qs('#results');  
    // Conteneur résultats

    if (!resultsEl) return;  
    // Pas de conteneur -> quitter

    const params = new URLSearchParams(window.location.search);  
    // Récupère paramètres GET

    const query = params.get('q') || params.get('movie') || '';  
    // Récupère valeur recherchée

    if (!query.trim()) { safeText(resultsEl, "Aucun film spécifié."); return; }  
    // Aucun query -> message

    safeText(resultsEl, "Chargement...");  
    // Message pendant fetch

    const movies = await fetchMovieSearch(query);  
    if (!movies) { safeText(resultsEl, "Aucun film trouvé."); return; }  
    // Si aucun film -> message

    resultsEl.innerHTML = "";  
    // Vide conteneur

    movies.forEach(movie => {  
      const link = document.createElement("a");  
      link.href = `cinemustFilm.html?id=${movie.id}`;  
      link.style.textDecoration = "none";  
      link.style.color = "inherit";  
      // Lien vers page film

      const card = document.createElement("div");  
      card.className = "movie-card";  
      // Carte film

      const posterImg = document.createElement("img");  
      posterImg.className = "movie-poster";  
      posterImg.src = movie.poster_path ? TMDB_IMG_PREFIX + movie.poster_path : "https://via.placeholder.com/300x450?text=No+Image";  
      posterImg.alt = movie.title;  
      // Image du film

      const title = document.createElement("h3");  
      title.className = "movie-title";  
      title.textContent = movie.title;  
      // Titre du film

      card.appendChild(posterImg);  
      card.appendChild(title);  
      // Ajoute image + titre à la carte

      link.appendChild(card);  
      resultsEl.appendChild(link);  
      // Ajoute carte au lien et au conteneur
    });  
  }  

  // ---------- DOM ready ----------
  document.addEventListener('DOMContentLoaded', () => {  
    initSidePanel();  
    // Initialise panneau latéral

    initBoxHeadings();  
    // Initialise toggles accessibles

    const logo = qs('#image-responsive');  
    if (logo) {  
      logo.style.cursor = 'pointer';  
      logo.addEventListener('click', () => { window.location.href = 'cinemustAcceuil.html'; });  
      // Clic sur logo -> accueil
    }  

    if (qs('#slider-films')) loadHomeMovies();  
    // Si slider présent -> charger films

    loadResultPage();  
    // Charger résultats si page résultat
  });  

})();  
// Fin de l'IIFE
