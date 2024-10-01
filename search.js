// Add this to your script.js file

// Get the geoloc-button element
const geolocButton = document.getElementById('geoloc-button');

// Add an event listener to the search button
document.getElementById('search-button').addEventListener('click', function() {
  // Get the search input element
  const searchInput = document.getElementById('search-input');
  
  // Toggle the display style of the search input element
  if (searchInput.style.display === 'none') {
    searchInput.style.display = 'flex';
  } else {
    searchInput.style.display = 'none';
  }
  
  // Toggle the display style of the geoloc-button element
  if (geolocButton.style.display === 'flex') {
    geolocButton.style.display = 'none';
  } else {
    geolocButton.style.display = 'flex';
  }
});

// Set the initial display style of the geoloc-button element
geolocButton.style.display = 'flex';