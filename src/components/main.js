import { PokemonAPI } from './pokemonAPI.js';
import { PokemonFuser } from './pokemonFuser.js';
import { ImageGenerator } from './imageGenerator.js';
import { StorageManager } from './storageManager.js';

class PokemonFusionGame {
  constructor() {
    this.api = new PokemonAPI();
    this.fuser = new PokemonFuser();
    this.imageGenerator = new ImageGenerator();
    this.storage = new StorageManager();
    
    this.pokemon1Select = document.getElementById('pokemon1');
    this.pokemon2Select = document.getElementById('pokemon2');
    this.pokemon3Select = document.getElementById('pokemon3');
    this.pokemon1Display = document.getElementById('pokemon1-display');
    this.pokemon2Display = document.getElementById('pokemon2-display');
    this.pokemon3Display = document.getElementById('pokemon3-display');
    this.fuseButton = document.getElementById('fuse-btn');
    this.loadingElement = document.getElementById('loading');
    this.fusionResult = document.getElementById('fusion-result');
    this.fusionName = document.getElementById('fusion-name');
    this.fusionImage = document.getElementById('fusion-image');
    this.fusionStats = document.getElementById('fusion-stats');

    // Add new properties for fusion animation
    this.fusionAnimationContainer = null;
    this.fusionStage = null;
    this.createFusionAnimationElements();

    // Add new properties for search functionality
    this.pokemon1SearchInput = null;
    this.pokemon2SearchInput = null;
    this.pokemon3SearchInput = null;
    
    // Add new elements
    this.savedFusionsButton = document.getElementById('saved-fusions-btn');
    this.savedFusionsModal = document.getElementById('saved-fusions-modal');
    this.savedFusionsGrid = document.getElementById('saved-fusions-grid');
    this.closeModalButton = document.getElementById('close-modal-btn');
    
    // Wait for initialization to complete before hiding the splash screen
    this.initialize().then(() => {
      this.hideSplashScreen();
      this.renderSavedFusions(); // Initial render of saved fusions
    });

    this.thirdPokemonContainer = document.getElementById('third-pokemon-container');
    this.addThirdButton = document.getElementById('add-third-btn');
    this.isThirdPokemonEnabled = false;

    this.setupEventListeners();
  }

  createFusionAnimationElements() {
    // Create container
    this.fusionAnimationContainer = document.createElement('div');
    this.fusionAnimationContainer.className = 'fusion-animation-container';
    
    // Create stage
    this.fusionStage = document.createElement('div');
    this.fusionStage.className = 'fusion-stage';
    
    this.fusionAnimationContainer.appendChild(this.fusionStage);
    document.body.appendChild(this.fusionAnimationContainer);
  }

  createSearchInput(container, select) {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'pokemon-select-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = 'Search Pokémon...';
    
    const searchIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    searchIcon.setAttribute('class', 'search-icon');
    searchIcon.setAttribute('viewBox', '0 0 24 24');
    searchIcon.setAttribute('fill', 'none');
    searchIcon.innerHTML = `
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
    `;
    
    // Move the select element into the search container
    select.parentNode.insertBefore(searchContainer, select);
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(select);
    
    // Set up search functionality
    searchInput.addEventListener('input', (e) => this.filterPokemon(e.target.value, select));
    
    // Add focus handling for visual feedback
    searchInput.addEventListener('focus', () => {
      searchContainer.classList.add('focused');
      select.style.display = 'block';
    });
    
    select.addEventListener('change', () => {
      searchInput.value = select.options[select.selectedIndex].text;
      searchInput.blur();
    });
    
    return searchInput;
  }

  filterPokemon(searchTerm, select) {
    const optgroups = select.getElementsByTagName('optgroup');
    const term = searchTerm.toLowerCase();
    let hasVisibleOptions = false;
    let firstVisibleOption = null;
    
    Array.from(optgroups).forEach(optgroup => {
      const options = optgroup.getElementsByTagName('option');
      let groupHasVisibleOptions = false;
      
      Array.from(options).forEach(option => {
        const pokemonName = option.textContent.toLowerCase();
        const matches = pokemonName.includes(term);
        option.style.display = matches ? '' : 'none';
        if (matches) {
          groupHasVisibleOptions = true;
          hasVisibleOptions = true;
          if (!firstVisibleOption) {
            firstVisibleOption = option;
          }
        }
      });
      
      optgroup.style.display = groupHasVisibleOptions ? '' : 'none';
    });
    
    // If no matches found, show a "No results" option
    let noResultsOption = select.querySelector('.no-results');
    if (!hasVisibleOptions) {
      if (!noResultsOption) {
        noResultsOption = document.createElement('option');
        noResultsOption.className = 'no-results';
        noResultsOption.disabled = true;
        noResultsOption.textContent = 'No Pokémon found';
        select.appendChild(noResultsOption);
      }
    } else if (noResultsOption) {
      noResultsOption.remove();
    }
    
    // Auto-select first visible option if there's a search term
    if (searchTerm && firstVisibleOption) {
      firstVisibleOption.selected = true;
      this.updatePokemonDisplay(select, 
        select === this.pokemon1Select ? this.pokemon1Display : 
        select === this.pokemon2Select ? this.pokemon2Display : 
        this.pokemon3Display
      );
    }
  }

  async initialize() {
    try {
      this.pokemonList = await this.api.getPokemonList();
      this.populateSelects(this.pokemonList);
      
      // Pre-fetch default Pokemon details to speed up sprite loading
      await Promise.all([
        this.api.getPokemonDetails('pikachu'),
        this.api.getPokemonDetails('arceus'),
        this.api.getPokemonDetails('dragonite')
      ]);
      
      // Create search inputs after populating selects
      this.pokemon1SearchInput = this.createSearchInput(this.pokemon1Select.parentNode, this.pokemon1Select);
      this.pokemon2SearchInput = this.createSearchInput(this.pokemon2Select.parentNode, this.pokemon2Select);
      this.pokemon3SearchInput = this.createSearchInput(this.pokemon3Select.parentNode, this.pokemon3Select);
      
      // Set default selections
      this.pokemon1Select.value = 'pikachu';
      this.pokemon2Select.value = 'arceus';
      this.pokemon3Select.value = 'dragonite';
      
      // Update the search input values to match
      this.pokemon1SearchInput.value = 'Pikachu';
      this.pokemon2SearchInput.value = 'Arceus';
      this.pokemon3SearchInput.value = 'Dragonite';
      
      // Update displays with default selections
      await Promise.all([
        this.updatePokemonDisplay(this.pokemon1Select, this.pokemon1Display),
        this.updatePokemonDisplay(this.pokemon2Select, this.pokemon2Display),
        this.updatePokemonDisplay(this.pokemon3Select, this.pokemon3Display)
      ]);
      
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  }

  populateSelects(pokemonList) {
    const createOptions = (select) => {
      let currentRegion = '';
      
      pokemonList.forEach(pokemon => {
        // Add region optgroup if we're starting a new region
        if (pokemon.region !== currentRegion) {
          currentRegion = pokemon.region;
          const optgroup = document.createElement('optgroup');
          optgroup.label = currentRegion;
          select.appendChild(optgroup);
        }
        
        const option = document.createElement('option');
        option.value = pokemon.name;
        option.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        // Add option to the current optgroup
        select.lastChild.appendChild(option);
      });
    };

    createOptions(this.pokemon1Select);
    createOptions(this.pokemon2Select);
    createOptions(this.pokemon3Select);
  }

  setupEventListeners() {
    this.pokemon1Select.addEventListener('change', () => 
      this.updatePokemonDisplay(this.pokemon1Select, this.pokemon1Display));
    
    this.pokemon2Select.addEventListener('change', () => 
      this.updatePokemonDisplay(this.pokemon2Select, this.pokemon2Display));
    
    this.pokemon3Select.addEventListener('change', () => 
      this.updatePokemonDisplay(this.pokemon3Select, this.pokemon3Display));
    
    this.fuseButton.addEventListener('click', () => this.fusePokemon());
    
    this.savedFusionsButton.addEventListener('click', () => this.toggleSavedFusionsModal());
    this.closeModalButton.addEventListener('click', () => this.toggleSavedFusionsModal());
    
    // Close modal on outside click
    this.savedFusionsModal.addEventListener('click', (e) => {
      if (e.target === this.savedFusionsModal) {
        this.toggleSavedFusionsModal();
      }
    });

    // Add random Pokemon selection button
    const randomPokemonBtn = document.getElementById('random-pokemon-btn');
    randomPokemonBtn.addEventListener('click', () => this.randomizePokemon());

    // Add third Pokemon button handler
    this.addThirdButton.addEventListener('click', () => {
      this.isThirdPokemonEnabled = !this.isThirdPokemonEnabled;
      this.addThirdButton.classList.toggle('active');
      this.thirdPokemonContainer.classList.toggle('visible');
      
      // Update fusion button text
      this.fuseButton.textContent = this.isThirdPokemonEnabled ? 
        'Create Tri-Fusion' : 'Create Fusion';
    });

    // Update random button to consider third Pokemon state
  }

  async randomizePokemon() {
    try {
      // Ensure pokemon list is loaded
      if (!this.pokemonList) {
        this.pokemonList = await this.api.getPokemonList();
      }

      // Randomly select two or three Pokemon
      const numPokemon = this.isThirdPokemonEnabled ? 3 : 2;
      const selectedPokemon = [];
      while (selectedPokemon.length < numPokemon) {
        const randomIndex = Math.floor(Math.random() * this.pokemonList.length);
        const pokemon = this.pokemonList[randomIndex];
        
        // Ensure no duplicates
        if (!selectedPokemon.some(p => p.name === pokemon.name)) {
          selectedPokemon.push(pokemon);
        }
      }

      // Update selects and displays
      const selects = [this.pokemon1Select, this.pokemon2Select, this.pokemon3Select];
      const displays = [this.pokemon1Display, this.pokemon2Display, this.pokemon3Display];
      const searchInputs = [
        this.pokemon1SearchInput, 
        this.pokemon2SearchInput, 
        this.pokemon3SearchInput
      ];

      for (let i = 0; i < numPokemon; i++) {
        selects[i].value = selectedPokemon[i].name;
        searchInputs[i].value = selectedPokemon[i].name.charAt(0).toUpperCase() + 
                             selectedPokemon[i].name.slice(1);
        await this.updatePokemonDisplay(selects[i], displays[i]);
      }

      // Add animation to random button
      const randomBtn = document.getElementById('random-pokemon-btn');
      randomBtn.style.animation = 'spin 0.5s ease-out';
      setTimeout(() => {
        randomBtn.style.animation = '';
      }, 500);

    } catch (error) {
      console.error('Failed to randomize Pokemon:', error);
    }
  }

  async updatePokemonDisplay(select, display) {
    // Show a placeholder spinner while loading
    display.innerHTML = `<svg width="50" height="50" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" stroke="var(--primary-color)" stroke-width="5" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>`;
    try {
      display.style.animation = 'scaleIn 0.5s ease-out';
      const pokemon = await this.api.getPokemonDetails(select.value);
      display.innerHTML = `<img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">`;
    } catch (error) {
      console.error('Failed to update pokemon display:', error);
      display.innerHTML = 'Failed to load Pokemon';
    }
  }

  async performFusionAnimation(pokemon1Img, pokemon2Img, pokemon3Img, fusedPokemonImg) {
    return new Promise((resolve) => {
      this.fusionStage.innerHTML = '';
      
      const pokemon1Element = document.createElement('div');
      pokemon1Element.className = 'fusion-pokemon left';
      pokemon1Element.style.setProperty('--start-x', '-120px');
      pokemon1Element.innerHTML = `
        <div class="pokemon-glow"></div>
        <img src="${pokemon1Img}" alt="Pokemon 1">
        <div class="energy-particles"></div>
      `;
      
      const pokemon2Element = document.createElement('div');
      pokemon2Element.className = 'fusion-pokemon middle';
      pokemon2Element.style.setProperty('--start-x', '0px');
      pokemon2Element.innerHTML = `
        <div class="pokemon-glow"></div>
        <img src="${pokemon2Img}" alt="Pokemon 2">
        <div class="energy-particles"></div>
      `;
      
      const pokemon3Element = document.createElement('div');
      pokemon3Element.className = 'fusion-pokemon right';
      pokemon3Element.style.setProperty('--start-x', '120px');
      pokemon3Element.innerHTML = `
        <div class="pokemon-glow"></div>
        <img src="${pokemon3Img}" alt="Pokemon 3">
        <div class="energy-particles"></div>
      `;
      
      const fusedPokemonElement = document.createElement('div');
      fusedPokemonElement.className = 'fusion-result-preview';
      fusedPokemonElement.innerHTML = `
        <div class="fusion-glow"></div>
        <img src="${fusedPokemonImg}" alt="Fused Pokemon">
        <div class="fusion-particles"></div>
      `;
      
      const energyBeam = document.createElement('div');
      energyBeam.className = 'energy-beam';
      
      this.fusionStage.appendChild(pokemon1Element);
      this.fusionStage.appendChild(pokemon2Element);
      this.fusionStage.appendChild(pokemon3Element);
      this.fusionStage.appendChild(energyBeam);
      this.fusionStage.appendChild(fusedPokemonElement);
      
      this.fusionAnimationContainer.classList.add('active');
      
      // Enhanced timing sequence
      setTimeout(() => {
        pokemon1Element.classList.add('animate-left');
        pokemon2Element.classList.add('animate-middle');
        pokemon3Element.classList.add('animate-right');
        
        setTimeout(() => {
          // Add charging phase
          pokemon1Element.classList.add('charging');
          pokemon2Element.classList.add('charging');
          pokemon3Element.classList.add('charging');
          this.createParticles(pokemon1Element.querySelector('.energy-particles'));
          this.createParticles(pokemon2Element.querySelector('.energy-particles'));
          this.createParticles(pokemon3Element.querySelector('.energy-particles'));
          
          setTimeout(() => {
            // Add energy beam
            energyBeam.classList.add('active');
            
            setTimeout(() => {
              // Collision phase
              pokemon1Element.classList.add('collision');
              pokemon2Element.classList.add('collision');
              pokemon3Element.classList.add('collision');
              energyBeam.classList.add('collapse');
              
              setTimeout(() => {
                // Fusion appearance
                fusedPokemonElement.classList.add('appear');
                this.createFusionParticles(fusedPokemonElement.querySelector('.fusion-particles'));
                
                setTimeout(() => {
                  this.fusionAnimationContainer.classList.remove('active');
                  resolve();
                }, 1200);
              }, 500);
            }, 600);
          }, 500);
        }, 500);
      }, 100);
    });
  }

  createParticles(container) {
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.setProperty('--delay', `${Math.random() * 1}s`);
      particle.style.setProperty('--rotation', `${Math.random() * 360}deg`);
      container.appendChild(particle);
    }
  }

  createFusionParticles(container) {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'fusion-particle';
      particle.style.setProperty('--delay', `${Math.random() * 0.5}s`);
      particle.style.setProperty('--angle', `${(i / 20) * 360}deg`);
      container.appendChild(particle);
    }
  }

  async fusePokemon() {
    try {
      // Reset theme before starting new fusion
      this.resetTheme();
      
      this.showLoading(true);
      
      const pokemon1 = await this.api.getPokemonDetails(this.pokemon1Select.value);
      const pokemon2 = await this.api.getPokemonDetails(this.pokemon2Select.value);
      const pokemon3 = this.isThirdPokemonEnabled ? 
        await this.api.getPokemonDetails(this.pokemon3Select.value) : null;
      
      // Generate fusion data
      const fusionData = await this.fuser.createFusion(pokemon1, pokemon2, pokemon3);
      
      // Generate fusion image
      const imagePrompt = await this.fuser.generateImagePrompt(fusionData, { 
        pokemon1Name: pokemon1.name, 
        pokemon2Name: pokemon2.name,
        pokemon3Name: pokemon3 ? pokemon3.name : null
      });
      const fusionImageUrl = await this.imageGenerator.generateImage(imagePrompt);
      
      // Perform fusion animation with conditional third Pokemon
      await this.performFusionAnimation(
        pokemon1.sprites.front_default,
        pokemon2.sprites.front_default,
        pokemon3 ? pokemon3.sprites.front_default : null,
        fusionImageUrl
      );
      
      this.displayFusionResult(fusionData, fusionImageUrl);
    } catch (error) {
      console.error('Failed to fuse pokemon:', error);
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    if (show) {
      this.loadingElement.classList.remove('hidden');
      this.fusionResult.classList.add('hidden');
    } else {
      this.loadingElement.classList.add('hidden');
      this.fusionResult.classList.remove('hidden');
      // Trigger animations
      this.fusionResult.style.animation = 'scaleIn 0.5s ease-out forwards';
    }
  }

  async displayFusionResult(fusionData, imageUrl) {
    this.fusionResult.classList.add('animate-in');
    this.fusionResult.classList.add('theme-container');
    
    // Generate theme colors based on Pokemon types
    const themeColors = this.generateThemeColors(fusionData.type);
    
    // Apply theme colors
    const root = document.documentElement;
    root.style.setProperty('--primary-color', themeColors.primary);
    root.style.setProperty('--secondary-color', themeColors.secondary);
    root.style.setProperty('--accent-color', themeColors.accent);
    
    // Add subtle gradient background to fusion result
    this.fusionResult.style.background = `linear-gradient(135deg, 
      ${themeColors.primary}15, 
      ${themeColors.secondary}15, 
      ${themeColors.accent}15)`;

    this.fusionName.textContent = fusionData.name;
    this.fusionImage.innerHTML = `
      <div class="fusion-image-container">
        <button class="download-button" aria-label="Download fusion image" title="Download image">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        <img src="${imageUrl}" alt="${fusionData.name}">
      </div>
    `;

    // Add click handler for the download button
    const downloadButton = this.fusionImage.querySelector('.download-button');
    if (downloadButton) {
      downloadButton.addEventListener('click', async () => {
        try {
          // Show loading state
          downloadButton.style.opacity = '0.5';
          downloadButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-dasharray="40" stroke-dashoffset="0">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          `;

          // Fetch the image and convert to blob
          const response = await fetch(imageUrl);
          const blob = await response.blob();

          // Create download link
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = `${fusionData.name.toLowerCase()}_fusion.jpg`;

          // Trigger download
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          // Clean up
          URL.revokeObjectURL(downloadLink.href);

          // Restore button state
          downloadButton.style.opacity = '1';
          downloadButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          `;
        } catch (error) {
          console.error('Failed to download image:', error);
          
          // Show error state briefly
          downloadButton.style.opacity = '1';
          downloadButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          `;

          setTimeout(() => {
            downloadButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            `;
          }, 2000);
        }
      });
    }

    const typeHtml = fusionData.type.map(type => 
      `<span class="type-tag type-${type.toLowerCase()}" style="animation: scaleIn 0.5s ease-out forwards">${type}</span>`
    ).join('');

    const maxStat = Math.max(...Object.values(fusionData.stats));
    const statsHtml = Object.entries(fusionData.stats).map(([stat, value], index) => {
      const percentage = (value / maxStat) * 100;
      const delay = index * 0.1;
      return `
        <div class="stat-bar" style="animation: slideUp 0.5s ease-out ${delay}s forwards">
          <div class="stat-bar-fill" style="width: ${percentage}%">
            <span class="stat-label">${this.formatStatName(stat)}</span>
            <span class="stat-value">${value}</span>
          </div>
        </div>
      `;
    }).join('');

    const abilitiesHtml = `
      <div class="abilities-section">
        <h3 style="animation: slideUp 0.5s ease-out forwards">Special Abilities</h3>
        <ul class="abilities-list">
          ${fusionData.abilities.map((ability, index) => 
            `<li class="ability-card" style="animation: scaleIn 0.5s ease-out ${index * 0.1}s forwards">
              <div class="ability-header">
                <span class="ability-name">${this.formatAbilityName(ability.name)}</span>
                <button class="ability-expand-btn" aria-label="Show ability description">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              <div class="ability-description hidden">
                ${ability.description}
              </div>
            </li>`
          ).join('')}
        </ul>
      </div>
    `;

    this.fusionStats.innerHTML = `
      <div class="types">${typeHtml}</div>
      <div class="description" style="animation: slideUp 0.5s ease-out forwards">${fusionData.description}</div>
      <h3 style="animation: slideUp 0.5s ease-out forwards">Base Stats</h3>
      <div class="stats-container">${statsHtml}</div>
      ${abilitiesHtml}
    `;

    // Initialize ability card click handlers
    const abilityCards = this.fusionStats.querySelectorAll('.ability-card');
    abilityCards.forEach(card => {
      const expandBtn = card.querySelector('.ability-expand-btn');
      const description = card.querySelector('.ability-description');
      let isExpanded = false;

      expandBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        description.classList.toggle('hidden');
        card.classList.toggle('expanded');
        expandBtn.classList.toggle('expanded');
        
        // Update ARIA attributes
        expandBtn.setAttribute('aria-expanded', isExpanded);
        description.setAttribute('aria-hidden', !isExpanded);
        
        // Update icon
        expandBtn.innerHTML = isExpanded ? 
          `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>` :
          `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>`;
      });
    });

    // Initialize stat bars with animation
    requestAnimationFrame(() => {
      const statBars = this.fusionStats.querySelectorAll('.stat-bar-fill');
      statBars.forEach(bar => {
        bar.style.width = bar.style.width;
      });
    });

    // Add save button
    const saveButton = document.createElement('button');
    saveButton.className = 'save-fusion-btn';
    saveButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      Save Fusion
    `;
    
    saveButton.addEventListener('click', () => this.saveFusion(fusionData, imageUrl));
    this.fusionResult.appendChild(saveButton);
  }

  formatStatName(stat) {
    const statIcons = {
      hp: '❤️',
      attack: '⚔️',
      defense: '🛡️',
      speed: '⚡',
      'special-attack': '🔮',
      'special-defense': '✨'
    };
  
    const formattedName = stat.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  
    return `${statIcons[stat] || ''} ${formattedName}`;
  }

  formatAbilityName(ability) {
    return ability.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  generateThemeColors(types) {
    if (!types || !Array.isArray(types) || types.length === 0) {
      return {
        primary: '#4285F4',
        secondary: '#EA4335',
        accent: '#FBBC05'
      };
    }

    const typeColors = {
      normal: '#9AA0A6',
      fire: '#EA4335',
      water: '#4285F4',
      electric: '#FBBC05',
      grass: '#34A853',
      ice: '#81D4FA',
      fighting: '#DB4437',
      poison: '#9334E6',
      ground: '#B8860B',
      flying: '#738AFE',
      psychic: '#E040FB',
      bug: '#4CAF50',
      rock: '#BF9976',
      ghost: '#7C4DFF',
      dragon: '#4A148C',
      dark: '#424242',
      steel: '#78909C',
      fairy: '#F06292'
    };

    const colors = types.map(type => {
      const lowerType = (type || '').toLowerCase();
      return typeColors[lowerType] || typeColors.normal;
    }).filter(Boolean);
    
    while (colors.length < 2) {
      colors.push(colors[0] || typeColors.normal);
    }

    return {
      primary: colors[0] || typeColors.normal,
      secondary: colors[1] || typeColors.normal,
      accent: this.adjustColor(colors[0] || typeColors.normal, 20)
    };
  }

  adjustColor(color, amount) {
    try {
      if (!color || typeof color !== 'string' || !color.startsWith('#')) {
        return '#4285F4';
      }

      const hex = color.replace('#', '');
      if (hex.length !== 6) {
        return '#4285F4';
      }

      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return '#4285F4';
      }

      const adjustedR = Math.min(255, Math.max(0, r + amount));
      const adjustedG = Math.min(255, Math.max(0, g + amount));
      const adjustedB = Math.min(255, Math.max(0, b + amount));

      const toHex = (n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };

      return `#${toHex(adjustedR)}${toHex(adjustedG)}${toHex(adjustedB)}`;
    } catch (error) {
      console.error('Error adjusting color:', error);
      return '#4285F4';
    }
  }

  resetTheme() {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', '#4285F4');
    root.style.setProperty('--secondary-color', '#EA4335');
    root.style.setProperty('--accent-color', '#FBBC05');
  }
  
  hideSplashScreen() {
    const progressBarFill = document.getElementById('progress-bar-fill');
    if (progressBarFill) {
      clearInterval(window.progressSimulation);
      progressBarFill.style.width = '100%';
      progressBarFill.style.transition = 'width 0.3s ease-out';
    }
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
      setTimeout(() => {
        splashScreen.classList.add('fade-out');
        splashScreen.addEventListener('transitionend', () => splashScreen.remove());
      }, 300);
    }
  }

  toggleSavedFusionsModal() {
    this.savedFusionsModal.classList.toggle('active');
    document.body.classList.toggle('modal-open');
  }

  async saveFusion(fusionData, imageUrl) {
    try {
      const savedFusion = {
        id: Date.now(),
        name: fusionData.name,
        types: fusionData.type,
        description: fusionData.description,
        stats: fusionData.stats,
        abilities: fusionData.abilities,
        imageUrl: imageUrl,
        timestamp: new Date().toISOString(),
        parents: {
          pokemon1: this.pokemon1Select.value,
          pokemon2: this.pokemon2Select.value,
          pokemon3: this.pokemon3Select.value
        }
      };

      await this.storage.saveFusion(savedFusion);
      this.renderSavedFusions();
    } catch (error) {
      console.error('Failed to save fusion:', error);
    }
  }

  async renderSavedFusions() {
    const fusions = await this.storage.getAllFusions();
    this.savedFusionsGrid.innerHTML = '';

    if (fusions.length === 0) {
      this.savedFusionsGrid.innerHTML = `
        <div class="no-fusions">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <p>No saved fusions yet! Create your first fusion to see it here.</p>
        </div>
      `;
      return;
    }

    for (const fusion of fusions) {
      const card = this.createFusionCard(fusion);
      this.savedFusionsGrid.appendChild(card);
    }
  }

  createFusionCard(fusion) {
    const card = document.createElement('div');
    card.className = 'fusion-card';
    card.innerHTML = `
      <div class="fusion-card-content">
        <div class="fusion-card-image-container">
          <img src="${fusion.imageUrl}" alt="${fusion.name}" loading="lazy">
          <div class="fusion-card-overlay">
            <button class="view-card-btn" aria-label="View TCG Card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 11v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8"/>
                <path d="M12 2l9 9-9-9z"/>
                <path d="M12 2L3 11"/>
                <path d="M12 2v19"/>
              </svg>
            </button>
            <button class="delete-fusion-btn" aria-label="Delete Fusion">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 6h18"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="fusion-card-info">
          <h3>${fusion.name}</h3>
          <div class="fusion-card-types">
            ${fusion.types.map(type => 
              `<span class="type-tag type-${type.toLowerCase()}">${type}</span>`
            ).join('')}
          </div>
          <div class="fusion-card-stats">
            ${Object.entries(fusion.stats).map(([stat, value]) => 
              `<div class="stat-mini">
                <span class="stat-label">${this.formatStatName(stat)}</span>
                <span class="stat-value">${value}</span>
              </div>`
            ).join('')}
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    const viewCardBtn = card.querySelector('.view-card-btn');
    viewCardBtn.addEventListener('click', () => this.showTCGCard(fusion));

    const deleteBtn = card.querySelector('.delete-fusion-btn');
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await this.storage.deleteFusion(fusion.id);
      this.renderSavedFusions();
    });

    return card;
  }

  async showTCGCard(fusion) {
    const modalContent = document.createElement('div');
    modalContent.className = 'tcg-card-modal';
    modalContent.innerHTML = `
      <div class="tcg-card">
        <div class="tcg-card-frame">
          <div class="tcg-card-header">
            <h2>${fusion.name}</h2>
            <div class="tcg-hp">HP ${fusion.stats.hp}</div>
          </div>
          <div class="tcg-card-image">
            <img src="${fusion.imageUrl}" alt="${fusion.name}">
          </div>
          <div class="tcg-card-types">
            ${fusion.types.map(type => 
              `<span class="type-tag type-${type.toLowerCase()}">${type}</span>`
            ).join('')}
          </div>
          <div class="tcg-card-abilities">
            ${fusion.abilities.map(ability => `
              <div class="tcg-ability">
                <h4>${ability.name}</h4>
                <p>${ability.description}</p>
              </div>
            `).join('')}
          </div>
          <div class="tcg-card-stats">
            <div class="tcg-stat">
              <span>Attack</span>
              <span>${fusion.stats.attack}</span>
            </div>
            <div class="tcg-stat">
              <span>Defense</span>
              <span>${fusion.stats.defense}</span>
            </div>
            <div class="tcg-stat">
              <span>Speed</span>
              <span>${fusion.stats.speed}</span>
            </div>
          </div>
          <div class="tcg-card-footer">
            <p>Parents: ${fusion.parents.pokemon1} + ${fusion.parents.pokemon2} + ${fusion.parents.pokemon3}</p>
            <p class="tcg-card-date">Created: ${new Date(fusion.timestamp).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.className = 'tcg-modal';
    modal.appendChild(modalContent);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));
  }
}

new PokemonFusionGame();

// Splash Screen Progress Simulation and keep it active until initialization is complete
document.addEventListener('DOMContentLoaded', () => {
  const progressBarFill = document.getElementById('progress-bar-fill');
  if (progressBarFill) {
    let progress = 0;
    const simulation = setInterval(() => {
      progress = Math.min(progress + Math.random() * 2, 90); // Slower progression, max 90%
      progressBarFill.style.transition = 'width 0.8s ease'; // Smoother transition
      progressBarFill.style.width = progress + '%';
    }, 150); // Longer interval for smoother appearance
    window.progressSimulation = simulation;
  }
});