import axios from 'axios';

/**
 * Scrapes an image URL from a given webpage.
 * @param {string} url - The URL of the webpage to scrape.
 * @returns {Promise<string>} - The URL of the first image found on the page.
 */
export async function scrapeImage(url = 'https://frinkiac.com/api/random') {
    try {
        // Fetch the HTML of the webpage
        const { data: html } = await axios.get(url);
        const { Episode, Timestamp } = html.Frame;

        const [season, episode] = separateSeasonEpisode(Episode);
        if (!season || !episode) {
            console.error("Invalid episode format"); return
        }
        // build url based on season and episode
        const imageUrl = `https://frinkiac.com/img/${Episode}/${Timestamp}.jpg`;

        return imageUrl;
    } catch (error) {
        console.error(`Error scraping image from ${url}:`, error);
        throw error;
    }
}

function separateSeasonEpisode(episodeString) {
    try {
      // Remove leading "S" and split by "E"
      const [season, episode] = episodeString.slice(1).split("E");
  
      // Convert season and episode to integers
      return [parseInt(season, 10), parseInt(episode, 10)];
    } catch (error) {
      // Handle invalid format errors (e.g., missing "S", non-numeric characters)
      return null;
    }
  }

// Example usage of the scrapeImage function
(async () => {
    try {
        const imageUrl = await scrapeImage();
        console.log('Scraped Image URL:', imageUrl);
    } catch (error) {
        console.error('Failed to scrape image:', error.message);
    }
})();