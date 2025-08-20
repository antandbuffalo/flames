let animationInProgress = false;

// Turbo Mode Helper Function
function getAnimationTiming(normalTime) {
    const fastModeCheckbox = document.getElementById('fast-mode');
    const isFastMode = fastModeCheckbox && fastModeCheckbox.checked;
    return isFastMode ? Math.max(normalTime * 0.15, 50) : normalTime; // Turbo mode is 15% of normal speed, minimum 50ms
}

// Audio Management System
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isMuted = false;
        this.volume = 0.3; // Default volume (30%)
        this.isInitialized = false;
        this.initializeFromStorage();
        this.createAudioContext();
    }

    initializeFromStorage() {
        // Load user preferences from localStorage
        const audioSettings = localStorage.getItem('flamesAudioSettings');
        if (audioSettings) {
            const settings = JSON.parse(audioSettings);
            this.isMuted = settings.isMuted || false;
            this.volume = settings.volume !== undefined ? settings.volume : 0.3;
        }
    }

    saveToStorage() {
        // Save user preferences to localStorage
        localStorage.setItem('flamesAudioSettings', JSON.stringify({
            isMuted: this.isMuted,
            volume: this.volume
        }));
    }

    createAudioContext() {
        // Create AudioContext only when user interacts (respects autoplay policies)
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.isInitialized = true;
            } catch (e) {
                console.log('Web Audio API not supported');
                this.isInitialized = false;
            }
        }
    }

    async resumeAudioContext() {
        // Resume audio context if suspended (required by browser policies)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    playTone(frequency, duration, type = 'sine', fadeOut = true) {
        if (!this.isInitialized || this.isMuted || !this.audioContext) return;

        this.resumeAudioContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        
        if (fadeOut) {
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        }
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playChord(frequencies, duration, type = 'sine') {
        if (!this.isInitialized || this.isMuted || !this.audioContext) return;

        this.resumeAudioContext();

        frequencies.forEach(freq => {
            this.playTone(freq, duration, type, true);
        });
    }

    // Sound effect methods
    playButtonClick() {
        // Soft pop sound
        this.playTone(800, 0.1, 'triangle');
        setTimeout(() => this.playTone(600, 0.05, 'triangle'), 50);
    }

    playTransition() {
        // Gentle whoosh sound
        this.playTone(400, 0.3, 'sine');
        setTimeout(() => this.playTone(350, 0.2, 'sine'), 100);
    }

    playLetterStrike() {
        // Quick strike sound
        this.playTone(700, 0.15, 'triangle');
    }

    playCountingTick() {
        // Subtle tick for counting
        this.playTone(900, 0.08, 'square');
    }

    playResultReveal(resultType) {
        // Different celebration sounds for each result
        switch(resultType) {
            case 'Love':
                // Romantic chord
                this.playChord([523, 659, 784], 1.2); // C-E-G major
                break;
            case 'Marriage':
                // Wedding bells
                this.playChord([698, 880, 1047], 1.5); // F-A-C
                setTimeout(() => this.playChord([784, 988, 1175], 1.0), 300);
                break;
            case 'Friend':
                // Happy and upbeat
                this.playChord([587, 740, 880], 1.0); // D-F#-A
                break;
            case 'Affection':
                // Gentle and warm
                this.playChord([440, 554, 659], 1.3); // A-C#-E
                break;
            case 'Enemy':
                // Playful dramatic
                this.playTone(300, 0.5, 'sawtooth');
                setTimeout(() => this.playTone(250, 0.3, 'sawtooth'), 200);
                break;
            case 'Sibling':
                // Family warmth
                this.playChord([523, 659, 880], 1.2); // C-E-A
                break;
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveToStorage();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveToStorage();
        this.updateAudioControls();
    }

    updateAudioControls() {
        const muteButton = document.getElementById('mute-toggle');
        
        if (muteButton) {
            muteButton.innerHTML = this.isMuted ? '🔇' : '🔊';
            muteButton.title = this.isMuted ? 'Unmute sounds' : 'Mute sounds';
        }
    }
}

// Global audio manager instance
const audioManager = new AudioManager();

// Initialize audio controls
function initializeAudioControls() {
    const muteButton = document.getElementById('mute-toggle');
    
    if (muteButton) {
        muteButton.addEventListener('click', () => {
            audioManager.createAudioContext(); // Ensure context is created on first interaction
            
            if (audioManager.isMuted) {
                // Currently muted, so unmute first then play click sound
                audioManager.toggleMute();
                setTimeout(() => audioManager.playButtonClick(), 50); // Play sound after unmuting
            } else {
                // Currently unmuted, so just mute immediately with no sound
                audioManager.toggleMute();
            }
        });
    }
    
    // Update audio controls to reflect current state
    audioManager.updateAudioControls();
}

function calculateFlames() {
    const originalName1 = document.getElementById('name1').value.trim();
    const originalName2 = document.getElementById('name2').value.trim();
    
    // Show alert if either name is empty
    if (!originalName1 || !originalName2) {
        alert('Please enter both names');
        return;
    }

    // Prevent multiple animations
    if (animationInProgress) {
        return;
    }

    // Convert to lowercase and remove spaces for algorithm logic
    const name1 = originalName1.toLowerCase().replace(/\s/g, '');
    const name2 = originalName2.toLowerCase().replace(/\s/g, '');

    // Start animation sequence with both original and processed names
    startAnimationSequence(originalName1, originalName2, name1, name2);
}

function startAnimationSequence(originalName1, originalName2, name1, name2) {
    animationInProgress = true;
    
    // Play transition sound
    audioManager.playTransition();
    
    // Hide search container with animation
    const searchContainer = document.getElementById('search-container');
    const animationContainer = document.getElementById('animation-container');
    
    // Initialize names display with original case first
    setupNamesForAnimation(originalName1, originalName2);
    
    // Show animation container immediately but invisible
    animationContainer.style.display = 'block';
    
    // Start hiding search container
    searchContainer.classList.add('search-container-hidden');
    
    // After search container starts fading, begin showing animation area
    setTimeout(() => {
        animationContainer.classList.add('show');
    }, getAnimationTiming(200));
    
    // Hide search container completely after its transition
    setTimeout(() => {
        searchContainer.style.display = 'none';
    }, getAnimationTiming(500));
    
    // Start the striking animation after smooth transition is well underway
    setTimeout(() => {
        animateStrikingLetters(originalName1, originalName2, name1, name2);
    }, getAnimationTiming(800));
}

function setupNamesForAnimation(originalName1, originalName2) {
    const name1Container = document.getElementById('animated-name1');
    const name2Container = document.getElementById('animated-name2');
    
    // Create letter elements for name1 using original case
    name1Container.innerHTML = '';
    let calcIndex1 = 0; // Index for calculation (ignoring spaces)
    for (let i = 0; i < originalName1.length; i++) {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'letter';
        letterSpan.textContent = originalName1[i];
        letterSpan.setAttribute('data-display-index', i);
        letterSpan.setAttribute('data-name', '1');
        
        // Only assign calculation index to non-space characters
        if (originalName1[i] !== ' ') {
            letterSpan.setAttribute('data-calc-index', calcIndex1);
            calcIndex1++;
        } else {
            letterSpan.className = 'space-char'; // Different class for spaces
            letterSpan.setAttribute('data-calc-index', '-1'); // Mark as space
        }
        
        name1Container.appendChild(letterSpan);
    }
    
    // Create letter elements for name2 using original case
    name2Container.innerHTML = '';
    let calcIndex2 = 0; // Index for calculation (ignoring spaces)
    for (let i = 0; i < originalName2.length; i++) {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'letter';
        letterSpan.textContent = originalName2[i];
        letterSpan.setAttribute('data-display-index', i);
        letterSpan.setAttribute('data-name', '2');
        
        // Only assign calculation index to non-space characters
        if (originalName2[i] !== ' ') {
            letterSpan.setAttribute('data-calc-index', calcIndex2);
            calcIndex2++;
        } else {
            letterSpan.className = 'space-char'; // Different class for spaces
            letterSpan.setAttribute('data-calc-index', '-1'); // Mark as space
        }
        
        name2Container.appendChild(letterSpan);
    }
}

function animateStrikingLetters(originalName1, originalName2, name1, name2) {
    let modifiedName1 = name1.split('');
    let modifiedName2 = name2.split('');
    let strikingSteps = [];
    
    // Find all common letters using lowercase for comparison
    let i = 0;
    while (i < modifiedName1.length) {
        for (let j = 0; j < modifiedName2.length; j++) {
            if (modifiedName1[i] === modifiedName2[j] && modifiedName1[i] !== null && modifiedName2[j] !== null) {
                strikingSteps.push({
                    name1Index: i,
                    name2Index: j,
                    letter: modifiedName1[i]
                });
                modifiedName1[i] = null;
                modifiedName2[j] = null;
                break;
            }
        }
        i++;
    }
    
    // Animate striking letters one by one
    animateStrikingStep(strikingSteps, 0, originalName1, originalName2, modifiedName1, modifiedName2);
}

function animateStrikingStep(strikingSteps, stepIndex, originalName1, originalName2, modifiedName1, modifiedName2) {
    if (stepIndex < strikingSteps.length) {
        const step = strikingSteps[stepIndex];
        
        // Find letters using calculation index (ignoring spaces)
        const name1Letter = document.querySelector(`#animated-name1 .letter[data-calc-index="${step.name1Index}"]`);
        const name2Letter = document.querySelector(`#animated-name2 .letter[data-calc-index="${step.name2Index}"]`);
        
        // Add striking animation
        name1Letter.classList.add('striking');
        name2Letter.classList.add('striking');
        
        // Play letter strike sound
        audioManager.playLetterStrike();
        
        // After animation, mark as struck
        setTimeout(() => {
            name1Letter.classList.remove('striking');
            name1Letter.classList.add('struck');
            name2Letter.classList.remove('striking');
            name2Letter.classList.add('struck');
            
            // Continue to next step
            setTimeout(() => {
                animateStrikingStep(strikingSteps, stepIndex + 1, originalName1, originalName2, modifiedName1, modifiedName2);
            }, getAnimationTiming(300));
        }, getAnimationTiming(800));
    } else {
        // All striking complete, count remaining letters
        const remainingCount = modifiedName1.filter(char => char !== null).length + 
                             modifiedName2.filter(char => char !== null).length;
        
        // Start FLAMES elimination after a pause
        setTimeout(() => {
            animateFlamesElimination(remainingCount, originalName1, originalName2);
        }, getAnimationTiming(1500));
    }
}

function animateFlamesElimination(count, originalName1, originalName2) {
    let flames = ['F', 'L', 'A', 'M', 'E', 'S'];
    let currentIndex = 0;
    
    // Create FLAMES display
    const flamesContainer = document.createElement('div');
    flamesContainer.className = 'flames-elimination';
    flamesContainer.style.textAlign = 'center';
    flamesContainer.style.fontSize = '24px';
    flamesContainer.style.marginTop = '20px';
    
    flames.forEach((letter, index) => {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'flames-letter letter'; // Add 'letter' class for consistent styling
        letterSpan.textContent = letter;
        flamesContainer.appendChild(letterSpan);
    });
    
    document.getElementById('animation-container').appendChild(flamesContainer);
    
    // Start elimination animation
    setTimeout(() => {
        eliminateFlamesLetter(flames, currentIndex, count, flamesContainer, originalName1, originalName2);
    }, getAnimationTiming(1000));
}

function eliminateFlamesLetter(flames, currentIndex, count, container, originalName1, originalName2) {
    if (flames.length > 1) {
        // First show the counting animation
        animateFlamesCounting(flames, currentIndex, count, container, originalName1, originalName2);
    } else {
        // Final result
        const finalLetter = flames[0];
        showFinalResult(finalLetter, originalName1, originalName2);
    }
}

function animateFlamesCounting(flames, currentIndex, count, container, originalName1, originalName2) {
    // Get current FLAMES letters in DOM (only non-struck ones)
    const flamesLetters = Array.from(container.querySelectorAll('.flames-letter')).filter(el => !el.classList.contains('struck'));
    
    // Add or reuse counter display
    let counterDisplay = container.querySelector('.count-display');
    if (!counterDisplay) {
        counterDisplay = document.createElement('div');
        counterDisplay.className = 'count-display';
        counterDisplay.style.textAlign = 'center';
        counterDisplay.style.fontSize = '18px';
        counterDisplay.style.fontWeight = 'bold';
        counterDisplay.style.color = '#f57c00';
        counterDisplay.style.marginBottom = '15px';
        container.insertBefore(counterDisplay, container.firstChild);
    }
    
    let countingIndex = currentIndex;
    let countStep = 0;
    
    function highlightNextLetter() {
        if (countStep < count) {
            // Update counter display
            counterDisplay.textContent = `Counting: ${countStep + 1} of ${count}`;
            
            // Remove previous highlighting
            flamesLetters.forEach(el => el.classList.remove('counting'));
            
            // Highlight current letter
            if (countingIndex < flamesLetters.length) {
                flamesLetters[countingIndex].classList.add('counting');
                // Play counting tick sound
                audioManager.playCountingTick();
            }
            
            // Move to next letter
            countingIndex = (countingIndex + 1) % flamesLetters.length;
            countStep++;
            
            // Continue counting
            setTimeout(() => {
                highlightNextLetter();
            }, getAnimationTiming(300));
        } else {
            // Counting complete, keep the last highlighted letter and show striking phase
            counterDisplay.textContent = `Counting: 0 of ${count}`;
            counterDisplay.style.color = '#999'; // Gray out during striking
            
            // Calculate the final index to eliminate
            const finalIndex = (currentIndex + count - 1) % flames.length;
            const letterToEliminate = flamesLetters[finalIndex];
            
            // Keep the final counted letter highlighted during striking
            flamesLetters.forEach(el => el.classList.remove('counting'));
            letterToEliminate.classList.add('counting'); // Keep final letter highlighted
            
            // Apply striking animation
            setTimeout(() => {
                letterToEliminate.classList.remove('counting'); // Remove counting highlight
                letterToEliminate.classList.add('striking');
                
                setTimeout(() => {
                    // Remove striking, add struck
                    letterToEliminate.classList.remove('striking');
                    letterToEliminate.classList.add('struck');
                    
                    // Remove from flames array but keep DOM element
                    flames.splice(finalIndex, 1);
                    
                    // Adjust currentIndex if it's beyond the array length
                    let newCurrentIndex = finalIndex;
                    if (newCurrentIndex >= flames.length) {
                        newCurrentIndex = 0;
                    }
                    
                    // Reset counter color for next round
                    counterDisplay.style.color = '#f57c00';
                    
                    // Continue elimination after a short pause
                    setTimeout(() => {
                        eliminateFlamesLetter(flames, newCurrentIndex, count, container, originalName1, originalName2);
                    }, getAnimationTiming(600));
                }, getAnimationTiming(800));
            }, getAnimationTiming(300));
        }
    }
    
    // Start the counting animation
    highlightNextLetter();
}

function showFinalResult(letter, originalName1, originalName2) {
    const relationships = {
        'F': { name: 'Friend', message: 'You two are destined to be great friends!' },
        'L': { name: 'Love', message: 'Love is in the air! 💕' },
        'A': { name: 'Affection', message: 'There\'s a special affection between you two!' },
        'M': { name: 'Marriage', message: 'Wedding bells might be ringing! 💒' },
        'E': { name: 'Enemy', message: 'You might face some challenges... 😬' },
        'S': { name: 'Sibling', message: 'You\'re like family to each other!' }
    };
    
    const relationship = relationships[letter];
    
    // Remove the counter display now that we're done
    const animationContainer = document.getElementById('animation-container');
    const counterDisplay = animationContainer.querySelector('.count-display');
    if (counterDisplay) {
        counterDisplay.remove();
    }
    
    // Show final result immediately
    const resultDiv = document.getElementById('result');
    
    // Get result icon
    const resultIcons = {
        'Friend': '🤝',
        'Love': '💕',
        'Affection': '💖',
        'Marriage': '💒',
        'Enemy': '⚡',
        'Sibling': '👨‍👩‍👧‍👦'
    };
    
    const resultIcon = resultIcons[relationship.name] || '✨';
    
    const resultCardHTML = `
        <div class="result ${relationship.name.toLowerCase()}">
            <div class="result-icon">${resultIcon}</div>
            <h2>${relationship.name}</h2>
            <div class="result-names">
                <span class="result-name">${originalName1}</span>
                <span class="result-connector">&</span>
                <span class="result-name">${originalName2}</span>
            </div>
            <p>${relationship.message}</p>
        </div>
    `;

    const shareActionsHTML = `
        <div class="share-actions">
            <button class="share-btn copy-btn" data-name1="${originalName1}" data-name2="${originalName2}" data-result="${relationship.name}" data-message="${relationship.message}" title="Copy to clipboard">
                📋 Copy
            </button>
            <button class="share-btn web-share-btn" data-name1="${originalName1}" data-name2="${originalName2}" data-result="${relationship.name}" data-message="${relationship.message}" title="Share">
                📤 Share
            </button>
            <button class="share-btn image-btn" data-name1="${originalName1}" data-name2="${originalName2}" data-result="${relationship.name}" data-icon="${resultIcon}" title="Download image">
                🖼️ Image
            </button>
        </div>
    `;

    resultDiv.innerHTML = resultCardHTML + shareActionsHTML;
    
    // Play result reveal sound
    audioManager.playResultReveal(relationship.name);
    
    // Stop floating hearts and trigger celebration animation
    setTimeout(() => {
        stopFloatingHearts();
        triggerCelebration(relationship.name);
    }, 500);
    

    
    // Add event listeners for share buttons
    setupShareButtons();
    
    // Add reset button and history section below the result
    setTimeout(() => {
        const resetButton = document.createElement('button');
        resetButton.innerHTML = 'Try Another Pair';
        resetButton.className = 'flames-btn reset-btn';
        resetButton.style.marginTop = '30px';
        resetButton.style.display = 'block';
        resetButton.style.marginLeft = 'auto';
        resetButton.style.marginRight = 'auto';
        resetButton.onclick = () => {
            audioManager.playButtonClick();
            setTimeout(() => resetGame(), 50); // Small delay so click sound plays
        };
        resultDiv.appendChild(resetButton);
        

    }, 1000);
}

function resetGame() {
    // Reset everything
    animationInProgress = false;
    
    // Clear inputs
    document.getElementById('name1').value = '';
    document.getElementById('name2').value = '';
    
    // Clear displays
    document.getElementById('result').innerHTML = '';
    
    // Clear celebrations
    document.getElementById('celebration-container').innerHTML = '';
    
    // Clear animation container and remove any remaining counter
    const animationContainer = document.getElementById('animation-container');
    const counterDisplay = animationContainer.querySelector('.count-display');
    if (counterDisplay) {
        counterDisplay.remove();
    }
    
    animationContainer.innerHTML = `
        <div class="names-display">
            <div class="name-row">
                <div id="animated-name1" class="animated-name"></div>
            </div>
            <div class="name-row">
                <div id="animated-name2" class="animated-name"></div>
            </div>
        </div>
    `;
    
    // Hide animation container with smooth transition
    const searchContainer = document.getElementById('search-container');
    
    animationContainer.classList.remove('show');
    
    // Show search container again after animation starts hiding
    setTimeout(() => {
        searchContainer.style.display = 'block';
        searchContainer.classList.remove('search-container-hidden');
    }, getAnimationTiming(100));
    
    // Hide animation container completely after transition
    setTimeout(() => {
        animationContainer.style.display = 'none';
        // Restart floating hearts
        startFloatingHearts();
    }, getAnimationTiming(600));
}

// Allow Enter key to calculate
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !animationInProgress) {
        calculateFlamesWithValidation();
    }
});

// Enhanced Input Experience Functions
function initializeInputEnhancements() {
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    const fastModeCheckbox = document.getElementById('fast-mode');

    // Add input event listeners for both inputs
    setupInputEnhancements(name1Input);
    setupInputEnhancements(name2Input);
    
    // Add sound effect for turbo mode toggle and styling
    if (fastModeCheckbox) {
        const fastModeLabel = fastModeCheckbox.closest('.fast-mode-label');
        
        fastModeCheckbox.addEventListener('change', () => {
            audioManager.createAudioContext();
            audioManager.playButtonClick();
            
            // Toggle active styling
            if (fastModeCheckbox.checked) {
                fastModeLabel.classList.add('active');
            } else {
                fastModeLabel.classList.remove('active');
            }
        });
        
        // Set initial state
        if (fastModeCheckbox.checked) {
            fastModeLabel.classList.add('active');
        }
    }
}

function setupInputEnhancements(input) {
    // Input validation and auto-capitalization
    input.addEventListener('input', function(e) {
        validateInput(input);
        autoCapitalize(input);
    });

    // Focus and blur effects
    input.addEventListener('focus', function() {
        input.classList.add('focused');
    });

    input.addEventListener('blur', function() {
        input.classList.remove('focused');
        validateInput(input);
    });
}

function validateInput(input) {
    const value = input.value.trim();
    
    // Remove previous validation classes
    input.classList.remove('valid', 'invalid');
    
    if (value.length === 0) {
        // Empty - no class
        return;
    } else {
        // Valid - any non-empty input is accepted
        input.classList.add('valid');
    }
}

function autoCapitalize(input) {
    const value = input.value;
    const cursorPosition = input.selectionStart;
    
    // Capitalize first letter of each word
    const capitalizedValue = value.replace(/\b\w/g, letter => letter.toUpperCase());
    
    if (capitalizedValue !== value) {
        input.value = capitalizedValue;
        // Restore cursor position
        input.setSelectionRange(cursorPosition, cursorPosition);
    }
}

function shakeInputContainer() {
    const searchContainer = document.getElementById('search-container');
    
    // Add shake class
    searchContainer.classList.add('shake-container');
    
    // Remove class after animation completes
    setTimeout(() => {
        searchContainer.classList.remove('shake-container');
    }, getAnimationTiming(600));
}

// Update the main calculateFlames function to include validation
function calculateFlamesWithValidation() {
    // Ensure audio context is ready on user interaction
    audioManager.createAudioContext();
    
    // Play button click sound
    audioManager.playButtonClick();
    
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    const originalName1 = name1Input.value.trim();
    const originalName2 = name2Input.value.trim();
    
    // Check if either name is empty
    if (!originalName1 || !originalName2) {
        // Add visual feedback for empty inputs
        if (!originalName1) {
            name1Input.classList.add('invalid');
            setTimeout(() => name1Input.classList.remove('invalid'), getAnimationTiming(3000));
        }
        if (!originalName2) {
            name2Input.classList.add('invalid');
            setTimeout(() => name2Input.classList.remove('invalid'), getAnimationTiming(3000));
        }
        
        // Shake the container
        shakeInputContainer();
        return;
    }

    // All non-empty inputs are valid - no additional character restrictions

    // If validation passes, proceed with original calculation
    calculateFlames();
}

// Floating Hearts Background Animation
function createFloatingHeart() {
    const heartsContainer = document.getElementById('floating-hearts');
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '♥';
    
    // Random horizontal position
    heart.style.left = Math.random() * 100 + '%';
    
    // Remove random delay to prevent sudden appearances
    // heart.style.animationDelay = Math.random() * 2 + 's';
    
    heartsContainer.appendChild(heart);
    
    // Remove heart after animation completes naturally
    heart.addEventListener('animationend', () => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
        }
    });
    
    // Fallback cleanup in case animation event doesn't fire
    setTimeout(() => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
        }
    }, 18000); // Matches animation duration (15s + buffer)
}

// Create hearts at intervals
function startFloatingHearts() {
    // Create initial hearts spread out over time for immediate visual
    for (let i = 0; i < 6; i++) {
        setTimeout(() => createFloatingHeart(), i * 800);
    }
    
    // Continue creating hearts for continuous flow
    heartInterval = setInterval(() => {
        createFloatingHeart(); // Always create a heart for continuous flow
    }, 1800); // Every 1.8 seconds for more visible hearts
}

// Start the floating hearts when page loads
let heartInterval;
document.addEventListener('DOMContentLoaded', function() {
    startFloatingHearts();
    initializeInputEnhancements();
    initializeAudioControls();
});

function stopFloatingHearts() {
    // Clear the interval to stop new hearts
    if (heartInterval) {
        clearInterval(heartInterval);
    }
    
    // Fade out existing hearts quickly
    const existingHearts = document.querySelectorAll('.heart');
    existingHearts.forEach(heart => {
        heart.style.transition = 'opacity 0.5s ease-out';
        heart.style.opacity = '0';
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, getAnimationTiming(500));
    });
}

// Result Celebration Functions
function createCelebrationElement(className, icon, x, y) {
    const element = document.createElement('div');
    element.className = className;
    element.innerHTML = icon;
    element.style.left = x + '%';
    element.style.top = y + '%';
    return element;
}

function triggerCelebration(resultType) {
    const container = document.getElementById('celebration-container');
    // Clear any existing celebrations
    container.innerHTML = '';
    
    switch(resultType) {
        case 'Love':
            createLoveCelebration(container);
            break;
        case 'Marriage':
            createMarriageCelebration(container);
            break;
        case 'Friend':
            createFriendCelebration(container);
            break;
        case 'Affection':
            createAffectionCelebration(container);
            break;
        case 'Enemy':
            createEnemyCelebration(container);
            break;
        case 'Sibling':
            createSiblingCelebration(container);
            break;
    }
    
    // Clean up after animations complete
    setTimeout(() => {
        container.innerHTML = '';
    }, 8000);
}

function createLoveCelebration(container) {
    // Heart confetti pouring from top
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const heart = createCelebrationElement('heart-confetti', '💕', 
                Math.random() * 100, -10);
            heart.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(heart);
            
            // Remove after animation
            setTimeout(() => {
                if (heart.parentNode) heart.parentNode.removeChild(heart);
            }, 6000);
        }, i * 80);
    }
}

function createMarriageCelebration(container) {
    // Wedding bells and golden sparkles pouring from top
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const icon = i % 3 === 0 ? '🔔' : '✨';
            const bell = createCelebrationElement('wedding-bell', icon, 
                Math.random() * 100, -10);
            bell.style.animationDelay = Math.random() * 0.3 + 's';
            container.appendChild(bell);
            
            setTimeout(() => {
                if (bell.parentNode) bell.parentNode.removeChild(bell);
            }, 7000);
        }, i * 150);
    }
}

function createFriendCelebration(container) {
    // Cheerful stars and emojis pouring from top
    for (let i = 0; i < 18; i++) {
        setTimeout(() => {
            const icons = ['⭐', '🌟', '😊', '🎉'];
            const star = createCelebrationElement('friend-star', icons[i % 4], 
                Math.random() * 100, -10);
            star.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(star);
            
            setTimeout(() => {
                if (star.parentNode) star.parentNode.removeChild(star);
            }, 5000);
        }, i * 120);
    }
}

function createAffectionCelebration(container) {
    // Gentle sparkles and hearts pouring from top
    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            const icons = ['✨', '💫', '💜', '🌸'];
            const sparkle = createCelebrationElement('affection-sparkle', icons[i % 4], 
                Math.random() * 100, -10);
            sparkle.style.animationDelay = Math.random() * 1 + 's';
            container.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
            }, 6000);
        }, i * 90);
    }
}

function createEnemyCelebration(container) {
    // Playful storm clouds and lightning pouring from top (cute, not scary)
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const icons = ['⛅', '🌩️', '⚡', '🌦️'];
            const cloud = createCelebrationElement('storm-cloud', icons[i % 4], 
                Math.random() * 100, -10);
            cloud.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(cloud);
            
            setTimeout(() => {
                if (cloud.parentNode) cloud.parentNode.removeChild(cloud);
            }, 5500);
        }, i * 200);
    }
}

function createSiblingCelebration(container) {
    // Family hearts and emojis pouring from top
    for (let i = 0; i < 16; i++) {
        setTimeout(() => {
            const icons = ['🧡', '💛', '👨‍👩‍👧‍👦', '🤗', '💕'];
            const heart = createCelebrationElement('family-heart', icons[i % 5], 
                Math.random() * 100, -10);
            heart.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) heart.parentNode.removeChild(heart);
            }, 6500);
        }, i * 140);
    }
}

// ==================== SOCIAL SHARING & RESULTS FUNCTIONALITY ====================

// Setup Share Button Event Listeners
function setupShareButtons() {
    console.log('Setting up share buttons...');
    
    const copyBtn = document.querySelector('.copy-btn');
    const shareBtn = document.querySelector('.web-share-btn');
    const imageBtn = document.querySelector('.image-btn');
    
    console.log('Found buttons:', {copyBtn: !!copyBtn, shareBtn: !!shareBtn, imageBtn: !!imageBtn});
    
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            console.log('Copy button clicked');
            const name1 = this.dataset.name1;
            const name2 = this.dataset.name2;
            const result = this.dataset.result;
            const message = this.dataset.message;
            console.log('Copy data:', {name1, name2, result, message});
            copyResultToClipboard(name1, name2, result, message);
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            console.log('Share button clicked');
            const name1 = this.dataset.name1;
            const name2 = this.dataset.name2;
            const result = this.dataset.result;
            const message = this.dataset.message;
            console.log('Share data:', {name1, name2, result, message});
            // Prefer sharing image; fallback inside handles text-only
            shareResultWithImage(name1, name2, result, message);
        });
    }
    
    if (imageBtn) {
        imageBtn.addEventListener('click', function() {
            console.log('Image button clicked');
            const name1 = this.dataset.name1;
            const name2 = this.dataset.name2;
            const result = this.dataset.result;
            const icon = this.dataset.icon;
            console.log('Image data:', {name1, name2, result, icon});
            generateShareImageFromUI(name1, name2);
        });
    }
    

}



// Copy to Clipboard Functionality
async function copyResultToClipboard(name1, name2, result, message) {
    const shareText = `🔥 FLAMES Result 🔥\n\n${name1} & ${name2}\nResult: ${result}\n\n${message}\n\nTry FLAMES yourself! 💕`;
    
    try {
        console.log('Attempting to copy text:', shareText); // Debug log
        
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(shareText);
            showShareFeedback('📋 Copied to clipboard!', 'success');
            console.log('Copy successful using navigator.clipboard');
        } else {
            console.log('Using fallback copy method');
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, 99999); // For mobile devices
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showShareFeedback('📋 Copied to clipboard!', 'success');
                    console.log('Copy successful using execCommand');
                } else {
                    throw new Error('execCommand returned false');
                }
            } catch (err) {
                console.error('execCommand copy failed:', err);
                showShareFeedback('❌ Copy failed - try selecting text manually', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    } catch (error) {
        console.error('Copy failed:', error);
        showShareFeedback('❌ Copy failed - try selecting text manually', 'error');
    }
}

// Web Share API for Mobile
async function shareResult(name1, name2, result, message) {
    console.log('shareResult called with:', {name1, name2, result, message}); // Debug log
    
    const shareData = {
        title: `FLAMES Result: ${result}`,
        text: `${name1} & ${name2} - ${result}\n\n${message}`,
        url: window.location.href
    };
    
    try {
        if (navigator.share) {
            console.log('Using navigator.share with data:', shareData);
            await navigator.share(shareData);
            showShareFeedback('📤 Shared successfully!', 'success');
        } else {
            console.log('navigator.share not available, using fallback');
            // Fallback: Open share options
            showShareOptions(name1, name2, result, message);
        }
    } catch (error) {
        console.error('Share failed:', error);
        if (error.name !== 'AbortError') {
            showShareFeedback('❌ Share failed', 'error');
        }
    }
}

// Fallback Share Options Modal
function showShareOptions(name1, name2, result, message) {
    const shareText = encodeURIComponent(`${name1} & ${name2} - ${result}\n\n${message}\n\nTry FLAMES yourself!`);
    const shareUrl = encodeURIComponent(window.location.href);
    
    const options = [
        {
            name: 'WhatsApp',
            url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
            icon: '💬'
        },
        {
            name: 'Twitter',
            url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
            icon: '🐦'
        },
        {
            name: 'Facebook',
            url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
            icon: '📘'
        }
    ];
    
    let optionsHtml = '<div class="share-modal-overlay" onclick="closeShareModal()">';
    optionsHtml += '<div class="share-modal" onclick="event.stopPropagation()">';
    optionsHtml += '<h3>Share your result</h3>';
    
    options.forEach(option => {
        optionsHtml += `<a href="${option.url}" target="_blank" class="share-option" onclick="closeShareModal()">
            ${option.icon} ${option.name}
        </a>`;
    });
    
    optionsHtml += '<button onclick="closeShareModal()" class="close-modal-btn">Close</button>';
    optionsHtml += '</div></div>';
    
    document.body.insertAdjacentHTML('beforeend', optionsHtml);
}

function closeShareModal() {
    const modal = document.querySelector('.share-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Image Generation using html2canvas with styling fixes
// Build export-safe DOM node for html2canvas
function buildExportNode(name1, name2, resultName, resultIcon) {
    const wrapper = document.createElement('div');
    const cls = `export-wrap export-${resultName.toLowerCase()}`;
    wrapper.setAttribute('class', cls);

    wrapper.innerHTML = `
        <div class="export-card">
            <div class="export-icon">${resultIcon}</div>
            <div class="export-title">${resultName}</div>
            <div class="export-underline"></div>
            <div class="export-names">
                <div class="export-name-tag">${name1}</div>
                <div class="export-amp">&</div>
                <div class="export-name-tag">${name2}</div>
            </div>
            <div class="export-message">${getResultExportMessage(resultName)}</div>
        </div>
    `;

    return wrapper;
}

function getResultExportMessage(resultName) {
    switch (resultName) {
        case 'Friend': return 'You two are destined to be great friends!';
        case 'Love': return 'Love is in the air! 💕';
        case 'Affection': return "There's a special affection between you two!";
        case 'Marriage': return 'Wedding bells might be ringing! 💒';
        case 'Enemy': return 'You might face some challenges... 😬';
        case 'Sibling': return "You're like family to each other!";
        default: return 'A special connection between you two!';
    }
}

// Render export-safe node with html2canvas
async function renderExportImage(name1, name2, resultName, resultIcon) {
    const exportNode = buildExportNode(name1, name2, resultName, resultIcon);

    // Keep it offscreen and invisible but renderable
    exportNode.style.position = 'fixed';
    exportNode.style.left = '-99999px';
    exportNode.style.top = '0';

    document.body.appendChild(exportNode);

    // Give layout a tick
    await new Promise(r => setTimeout(r, 20));

    const card = exportNode.querySelector('.export-card');
    const canvas = await html2canvas(exportNode, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
        logging: false,
        width: exportNode.offsetWidth,
        height: exportNode.offsetHeight,
        scrollX: 0,
        scrollY: 0
    });

    // Clean up DOM
    document.body.removeChild(exportNode);

    // Download
    const link = document.createElement('a');
    link.download = `flames-result-${name1}-${name2}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Hook the Image button to export-safe renderer
// Override previous image generation to call export renderer
async function generateShareImageFromUI(name1, name2) {
    try {
        // Infer result from DOM
        const titleEl = document.querySelector('.result h2');
        const resultName = titleEl ? titleEl.textContent.trim() : 'Love';

        const iconEl = document.querySelector('.result .result-icon');
        const resultIcon = iconEl ? iconEl.textContent.trim() : '✨';

        await renderExportImage(name1, name2, resultName, resultIcon);
        showShareFeedback('🖼️ Image downloaded!', 'success');
    } catch (err) {
        console.error('Export image failed:', err);
        showShareFeedback('❌ Image generation failed', 'error');
    }
}

// Create an export canvas for image sharing/downloading
async function createExportCanvas(name1, name2, resultName, resultIcon) {
    const exportNode = buildExportNode(name1, name2, resultName, resultIcon);
    exportNode.style.position = 'fixed';
    exportNode.style.left = '-99999px';
    exportNode.style.top = '0';
    document.body.appendChild(exportNode);
    await new Promise(r => setTimeout(r, 20));
    const canvas = await html2canvas(exportNode, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
        logging: false,
        width: exportNode.offsetWidth,
        height: exportNode.offsetHeight,
        scrollX: 0,
        scrollY: 0
    });
    document.body.removeChild(exportNode);
    return canvas;
}

// Share image via Web Share API with files, with graceful fallback
async function shareResultWithImage(name1, name2, result, message) {
    try {
        const iconEl = document.querySelector('.result .result-icon');
        const resultIcon = iconEl ? iconEl.textContent.trim() : '✨';
        const canvas = await createExportCanvas(name1, name2, result, resultIcon);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
        if (!blob) throw new Error('Failed to create image blob');
        const fileName = `flames-result-${name1}-${name2}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: `FLAMES Result: ${result}`,
                text: `${name1} & ${name2} - ${result}\n\n${message}`
            });
            showShareFeedback('📤 Shared image successfully!', 'success');
        } else {
            // Fallback to text-only sharing
            await shareResult(name1, name2, result, message);
        }
    } catch (error) {
        console.error('Image sharing failed, falling back to text share:', error);
        await shareResult(name1, name2, result, message);
    }
}

// Share Feedback Display
function showShareFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `share-feedback ${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: 500;
        z-index: 10000;
        animation: feedbackSlide 3s ease forwards;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 3000);
}



// Add feedback animation CSS
const feedbackStyles = document.createElement('style');
feedbackStyles.textContent = `
@keyframes feedbackSlide {
    0% { transform: translateX(100%); opacity: 0; }
    10%, 90% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
}

.share-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.share-modal {
    background: white;
    border-radius: 20px;
    padding: 30px;
    max-width: 300px;
    width: 90%;
    text-align: center;
}

.share-modal h3 {
    margin-bottom: 20px;
    color: #333;
}

.share-option {
    display: block;
    padding: 12px 20px;
    margin: 8px 0;
    background: #f5f5f5;
    border-radius: 25px;
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: all 0.3s ease;
}

.share-option:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
}

.close-modal-btn {
    margin-top: 15px;
    padding: 10px 20px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
}
`;
document.head.appendChild(feedbackStyles);