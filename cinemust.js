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

 const axios = require('axios');
 const API_URL = 'https://www.omdbapi.com/';

 async function getMovieInfo(movieTitle, apiKey) {
   try {
     const response = await axios.get(API_URL, {
       params: {
         't': movieTitle,
         'apikey': '1a07a3df'
       }
     });

     return response.data;
   } catch (error) {
     console.error('Erreur lors de la récupération des informations du film:', error);
     throw error;
   }
 }

 
