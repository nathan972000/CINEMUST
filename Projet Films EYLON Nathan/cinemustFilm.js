(async function() {  
  // IIFE asynchrone : permet d'utiliser await dès le début et d'encapsuler tout le code pour éviter les variables globales

  // --- Constantes API ---
  const TMDB_API_KEY = "01db85cd9d534dc448cc5b69d1b2e5d3";  
  // Clé API TMDB pour accéder aux informations des films
  const TMDB_IMG_PREFIX = "https://image.tmdb.org/t/p/w500";  
  // Préfixe pour construire l'URL des affiches de films

  // --- Fonction utilitaire pour sélectionner un élément ---
  function qs(sel, ctx=document){ return ctx.querySelector(sel); }  
  // Raccourci pour document.querySelector avec contexte optionnel

  // --- Fonction pour récupérer les détails d'un film depuis TMDB ---
  async function fetchMovieDetails(id) {
    try {
      // URL API TMDB : append_to_response=videos,credits récupère la bande-annonce et le casting
      const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=videos,credits`;
      const res = await fetch(url); // Envoi de la requête HTTP
      if(!res.ok) throw new Error("Erreur API"); // Gestion des erreurs HTTP
      const data = await res.json(); // Conversion de la réponse en JSON

      // --- Extraction des informations importantes ---
      const poster = data.poster_path ? TMDB_IMG_PREFIX + data.poster_path : "";  
      // URL de l'affiche du film ou chaîne vide si pas d'image
      const title = data.title; // Titre du film
      const synopsis = data.overview; // Synopsis
      const note = data.vote_average; // Note moyenne
      const trailer = data.videos.results.find(v=>v.type==="Trailer" && v.site==="YouTube");  
      // Recherche la bande-annonce officielle sur YouTube
      const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;  
      // URL complète du trailer ou null
      const cast = data.credits.cast; // Liste des acteurs

      // Retourne un objet avec toutes les infos nécessaires
      return { poster, title, synopsis, note, trailerUrl, cast, release_date: data.release_date };
    } catch(err) {
      console.error(err); // Log en cas d'erreur API
      return null; // Retourne null si erreur
    }
  }

  // --- Fonction pour charger les infos du film sur la page ---
  async function loadFilmPage() {
    const params = new URLSearchParams(window.location.search);  
    // Récupère les paramètres GET de l'URL
    const movieId = params.get('id');  
    // Récupère l'id du film depuis l'URL
    if(!movieId) return;  
    // Si pas d'id, ne rien faire

    const details = await fetchMovieDetails(movieId);  
    // Appel à l'API pour récupérer les infos
    if(!details) return;  
    // Si erreur API -> sortie

    // --- Mise à jour du DOM avec les infos du film ---
    qs('#movie-poster').src = details.poster;  
    // Met l'affiche
    qs('#movie-title').textContent = details.title;  
    // Met le titre
    qs('#movie-note').textContent = `Note : ${details.note}/10`;  
    // Met la note
    qs('#movie-synopsis').textContent = details.synopsis;  
    // Met le synopsis

    // --- Bouton AlloCiné ---
    const allocineBtn = qs('#allocine-btn');  
    // Sélection du bouton
    if(allocineBtn) {
      const year = details.release_date ? details.release_date.substring(0,4) : "";  
      // Extraction de l'année de sortie
      const allocineUrl = `https://www.allocine.fr/rechercher/?q=${encodeURIComponent(details.title + " " + year)}`;  
      // URL recherche AlloCiné avec titre + année
      allocineBtn.addEventListener('click', () => window.open(allocineUrl, "_blank"));  
      // Ouvre AlloCiné dans un nouvel onglet
    }

    // --- Affichage des acteurs ---
    const actorsList = qs('.actors-list');  
    // Conteneur liste des acteurs
    if(actorsList) {
      actorsList.innerHTML = "";  
      // Réinitialisation du conteneur
      details.cast.slice(0, 10).forEach(actor => {  
        // Affiche les 10 premiers acteurs
        const card = document.createElement('div');  
        card.className = "actor-card";  
        // Carte pour chaque acteur

        const img = document.createElement('img');  
        img.src = actor.profile_path ? TMDB_IMG_PREFIX + actor.profile_path : "https://via.placeholder.com/150?text=No+Image";  
        img.alt = actor.name;  
        // Image de l'acteur ou placeholder

        const name = document.createElement('p');  
        name.className = "actor-name";  
        name.textContent = actor.name;  
        // Nom de l'acteur

        const role = document.createElement('p');  
        role.className = "actor-role";  
        role.textContent = actor.character || "";  
        // Rôle joué par l'acteur

        card.append(img, name, role);  
        // Ajout des éléments à la carte
        actorsList.appendChild(card);  
        // Ajout de la carte au conteneur
      });
    }

    // --- Affichage de la bande-annonce ---
    const trailerContainer = qs('#movie-trailer-container');  
    // Conteneur pour le trailer
    if(trailerContainer) {
      trailerContainer.innerHTML = '';  
      // Réinitialisation du conteneur
      if(details.trailerUrl) {
        const videoId = details.trailerUrl.split('v=')[1].split('&')[0];  
        // Extraction de l'ID YouTube
        const iframe = document.createElement('iframe');  
        iframe.src = `https://www.youtube.com/embed/${videoId}`;  
        // URL embed YouTube
        iframe.title = "Bande-annonce";  
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";  
        // Permissions iframe
        iframe.allowFullscreen = true;  
        // Autorise le plein écran
        trailerContainer.appendChild(iframe);  
        // Ajout de l'iframe au DOM
      }
    }
  }

  // --- DOM ready ---
  document.addEventListener('DOMContentLoaded', () => {
    loadFilmPage();  
    // Charge les infos du film au chargement de la page

    // --- Logo cliquable pour retour accueil ---
    const logo = qs('#image-responsive');  
    if(logo) {
      logo.style.cursor = 'pointer';  
      // Curseur main
      logo.addEventListener('click', ()=>{ window.location.href = 'cinemustAcceuil.html'; });  
      // Redirection vers l'accueil
    }
  });

})();  
// Fin de l'IIFE asynchrone
