(async function() {
  const TMDB_API_KEY = "01db85cd9d534dc448cc5b69d1b2e5d3";
  const TMDB_IMG_PREFIX = "https://image.tmdb.org/t/p/w500";

  function qs(sel, ctx=document){ return ctx.querySelector(sel); }

  async function fetchMovieDetails(id) {
    try {
      const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=videos,credits`;
      const res = await fetch(url);
      if(!res.ok) throw new Error("Erreur API");
      const data = await res.json();

      const poster = data.poster_path ? TMDB_IMG_PREFIX + data.poster_path : "";
      const title = data.title;
      const synopsis = data.overview;
      const note = data.vote_average;
      const trailer = data.videos.results.find(v=>v.type==="Trailer" && v.site==="YouTube");
      const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

      // Renvoie le cast complet pour l’affichage des cartes
      const cast = data.credits.cast;

      return { poster, title, synopsis, note, trailerUrl, cast };
    } catch(err) { console.error(err); return null; }
  }

  async function loadFilmPage() {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');
    if(!movieId) return;

    const details = await fetchMovieDetails(movieId);
    if(!details) return;

    const posterEl = qs('#movie-poster');
    const titleEl = qs('#movie-title');
    const noteEl = qs('#movie-note');
    const actorsEl = qs('#movie-actors');
    const actorsList = actorsEl ? actorsEl.querySelector('.actors-list') : null;
    const synopsisEl = qs('#movie-synopsis');
    const trailerContainer = qs('#movie-trailer-container');

    if(posterEl) posterEl.src = details.poster;
    if(titleEl) titleEl.textContent = details.title;
    if(noteEl) noteEl.textContent = `Note : ${details.note}/10`;
    if(synopsisEl) synopsisEl.textContent = details.synopsis;

    // ---- AFFICHAGE DES ACTEURS ----
    if(actorsList) {
      actorsList.innerHTML = "";
      details.cast.slice(0, 10).forEach(actor => {
        const card = document.createElement('div');
        card.className = "actor-card";

        const img = document.createElement('img');
        img.src = actor.profile_path ? TMDB_IMG_PREFIX + actor.profile_path : "https://via.placeholder.com/150?text=No+Image";
        img.alt = actor.name;

        const name = document.createElement('p');
        name.className = "actor-name";
        name.textContent = actor.name;

        const role = document.createElement('p');
        role.className = "actor-role";
        role.textContent = actor.character || "";

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(role);
        actorsList.appendChild(card);
      });
    }

    // ---- TRAILER ----
    if(trailerContainer) {
      trailerContainer.innerHTML = '';
      if(details.trailerUrl) {
        const videoId = details.trailerUrl.split('v=')[1].split('&')[0];
        const iframe = document.createElement('iframe');
        iframe.width = "560";
        iframe.height = "315";
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.title = "Bande-annonce";
        iframe.frameBorder = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        trailerContainer.appendChild(iframe);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadFilmPage();

    // logo click -> accueil
    const logo = qs('#image-responsive');
    if(logo) {
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', ()=>{ window.location.href = 'cinemustAcceuil.html'; });
    }
  });
})();
