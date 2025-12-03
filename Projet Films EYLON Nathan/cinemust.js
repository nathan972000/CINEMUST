(function () {  
  // IIFE pour encapsuler tout le code et éviter les variables globales

  const TMDB_API_KEY = "01db85cd9d534dc448cc5b69d1b2e5d3";  
  // Clé API pour accéder à l'API TMDB

  const TMDB_IMG_PREFIX = "https://image.tmdb.org/t/p/w500";  
  // URL de base pour récupérer les images de TMDB

  function qs(sel, ctx = document) { return ctx.querySelector(sel); }  
  // Raccourci pour document.querySelector

  function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }  
  // Raccourci pour document.querySelectorAll, converti en tableau

  function safeText(node, text) { if(node) node.textContent = text ?? ""; }  
  // Met du texte dans un élément si celui-ci existe, sinon rien

  // ---------- Panneau latéral ----------
  function initSidePanel() {  
    const menu = qs('#menu-dots');  
    // Sélectionne le bouton du menu (les trois points)

    const panel = qs('#side-panel');  
    // Sélectionne le panneau latéral

    const closeBtn = qs('#side-panel-close');  
    // Sélectionne le bouton pour fermer le panneau

    if (!menu || !panel) return;  
    // Si le menu ou le panneau n'existe pas, on quitte la fonction

    function openPanel(){  
      panel.setAttribute('data-open','true');  
      // Attribut pour indiquer au CSS que le panneau est ouvert

      panel.setAttribute('aria-hidden','false');  
      // Accessibilité : le panneau est visible

      menu.setAttribute('aria-expanded','true');  
      // Accessibilité : bouton de menu considéré comme ouvert
    }  

    function closePanel(){  
      panel.removeAttribute('data-open');  
      // Supprime l'attribut data-open

      panel.setAttribute('aria-hidden','true');  
      // Accessibilité : le panneau est caché

      menu.setAttribute('aria-expanded','false');  
      // Accessibilité : bouton de menu considéré comme fermé
    }  

    menu.addEventListener('click', () => {  
      panel.hasAttribute('data-open') ? closePanel() : openPanel();  
      // Si le panneau est ouvert -> fermer, sinon -> ouvrir
    });  

    closeBtn && closeBtn.addEventListener('click', closePanel);  
    // Si bouton close existe -> ajouter événement clic pour fermer

    const Menu = qs('#side-panel-title');  
    // Sélectionne le titre du panneau

    if (Menu) Menu.addEventListener('click', () => {  
      window.location.href = 'cinemustAcceuil.html';  
      // Clic sur titre -> renvoie à la page d'accueil
    });  

    document.addEventListener('click', e => {  
      if (!panel.hasAttribute('data-open')) return;  
      // Si panneau fermé -> rien

      if (panel.contains(e.target) || menu.contains(e.target)) return;  
      // Si clic dans le panneau ou sur le menu -> rien

      closePanel();  
      // Sinon -> fermer le panneau
    });  

    function makeToggle(linkId, contentId){  
      const link = qs('#' + linkId);  
      // Sélectionne le lien de la section (ex: Introduction)

      const content = qs('#' + contentId);  
      // Sélectionne le contenu correspondant

      if (!link || !content) return;  
      // Si lien ou contenu absent -> quitter

      function toggle(){  
        const open = content.getAttribute('data-open') === 'true';  
        // Vérifie si la section est déjà ouverte

        content.setAttribute('data-open', !open);  
        // Bascule l'état data-open

        content.setAttribute('aria-hidden', open ? 'true' : 'false');  
        // Accessibilité : cacher/montrer le contenu
      }  

      link.addEventListener('click', toggle);  
      // Toggle au clic sur le lien

      link.addEventListener('keydown', e => {  
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }  
        // Toggle au clavier si Enter ou Espace
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
    // Sélection de tous les h2 qui doivent être interactifs

    headings.forEach(h => {  
      h.setAttribute('tabindex','0');  
      // Rendre le h2 focusable

      h.setAttribute('role','button');  
      // Indique que c'est un bouton pour accessibilité

      h.setAttribute('aria-expanded','false');  
      // État initial fermé

      function toggle() {  
        const parent = h.parentElement;  
        // Récupère le parent contenant le h2

        const open = parent.classList.toggle('open');  
        // Ajoute ou enlève la classe 'open'

        h.setAttribute('aria-expanded', open);  
        // Met à jour aria-expanded pour l'accessibilité
      }  

      h.addEventListener('click', toggle);  
      // Clic sur le h2 -> toggle

      h.addEventListener('keydown', e => {  
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }  
        // Toggle au clavier si Enter ou Espace
      });  
    });  
  }  

  // ---------- Requête TMDB pour recherche ----------
  async function fetchMovieSearch(title) {  
    if (!title) return null;  
    // Si titre vide -> retour null

    try {  
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&include_adult=false&language=fr-FR`;  
      // URL TMDB pour rechercher un film

      const res = await fetch(url);  
      // Envoi de la requête

      if (!res.ok) return null;  
      // Si erreur -> retour null

      const json = await res.json();  
      // Parse JSON de la réponse

      return (json.results && json.results.length > 0) ? json.results : null;  
      // Retourne tableau résultats ou null si vide
    } catch (err) {  
      console.error('TMDB search error', err);  
      return null;  
      // En cas d'erreur -> log et retour null
    }  
  }  

  // ---------- Slider films page accueil ----------
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
  // Liste des films à afficher dans le slider

  async function loadHomeMovies() {  
    const slider = qs('#slider-films');  
    if (!slider) return;  
    // Si pas de slider -> quitter

    const listEl = qs('#slider-films .splide__list');  
    if (!listEl) return;  
    // Si pas de conteneur de slides -> quitter

    listEl.innerHTML = '';  
    // Vider le slider avant de remplir

    const slides = [];  
    for (const title of moviesList) {  
      const dataArr = await fetchMovieSearch(title);  
      if (!dataArr) continue;  
      // Si aucun résultat -> passer au suivant

      const data = dataArr[0];  
      // Premier résultat

      const posterUrl = data.poster_path ? (TMDB_IMG_PREFIX + data.poster_path) : 'film-default.jpg';  
      // URL de l'affiche ou image par défaut

      const li = document.createElement('li');  
      li.className = 'splide__slide';  
      // Crée la slide

      li.innerHTML = `  
        <a href="cinemustFilm.html?id=${data.id}" class="slide-link" style="text-decoration:none;color:inherit;">  
          <img src="${posterUrl}" alt="${data.title}" loading="lazy">  
          <h3>${data.title}</h3>  
          <p>${data.release_date ? data.release_date.slice(0,4) : "N/A"}</p>  
        </a>  
      `;  
      listEl.appendChild(li);  
      slides.push(li);  
      // Ajoute la slide au slider
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
      // Slider automatique toutes les 3 secondes
    } else console.warn("Splide non chargé : le slider n'aura pas d'animations.");  
  }  

  // ---------- Page résultat TMDB ----------
  async function loadResultPage() {  
    const resultsEl = qs('#results');  
    // Conteneur où afficher les résultats

    if (!resultsEl) return;  
    // Si pas de conteneur -> quitter

    const params = new URLSearchParams(window.location.search);  
    // Récupère les paramètres GET de l'URL

    const query = params.get('q') || params.get('movie') || '';  
    // Récupère la valeur recherchée

    if (!query.trim()) { safeText(resultsEl, "Aucun film spécifié."); return; }  
    // Si rien -> message et quitter

    safeText(resultsEl, "Chargement...");  
    // Message pendant le fetch

    const movies = await fetchMovieSearch(query);  
    if (!movies) { safeText(resultsEl, "Aucun film trouvé."); return; }  
    // Si aucun film trouvé -> message et quitter

    resultsEl.innerHTML = "";  
    // Vide le conteneur avant d'ajouter les résultats

    movies.forEach(movie => {  
      const link = document.createElement("a");  
      link.href = `cinemustFilm.html?id=${movie.id}`;  
      link.style.textDecoration = "none";  
      link.style.color = "inherit";  
      // Crée un lien cliquable vers la page film

      const card = document.createElement("div");  
      card.className = "movie-card";  
      // Crée la carte film

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
      // Ajoute la carte dans le lien puis dans le conteneur
    });  
  }  

  // ---------- DOM ready ----------
  document.addEventListener('DOMContentLoaded', () => {  
    initSidePanel();  
    // Initialisation panneau latéral

    initBoxHeadings();  
    // Initialisation toggles accessibles

    const logo = qs('#image-responsive');  
    if (logo) {  
      logo.style.cursor = 'pointer';  
      logo.addEventListener('click', () => { window.location.href = 'cinemustAcceuil.html'; });  
      // Clic sur logo -> accueil
    }  

    if (qs('#slider-films')) loadHomeMovies();  
    // Si présence du slider -> charger films

    loadResultPage();  
    // Charger les résultats si page résultat
  });  

})();  
