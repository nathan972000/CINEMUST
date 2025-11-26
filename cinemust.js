// Script pour ouvrir/fermer les textes des boîtes
(function () {
  const headings = document.querySelectorAll('#text-box-1 h2, #text-box-2 h2');

  function toggle(h) {
    const parent = h.parentElement;
    const open = parent.classList.toggle('open');
    h.setAttribute('aria-expanded', open);
  }

  headings.forEach(h => {
    h.setAttribute('tabindex', '0');
    h.setAttribute('role', 'button');
    h.setAttribute('aria-expanded', 'false');

    h.addEventListener('click', () => toggle(h));
    h.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(h);
      }
    }); 
  });
})();

// --------------------
// TMDB Top 10 films
// --------------------
const apiKey = "01db85cd9d534dc448cc5b69d1b2e5d3";
const movies = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Interstellar",
  "Gladiator",
  "Avatar"
];

async function fetchMovie(title) {
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`);
  const data = await res.json();
  if (data.results && data.results.length > 0) return data.results[0];
  return null;
}

async function loadMovies() {
  const list = document.querySelector("#slider-films .splide__list");

  // Vide la liste pour éviter les doublons
  list.innerHTML = "";

  for (const title of movies) {
    const data = await fetchMovie(title);
    if (data) {
      const posterUrl = data.poster_path ? "https://image.tmdb.org/t/p/w500" + data.poster_path : "film-default.jpg";
      const li = document.createElement("li");
      li.classList.add("splide__slide");
      li.innerHTML = `
        <img src="${posterUrl}" alt="${data.title}" style="width:200px;">
        <h3>${data.title}</h3>
        <p>${data.release_date ? data.release_date.slice(0,4) : "N/A"}</p>
      `;
      list.appendChild(li);
    }
  }

  new Splide('#slider-films', {
    type: 'loop',
    perPage: 4,
    gap: '20px',
    drag: 'free',
    focus: 'center',
    autoScroll: { speed: 1 }
  }).mount(window.splide.Extensions);
}

// **Important : on lance le slider**
loadMovies();
