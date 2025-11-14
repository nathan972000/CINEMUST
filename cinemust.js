const axios = require('axios');

async function searchMovies(query) {
  let maxRetries = 5; // Nombre max de tentatives API avant abandon
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data } = await axios.get(`${API_URL}/search/movie`, {
        params: { api_key: API_KEY, query }
      });
      return data.results;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error(`API request failed after ${maxRetries} attempts`);
        throw error;
      }
      console.warn(`API request failed, retrying...`);
    }
  }
}

// Exemple d'utilisation
searchMovies('The Matrix').then(results => {
  console.log(results);
}).catch(error => {
  console.error(error);
});

// Script pour ouvrir/fermer les textes des boîtes
(function () {
  const headings = document.querySelectorAll('#text-box-1 h2, #text-box-2 h2'); // Récupère tous les titres h2

  function toggle(h) {
    const parent = h.parentElement; // Boîte parente du titre
    const open = parent.classList.toggle('open'); // Ajoute/enlève la classe "open"
    h.setAttribute('aria-expanded', open); // Met à jour l'état pour l’accessibilité
  }

  headings.forEach(h => {
    h.setAttribute('tabindex', '0'); // Rend le titre sélectionnable au clavier
    h.setAttribute('role', 'button'); // Indique que le titre se comporte comme un bouton
    h.setAttribute('aria-expanded', 'false'); // État initial = fermé

    h.addEventListener('click', () => toggle(h)); // Ouvre/ferme au clic

    h.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(h); // Ouvre/ferme avec Entrée ou Espace
      }
    }); 
  });
})();
