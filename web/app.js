document.addEventListener('DOMContentLoaded', () => {
    // Cache des éléments du DOM pour éviter les accès répétés
    const domElements = {
        generateButton: document.getElementById('generateButton'), // Bouton de génération
        jsonFileInput: document.getElementById('jsonFile'), // Entrée de fichier JSON
        resetZoomButton: document.getElementById('resetZoom'), // Bouton de réinitialisation du zoom
        percentageSlider: document.getElementById('percentageSlider'), // Curseur de pourcentage
        controls: document.querySelector('.controls'), // Zone de contrôles
        chartContainer: document.getElementById('chart').getContext('2d') // Conteneur du graphique
    };

    let originalData = null; // Les données JSON originales
    let selectedHosts = []; // Les hôtes sélectionnés
    let isDragging = false; // Indique si le curseur est en train d'être glissé
    let lastUpdated = null; // Dernière mise à jour du graphique
    const colorArray = Array.from({ length: 100 }, generateRandomColor); // Tableau de couleurs aléatoires
    let ipColors = {}; // Couleurs spécifiques aux adresses IP

    
    //--------------------------------Benchmark--------------------------------\\
    /**
    * Effectue un benchmark d'une fonction donnée en mesurant le temps d'exécution.
     * @param {function} actionFunction La fonction à mesurer.
    * @returns {number} Le temps d'exécution en millisecondes.
    */
    function benchmark(actionFunction) {
       const startTime = performance.now(); // Enregistrez l'heure de début
        actionFunction(); // Exécutez la fonction d'action
        const endTime = performance.now(); // Enregistrez l'heure de fin
       const elapsedTime = endTime - startTime; // Calculez le temps écoulé en millisecondes
       return elapsedTime; // Retournez le temps écoulé
    }
    //--------------------------------        --------------------------------\\


    
    // Initialisation des écouteurs d'événements
    function attachEventListeners() {
        domElements.generateButton.addEventListener('click', handleGenerateButtonClick); // Clique sur le bouton de génération
        domElements.resetZoomButton.addEventListener('click', handleResetZoom); // Clique sur le bouton de réinitialisation du zoom
        domElements.percentageSlider.addEventListener('mousedown', handleMouseDown); // Clic sur le curseur de pourcentage
        domElements.percentageSlider.addEventListener('mousemove', handleSliderMove); // Déplacement du curseur de pourcentage
        domElements.percentageSlider.addEventListener('mouseup', handleMouseUp); // Relâchement du curseur de pourcentage
        domElements.controls.addEventListener('change', handleControlChange); // Changement dans la zone de contrôles
    }

    // Réinitialise le zoom du graphique
    function handleResetZoom() {
        if (window.myChart) {
            window.myChart.resetZoom();
        }
    }

    // Gère le clic sur le curseur de pourcentage
    function handleMouseDown() {
        isDragging = true;
    }

    // Gère le relâchement du curseur de pourcentage
    function handleMouseUp() {
        isDragging = false;
    }

    // Suppression des écouteurs d'événements pour éviter les fuites de mémoire
    function detachEventListeners() {
        domElements.generateButton.removeEventListener('click', handleGenerateButtonClick);
        domElements.resetZoomButton.removeEventListener('click', handleResetZoom);
        domElements.percentageSlider.removeEventListener('mousedown', handleMouseDown);
        domElements.percentageSlider.removeEventListener('mousemove', handleSliderMove);
        domElements.percentageSlider.removeEventListener('mouseup', handleMouseUp);
        domElements.controls.removeEventListener('change', handleControlChange);
    }

    // Gère le clic sur le bouton de génération
    async function handleGenerateButtonClick() {
        const jsonFile = domElements.jsonFileInput.files[0];
        if (!jsonFile) return alert("Veuillez choisir un fichier JSON.");
    
        const generateStartTime = performance.now(); // Enregistrez l'heure de début de la génération du graphique initial
    
        try {
            originalData = await readFileAsJSON(jsonFile);
            if (typeof originalData !== 'object') {
                return alert("Le fichier JSON doit contenir un objet.");
            }
    
            // Générez le graphique initial
            generateChart(originalData);
    
            const generateEndTime = performance.now(); // Enregistrez l'heure de fin de la génération du graphique initial
            const generateChartTime = generateEndTime - generateStartTime; // Calculez le temps de génération du graphique initial
            console.log(`Temps de génération du graphique initial : ${generateChartTime} ms`);
        } catch (error) {
            alert("Erreur lors de la lecture du fichier JSON.");
        }
    }
    

    // Gère le déplacement du curseur de pourcentage
    function handleSliderMove() {
        if (isDragging && originalData && (!lastUpdated || Date.now() - lastUpdated > 200)) {
            lastUpdated = Date.now();
            updateChart(originalData);
        }
    }

// Gère les changements dans la zone de contrôles
function handleControlChange(e) {
    const target = e.target;
    const host = target.dataset.ip;

    if (target.type === 'checkbox') {
        if (target.checked) {
            selectedHosts.push(host);
        } else {
            selectedHosts = selectedHosts.filter(h => h !== host);
        }

        // Ajoutez un marqueur de temps pour mesurer le temps d'affichage du graphique après la sélection
        const displayStartTime = performance.now(); // Enregistrez l'heure de début de l'affichage du graphique
        updateChart(originalData);
        const displayEndTime = performance.now(); // Enregistrez l'heure de fin de l'affichage du graphique
        const displayChartTime = displayEndTime - displayStartTime; // Calculez le temps d'affichage du graphique
        console.log(`Temps d'affichage du graphique après la sélection : ${displayChartTime} ms`);
    } else if (target.type === 'color') {
            ipColors[window.myChart.data.datasets[target.dataset.index].label] = target.value;
            window.myChart.data.datasets[target.dataset.index].borderColor = target.value;
            window.myChart.update();
        }
    }

    // Lit un fichier JSON en tant que promesse
    function readFileAsJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(JSON.parse(reader.result));
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Ajoute des contrôles pour une adresse IP donnée
    function addControlsForIP(ip, color, index) {
        const fragment = document.createDocumentFragment();
        const colorPicker = createColorPicker(ip, color, index);
        const checkbox = createCheckbox(ip);
        fragment.append(colorPicker, checkbox);
        domElements.controls.appendChild(fragment);
    }

    // Crée un sélecteur de couleur pour une adresse IP donnée
    function createColorPicker(ip, color, index) {
        const input = document.createElement("input");
        input.type = "color";
        input.dataset.index = index;
        input.value = color;
        return input;
    }

    // Crée une case à cocher pour une adresse IP donnée
    function createCheckbox(ip) {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.dataset.ip = ip;
        input.checked = selectedHosts.includes(ip);
        return input;
    }

    // Génère une couleur aléatoire
    function generateRandomColor() {
        return `#${Array.from({ length: 3 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')}`;
    }

    // Traite les données pour afficher dans le graphique
    function processData(data) {
        // Réinitialise les contrôles pour les nouvelles données
        domElements.controls.innerHTML = "";
        const percentage = domElements.percentageSlider.value;
    
        return Object.entries(data).map(([ip, ipData], index) => {
            const color = ipColors[ip] || colorArray[index % colorArray.length];
            addControlsForIP(ip, color, index);
            const resultsToShow = ipData.Resultats.slice(0, Math.floor(ipData.Resultats.length * (percentage / 100)));

            return {
                label: ip,
                data: resultsToShow.map(item => item.TempsAllerRetour),
                fill: false,
                borderColor: color,
                pointBackgroundColor: resultsToShow.map(item => item.Statut === "Success" ? "green" : "red"),
                pointRadius: resultsToShow.map(item => item.Statut === "Success" ? 5 : 10),
                dates: resultsToShow.map(item => new Date(item.Date).toLocaleString()),
                nomPoste: ipData.NomPoste,
                numeroDossier: ipData.NumeroDossier,
                hidden: !selectedHosts.includes(ip)
            };
        });
    }

    // Génère le graphique
    function generateChart(data) {
        const datasets = processData(data);
        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }

        window.myChart = new Chart(domElements.chartContainer, {
            type: 'line',
            data: {
                labels: datasets[0].dates,
                datasets: datasets,
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Index'
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Latence'
                        },
                        beginAtZero: true,
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const dataset = context.dataset;
                                return `Adresse: ${dataset.label}\nNom du poste: ${dataset.nomPoste}\nNuméro de dossier: ${dataset.numeroDossier}\nDate: ${dataset.dates[context.dataIndex]}`;
                            }
                        }
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            drag: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true,
                            },
                            mode: 'x',
                        }
                    }
                }
            }
        });
    }

    // Met à jour le graphique avec de nouvelles données
    function updateChart(data) {
        const datasets = processData(data);
        window.myChart.data.datasets = datasets;
        window.myChart.update();
    }

    // Nettoyez les ressources et détachez les écouteurs d'événements pour éviter les fuites de mémoire
    function cleanup() {
        detachEventListeners();
        if (window.myChart) {
            window.myChart.destroy();
            window.myChart = null;
        }
        originalData = null;
        selectedHosts = [];
    }

    // Lorsque la page est sur le point d'être déchargée, nettoyez les ressources pour éviter les fuites de mémoire.
    window.addEventListener('beforeunload', cleanup);

    // Ajoutez les écouteurs d'événements maintenant
    attachEventListeners();
});
