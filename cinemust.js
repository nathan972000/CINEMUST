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
