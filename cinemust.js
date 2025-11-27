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
const movies = ["Inception","Interstellar","The Matrix","Pulp Fiction","Avatar",
                "The Godfather","The Dark Knight","Fight Club","Forrest Gump","Gladiator",
                "The Shawshank Redemption","Jurassic Park","Titanic","The Lion King","Avengers: Endgame"];

async function fetchMovie(title) {
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`);
  const data = await res.json();
  if (data.results && data.results.length > 0) return data.results[0];
  return null;
}

  async function loadMovies() {
    const list = document.querySelector("#slider-films .splide__list");
    list.innerHTML = "";

    for (const title of movies) {
      const data = await fetchMovie(title);
      if (data) {
        const posterUrl = data.poster_path ? "https://image.tmdb.org/t/p/w500" + data.poster_path : "film-default.jpg";
        const li = document.createElement("li");
        li.classList.add("splide__slide");
        li.innerHTML = `
          <img src="${posterUrl}" alt="${data.title}" style="width:100%; border-radius:5px;">
          <h3>${data.title}</h3>
          <p>${data.release_date ? data.release_date.slice(0,4) : "N/A"}</p>
        `;
        list.appendChild(li);
      }
    }

    const splide = new Splide('#slider-films', {
      type: 'loop',
      perPage: 5,
      gap: '5px',
      drag: 'free',
      focus: 0,
      pagination: false,
      arrows: true
    })
    splide.mount();
      
    
  updateDots(0); // premier film actif par défaut

  // Auto-scroll manuel
  let currentIndex = 0;
  setInterval(() => {
    currentIndex = (currentIndex + 1) % movies.length;
    splide.go(currentIndex);
    updateDots(currentIndex);
  }, 3000); // change de film toutes les 3 secondes
}

let currentIndex = 0;
const intervalTime = 3000; // 3 secondes
const pauseTime = 3000;    // pause à la fin

function autoScrollStep() {
  currentIndex++;
  if (currentIndex >= movies.length) {
    // dernière slide atteinte
    setTimeout(() => {
      currentIndex = 0;        // revenir au début
      splide.go(currentIndex); // afficher la première slide
      setTimeout(autoScrollStep, intervalTime); // relancer l’auto-scroll
    }, pauseTime);
  } else {
    splide.go(currentIndex);
    setTimeout(autoScrollStep, intervalTime);
  }
}

// démarrer l’auto-scroll
setTimeout(autoScrollStep, intervalTime);
loadMovies();

// rediriger vers la page d'accueil quand on clique sur "Menu"
const menuLink = document.getElementById('side-panel-title');
if(menuLink){
  menuLink.style.cursor = "pointer"; // montrer que c'est cliquable
  menuLink.addEventListener('click', () => {
    window.location.href = "cinemustAcceuil.html"; // chemin vers la page d'accueil
  });
}
