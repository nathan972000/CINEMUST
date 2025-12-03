(async function() { // IIFE asynchrone pour exécuter le code immédiatement

  // --- Constantes API ---
  const TMDB_API_KEY = "01db85cd9d534dc448cc5b69d1b2e5d3"; // Clé API TMDB
  const TMDB_IMG_PREFIX = "https://image.tmdb.org/t/p/w500"; // Préfixe URL pour les images TMDB

  // --- Fonction utilitaire pour querySelector ---
  function qs(sel, ctx=document){ return ctx.querySelector(sel); } // Raccourci pour sélectionner un élément

  // --- Fonction pour récupérer les détails d'un film depuis TMDB ---
  async function fetchMovieDetails(id) {
    try {
      // URL API TMDB avec append_to_response pour vidéos et casting
      const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=videos,credits`;
      const res = await fetch(url); // Requête HTTP
      if(!res.ok) throw new Error("Erreur API"); // Gestion erreur HTTP
      const data = await res.json(); // Conversion en JSON

      // --- Extraction des informations importantes ---
      const poster = data.poster_path ? TMDB_IMG_PREFIX + data.poster_path : ""; // Poster
      const title = data.title; // Titre du film
      const synopsis = data.overview; // Synopsis
      const note = data.vote_average; // Note moyenne
      const trailer = data.videos.results.find(v=>v.type==="Trailer" && v.site==="YouTube"); // Recherche trailer YouTube
      const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null; // URL trailer
      const cast = data.credits.cast; // Casting du film

      // Retourne un objet avec toutes les infos nécessaires
      return { poster, title, synopsis, note, trailerUrl, cast, release_date: data.release_date };
    } catch(err) {
      console.error(err); // Log erreur si problème API
      return null; // Retourne null en cas d'erreur
    }
  }

  // --- Fonction pour charger les infos du film sur la page ---
  async function loadFilmPage() {
    const params = new URLSearchParams(window.location.search); // Récupère les paramètres URL
    const movieId = params.get('id'); // Récupère l'id du film
    if(!movieId) return; // Si pas d'id -> ne rien faire

    const details = await fetchMovieDetails(movieId); // Appel API
    if(!details) return; // Si erreur API -> sortie

    // --- Mise à jour du DOM avec les infos du film ---
    qs('#movie-poster').src = details.poster; // Poster
    qs('#movie-title').textContent = details.title; // Titre
    qs('#movie-note').textContent = `Note : ${details.note}/10`; // Note
    qs('#movie-synopsis').textContent = details.synopsis; // Synopsis

    // --- Bouton AlloCiné ---
    const allocineBtn = qs('#allocine-btn'); // Sélection du bouton
    if(allocineBtn) {
      const year = details.release_date ? details.release_date.substring(0,4) : ""; // Année sortie
      const allocineUrl = `https://www.allocine.fr/rechercher/?q=${encodeURIComponent(details.title + " " + year)}`; // URL recherche
      allocineBtn.addEventListener('click', () => window.open(allocineUrl, "_blank")); // Ouvre AlloCiné dans un nouvel onglet
    }

    // --- Affichage des acteurs ---
    const actorsList = qs('.actors-list'); // Conteneur liste acteurs
    if(actorsList) {
      actorsList.innerHTML = ""; // Réinitialisation
      details.cast.slice(0, 10).forEach(actor => { // Affiche les 10 premiers acteurs
        const card = document.createElement('div'); // Carte acteur
        card.className = "actor-card";

        const img = document.createElement('img'); // Image acteur
        img.src = actor.profile_path ? TMDB_IMG_PREFIX + actor.profile_path : "https://via.placeholder.com/150?text=No+Image";
        img.alt = actor.name; // Nom acteur

        const name = document.createElement('p'); // Nom acteur
        name.className = "actor-name";
        name.textContent = actor.name;

        const role = document.createElement('p'); // Rôle acteur
        role.className = "actor-role";
        role.textContent = actor.character || "";

        card.append(img, name, role); // Ajout des éléments à la carte
        actorsList.appendChild(card); // Ajout de la carte dans le conteneur
      });
    }

    // --- Affichage de la bande-annonce ---
    const trailerContainer = qs('#movie-trailer-container'); // Conteneur trailer
    if(trailerContainer) {
      trailerContainer.innerHTML = ''; // Réinitialisation
      if(details.trailerUrl) {
        const videoId = details.trailerUrl.split('v=')[1].split('&')[0]; // Extraction ID YouTube
        const iframe = document.createElement('iframe'); // Création iframe
        iframe.src = `https://www.youtube.com/embed/${videoId}`; // URL embed
        iframe.title = "Bande-annonce"; // Titre iframe
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"; // Permissions
        iframe.allowFullscreen = true; // Plein écran
        trailerContainer.appendChild(iframe); // Ajout iframe au DOM
      }
    }
  }

  // --- DOM ready ---
  document.addEventListener('DOMContentLoaded', () => {
    loadFilmPage(); // Charge le film à l'ouverture de la page

    // --- Logo cliquable pour retour accueil ---
    const logo = qs('#image-responsive');
    if(logo) {
      logo.style.cursor = 'pointer'; // Curseur main
      logo.addEventListener('click', ()=>{ window.location.href = 'cinemustAcceuil.html'; }); // Redirection accueil
    }
  });

})();
