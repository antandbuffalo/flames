let animationInProgress = false;

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

    // Convert to lowercase only for algorithm logic
    const name1 = originalName1.toLowerCase();
    const name2 = originalName2.toLowerCase();

    // Start animation sequence with both original and lowercase names
    startAnimationSequence(originalName1, originalName2, name1, name2);
}

function startAnimationSequence(originalName1, originalName2, name1, name2) {
    animationInProgress = true;
    
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
    }, 200);
    
    // Hide search container completely after its transition
    setTimeout(() => {
        searchContainer.style.display = 'none';
    }, 500);
    
    // Start the striking animation after smooth transition is well underway
    setTimeout(() => {
        animateStrikingLetters(originalName1, originalName2, name1, name2);
    }, 800);
}

function setupNamesForAnimation(originalName1, originalName2) {
    const name1Container = document.getElementById('animated-name1');
    const name2Container = document.getElementById('animated-name2');
    
    // Create letter elements for name1 using original case
    name1Container.innerHTML = '';
    for (let i = 0; i < originalName1.length; i++) {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'letter';
        letterSpan.textContent = originalName1[i];
        letterSpan.setAttribute('data-index', i);
        letterSpan.setAttribute('data-name', '1');
        name1Container.appendChild(letterSpan);
    }
    
    // Create letter elements for name2 using original case
    name2Container.innerHTML = '';
    for (let i = 0; i < originalName2.length; i++) {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'letter';
        letterSpan.textContent = originalName2[i];
        letterSpan.setAttribute('data-index', i);
        letterSpan.setAttribute('data-name', '2');
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
        
        // Find and animate the letters
        const name1Letters = document.querySelectorAll('#animated-name1 .letter');
        const name2Letters = document.querySelectorAll('#animated-name2 .letter');
        
        const name1Letter = name1Letters[step.name1Index];
        const name2Letter = name2Letters[step.name2Index];
        
        // Add striking animation
        name1Letter.classList.add('striking');
        name2Letter.classList.add('striking');
        
        // After animation, mark as struck
        setTimeout(() => {
            name1Letter.classList.remove('striking');
            name1Letter.classList.add('struck');
            name2Letter.classList.remove('striking');
            name2Letter.classList.add('struck');
            
            // Continue to next step
            setTimeout(() => {
                animateStrikingStep(strikingSteps, stepIndex + 1, originalName1, originalName2, modifiedName1, modifiedName2);
            }, 300);
        }, 800);
    } else {
        // All striking complete, count remaining letters
        const remainingCount = modifiedName1.filter(char => char !== null).length + 
                             modifiedName2.filter(char => char !== null).length;
        
        // Start FLAMES elimination after a pause
        setTimeout(() => {
            animateFlamesElimination(remainingCount, originalName1, originalName2);
        }, 1500);
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
    }, 1000);
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
            }
            
            // Move to next letter
            countingIndex = (countingIndex + 1) % flamesLetters.length;
            countStep++;
            
            // Continue counting
            setTimeout(() => {
                highlightNextLetter();
            }, 300);
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
                    }, 600);
                }, 800);
            }, 300);
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
        'S': { name: 'Sister', message: 'You\'re like family to each other!' }
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
    resultDiv.innerHTML = `
        <div class="result ${relationship.name.toLowerCase()}">
            <h2>${relationship.name}</h2>
            <p>${relationship.message}</p>
        </div>
    `;
    
    // Stop floating hearts and trigger celebration animation
    setTimeout(() => {
        stopFloatingHearts();
        triggerCelebration(relationship.name);
    }, 500);
    
    // Add reset button below the result
    setTimeout(() => {
        const resetButton = document.createElement('button');
        resetButton.textContent = 'FLAMES Again';
        resetButton.className = 'flames-btn';
        resetButton.style.marginTop = '30px';
        resetButton.style.display = 'block';
        resetButton.style.marginLeft = 'auto';
        resetButton.style.marginRight = 'auto';
        resetButton.onclick = resetGame;
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
    }, 100);
    
    // Hide animation container completely after transition
    setTimeout(() => {
        animationContainer.style.display = 'none';
        // Restart floating hearts
        startFloatingHearts();
    }, 600);
}

// Allow Enter key to calculate
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !animationInProgress) {
        calculateFlames();
    }
});

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
document.addEventListener('DOMContentLoaded', startFloatingHearts);

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
        }, 500);
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
        case 'Sister':
            createSisterCelebration(container);
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

function createSisterCelebration(container) {
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