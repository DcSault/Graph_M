const darkModeToggle = document.getElementById('darkModeToggle');

// Vérifier le mode de couleur préféré du navigateur lors du chargement de la page
const preferredColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (preferredColorScheme) {
  enableDarkMode();
}

darkModeToggle.addEventListener('click', function () {
  toggleDarkMode();
});

// Fonction pour activer ou désactiver le mode sombre
function toggleDarkMode() {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  darkModeToggle.textContent = isDarkMode ? 'Désactiver le mode sombre' : 'Activer le mode sombre';
}

// Fonction pour activer le mode sombre
function enableDarkMode() {
  document.body.classList.add('dark-mode');
  darkModeToggle.textContent = 'Désactiver le mode sombre';
}
