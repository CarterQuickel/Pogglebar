// Add this at the very top of your file
let debugCounter = 0;


// ===== ANIMATION SEQUENCES =====
async function showAnimationForRarity(rarity, pogResult) {
    if (!isAnimationRunning) return; // Check if we should continue
    
    document.getElementById('gachaOverlay').style.display = 'block';
    
    let animationType, starCount, duration;
    
    switch(rarity) {
        case 'Unique':
            animationType = 'unique';
            starCount = 15;
            duration = 4000;
            addUniqueScreenEffects();
            break;
        case 'Mythic':
            animationType = 'mythic';
            starCount = 12;
            duration = 3500;
            break;
        default:
            animationType = 'normal';
            starCount = 8;
            duration = 2500;
            break;
    }
    
    // Step 1: Stars
    createStarShapedShootingStars(animationType, starCount);
    await new Promise(resolve => setTimeout(resolve, duration));
    
    if (!isAnimationRunning) return; // Check if skipped
    
    // Step 2: Click to continue
    const isSpecial = rarity === 'Unique' || rarity === 'Mythic';
    await showClickToContinue(isSpecial);
    
    if (!isAnimationRunning) return; // Check if skipped
    
    // Step 3: Reveal
    if (rarity === 'Unique') {
        await createMiniExplosion();
        if (!isAnimationRunning) return;
        await revealUniquePogInCenter(pogResult);
        if (!isAnimationRunning) return;
        await showUniqueParticleExplosion();
    } else if (rarity === 'Mythic') {
        await revealMythicPog(pogResult);
    } else {
        await revealCommonPog(pogResult);
    }
    
    // Cleanup
    cleanupGachaOverlay();
}

async function showMultiPullAnimation(results, pullCount, highestRarity) {
    if (!isAnimationRunning) return;
    
    document.getElementById('gachaOverlay').style.display = 'block';
    
    let animationType, starCount, duration;
    
    switch(highestRarity.rarity) {
        case 'Unique':
            animationType = 'unique';
            starCount = 15;
            duration = 4000;
            addUniqueScreenEffects();
            break;
        case 'Mythic':
            animationType = 'mythic';
            starCount = 12;
            duration = 3500;
            break;
        default:
            animationType = 'normal';
            starCount = 8;
            duration = 2500;
            break;
    }
    
    // Step 1: Stars
    createStarShapedShootingStars(animationType, starCount);
    await new Promise(resolve => setTimeout(resolve, duration));
    
    if (!isAnimationRunning) return;
    
    // Step 2: Click to continue
    const hasSpecial = results.some(r => r.rarity === 'Unique' || r.rarity === 'Mythic');
    await showClickToContinue(hasSpecial);
    
    if (!isAnimationRunning) return;
    
    // Step 3: Show results
    await showResultsSummary(results, pullCount);
    
    // Cleanup handled by summary button
}

// ===== ANIMATION HELPER FUNCTIONS =====
function createStarShapedShootingStars(type, count) {
    const container = document.getElementById('shootingStarsContainer');
    const isRainbow = type === 'unique';
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const starContainer = document.createElement('div');
            starContainer.className = 'genshinStarShape';
            
            // Calculate paths that converge toward center
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            // Random starting position from edges
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const distance = Math.max(window.innerWidth, window.innerHeight) * 0.8;
            
            const startX = centerX + Math.cos(angle) * distance;
            const startY = centerY + Math.sin(angle) * distance;
            
            // Mid-point for curved path
            const midX = centerX + Math.cos(angle) * (distance * 0.3);
            const midY = centerY + Math.sin(angle) * (distance * 0.3);
            
            // Vary star sizes
            const size = 15 + Math.random() * 20; // 15-35px stars
            
            // Create the star
            starContainer.innerHTML = `
                <div class="simpleStarShape ${isRainbow ? 'rainbow' : ''}" style="
                    width: ${size}px;
                    height: ${size}px;
                    animation: starTwinkle 1s ease-in-out infinite;
                "></div>
            `;
            
            // Position and animate
            starContainer.style.cssText = `
                left: ${startX}px;
                top: ${startY}px;
                --startX: 0px;
                --startY: 0px;
                --midX: ${midX - startX}px;
                --midY: ${midY - startY}px;
                --endX: ${centerX - startX}px;
                --endY: ${centerY - startY}px;
                animation: starShootToCenter 3s ease-out;
                animation-delay: ${i * 150}ms;
            `;
            
            container.appendChild(starContainer);
            
            // Remove after animation
            setTimeout(() => {
                if (starContainer.parentNode) {
                    starContainer.parentNode.removeChild(starContainer);
                }
            }, 3000 + (i * 150) + 500);
            
        }, i * 200);
    }
}

async function showClickToContinue(hasSpecial = false) {
    const myId = ++debugCounter;
    console.log(`🔍 showClickToContinue #${myId} starting`);

    const clickDiv = document.getElementById('clickToContinue');

    if (hasSpecial) {
        clickDiv.innerHTML = `
            <p style="color: #ff00ff; font-size: 28px; text-shadow: 0 0 20px #ff00ff;">
                Click anywhere to witness your special pog!
            </p>
        `;
        clickDiv.style.animation = 'uniquePulse 1s ease-in-out infinite';
    } else {
        clickDiv.innerHTML = '<p>Click anywhere to continue...</p>';
        clickDiv.style.animation = 'pulse 1.5s infinite';
    }

    clickDiv.style.display = 'block';

    return new Promise(resolve => {
        // If a previous handler exists, remove it to avoid cross-run leakage
        if (currentContinueHandler) {
            document.removeEventListener('click', currentContinueHandler);
            currentContinueHandler = null;
        }

        const handleClick = (event) => {
            const now = Date.now();
            // If user just hit skip shortly before, ignore accidental immediate taps
            if (lastSkipTimestamp && (now - lastSkipTimestamp) < 350) {
                console.log(`⏱️ Ignored rapid click after skip (#${myId}), delta=${now - lastSkipTimestamp}ms`);
                // don't resolve; keep handler active for the next click
                return;
            }

            console.log(`✅ Continue #${myId} clicked on:`, event.target);
            clickDiv.style.display = 'none';
            // remove and clear stored reference
            document.removeEventListener('click', handleClick);
            if (currentContinueHandler === handleClick) currentContinueHandler = null;
            resolve();
        };

        currentContinueHandler = handleClick;
        document.addEventListener('click', handleClick);
    });
}

async function createMiniExplosion() {
    const container = document.getElementById('shootingStarsContainer');
    
    // Create 10 mini explosion particles
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        
        const angle = (i / 10) * 2 * Math.PI;
        const distance = 50;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        particle.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: radial-gradient(circle, #ffffff, #ffd700);
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: miniExplosion 0.8s ease-out forwards;
            --endX: ${endX}px;
            --endY: ${endY}px;
        `;
        container.appendChild(particle);
        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
    }
    
    // Wait for explosion to finish
    return new Promise(resolve => setTimeout(resolve, 800));
}

function validateCrateOpening(type, cost, count) {
    if (type === "Money") {
        if (money < cost) {
            alert(`Not enough money to open ${count} crate${count > 1 ? 's' : ''}! (Need $${abbreviateNumber(cost-money)} more)`);
            return false;
        }
    }
    if (inventory.length + count > Isize) {
        alert(`Not enough inventory space to open ${count} crate${count > 1 ? 's' : ''}!`);
        return false;
    }
    if (inventory.length + count >= 100) {
        alert("Inventory full! Sell some pogs to make space.");
        return false;
    }
    return true;
}

// crateopen.js (client-side)
function calculatePogResult(cost, index) {
  console.log(`🎲 Attempting to calculate pog result for index ${index}`);

  // ensure crates is an array (coming from server-side render)
  if (!Array.isArray(window.userCrates) && Array.isArray(window.crates)) {
    window.userCrates = window.crates;
  }
  const cratesArr = Array.isArray(window.userCrates) ? window.userCrates : (Array.isArray(window.crates) ? window.crates : crates);

  const crate = cratesArr[index];
  if (!crate || !Array.isArray(crate.rarities)) {
    console.error("Invalid crate index or configuration:", index, crate);
    return null;
  }
  console.log(`✅ Using crate ${crate.name || index} with rarities:`, crate.rarities);

  // Ensure pogList exists on the client
  const localPogList = Array.isArray(window.pogList) ? window.pogList : (typeof pogList !== 'undefined' ? pogList : []);
  if (!localPogList.length) {
    console.warn("pogList empty on client — cannot open crates");
    return null;
  }

  // helper: normalized string compare
  const norm = s => String(s || "").trim().toLowerCase();

  // roll
  let rand = Math.random();
  let cumulativeChance = 0;

  for (const item of crate.rarities) {
    cumulativeChance += Number(item.chance) || 0;
    if (rand < cumulativeChance) {
      // find candidates using case-insensitive match
      const candidates = localPogList.filter(p => norm(p.rarity) === norm(item.name));

      // debug output (unique, deduped rarity list)
      console.log("Looking for rarity:", item.name);
      console.log("Available pog rarities:", [...new Set(localPogList.map(p => p.rarity))]);

      if (candidates.length === 0) {
        console.warn(`No pogs for rarity "${item.name}", skipping this rarity (roll continues)`);
        // continue looping: this lets another rarer/cheaper tier be used if present
        continue;
      }

      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      console.log("Chosen pog:", chosen);

      const meta = (typeof rarityColor !== 'undefined' ? rarityColor : []).find(r => norm(r.name) === norm(chosen.rarity)) || {};

      return {
        locked: false,
        pogid: chosen.id || null,
        name: chosen.name,
        id: Date.now() + Math.floor(Math.random() * 10000),
        rarity: chosen.rarity,
        pogcol: chosen.color || 'white',
        color: meta.color || 'white',
        income: meta.income || 5,
        description: chosen.description || '',
        creator: chosen.creator || ''
      };
    }
  }

  // fallback: choose from the crate's last rarity bucket if present
  const fallbackRarity = crate.rarities[crate.rarities.length - 1];
  if (fallbackRarity) {
    const fallbackCandidates = localPogList.filter(p => norm(p.rarity) === norm(fallbackRarity.name));
    if (fallbackCandidates.length > 0) {
      const chosen = fallbackCandidates[Math.floor(Math.random() * fallbackCandidates.length)];
      const meta = (typeof rarityColor !== 'undefined' ? rarityColor : []).find(r => norm(r.name) === norm(chosen.rarity)) || {};
      console.warn("Using fallback rarity because roll missed:", fallbackRarity.name);
      return {
        locked: false,
        pogid: chosen.id || null,
        name: chosen.name,
        id: Date.now() + Math.floor(Math.random() * 10000),
        rarity: chosen.rarity,
        pogcol: chosen.color || 'white',
        color: meta.color || 'white',
        income: meta.income || 5,
        description: chosen.description || '',
        creator: chosen.creator || ''
      };
    }
  }

  console.error("No pog could be selected — crate misconfigured:", crate);
  return null;
}

function addPogToInventory(pogResult) {
    if (!pogResult) return;
    
    console.log("🟢 BEFORE adding pog:", pogResult.name, "Inventory size:", inventory.length);

    console.log("Adding pog to inventory:", pogResult.name, pogResult.rarity);
    
    let ownedQueue = { name: pogResult.name, rarity: pogResult.rarity, pogcol: pogResult.pogcol };
    const alreadyOwned = pogAmount.find(pog =>
        pog.name === ownedQueue.name &&
        pog.rarity === ownedQueue.rarity &&
        pog.pogcol === ownedQueue.pogcol
    );
    if (!alreadyOwned) {
        pogAmount.push(ownedQueue)
    }

    document.getElementById("descPanel").innerHTML = "";
    inventory.push(pogResult);
    refreshInventory();
    xp += Math.floor(pogResult.income * (15 * level / 15));
    sorting();
    levelup();
    console.log("🟡 AFTER adding pog, before save. Inventory size:", inventory.length);
    save();
    console.log("🔵 AFTER save completed. Inventory size:", inventory.length);
}

// ===== SKIP ANIMATION SYSTEM =====
let isAnimationRunning = false;
let currentSkipHandler = null;
// Tracks the active "click to continue" document handler so it can be removed on skip/cleanup
let currentContinueHandler = null;
// Timestamp of last skip — used to debounce accidental immediate clicks after skipping
let lastSkipTimestamp = 0;

function showSkipButton() {
    const skipBtn = document.getElementById('skipAnimation');
    skipBtn.style.display = 'block';
}

function hideSkipButton() {
    const skipBtn = document.getElementById('skipAnimation');
    skipBtn.style.display = 'none';
    if (currentSkipHandler) {
        skipBtn.removeEventListener('click', currentSkipHandler);
        currentSkipHandler = null;
    }
}

function setupSkipButton(pullType, pogResults) {
    const myId = ++debugCounter;
    console.log(`🔍 setupSkipButton #${myId} called for ${pullType}`);
    
    const skipBtn = document.getElementById('skipAnimation');
    
    if (currentSkipHandler) {
        console.log(`🔍 Removing old skip handler #${myId}`);
        skipBtn.removeEventListener('click', currentSkipHandler);
    }
    
    currentSkipHandler = (event) => {
        console.log(`🚫 Skip handler #${myId} triggered`);
        event.stopPropagation();
        skipAnimation(pullType, pogResults);
    };
    
    skipBtn.addEventListener('click', currentSkipHandler);
    showSkipButton();
}



async function skipAnimation(pullType, pogResults) {
    if (!isAnimationRunning) {
        console.log('🚫 Skip ignored - animation not running');
        return;
    }
    
    console.log('🚫 SKIP TRIGGERED! pullType:', pullType);
    isAnimationRunning = false;
    hideSkipButton();
    // Record skip time to avoid immediate subsequent clicks from resolving next prompt
    lastSkipTimestamp = Date.now();
    // If a click-to-continue handler is active, remove it so it doesn't fire later
    if (currentContinueHandler) {
        document.removeEventListener('click', currentContinueHandler);
        currentContinueHandler = null;
    }
    
    document.getElementById('gachaOverlay').style.display = 'block';
    
    if (pullType === 'single') {
        if (pogResults.rarity === 'Unique') {
            await revealUniquePogInCenter(pogResults);
        } else if (pogResults.rarity === 'Mythic') {
            await revealMythicPog(pogResults);
        } else {
            await revealCommonPog(pogResults);
        }
    } else if (pullType === 'multi') {
        await showResultsSummary(pogResults, pogResults.length);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    cleanupGachaOverlay();
}

//Nuking event listeners 
function clearAllEventListeners() {
    console.log('🧨 Nuclear cleanup - removing ALL event listeners');
    
    // Clone and replace elements to remove all event listeners
    const skipBtn = document.getElementById('skipAnimation');
    const newSkipBtn = skipBtn.cloneNode(true);
    skipBtn.parentNode.replaceChild(newSkipBtn, skipBtn);
    
    // Reset all variables
    currentSkipHandler = null;
    if (currentContinueHandler) {
        document.removeEventListener('click', currentContinueHandler);
        currentContinueHandler = null;
    }
    isAnimationRunning = false;
    
    console.log('🧨 Nuclear cleanup complete');
}


function cleanupGachaOverlay() {
    console.log('🧹 Cleaning up overlay');
    
    // Remove all event listeners first
    if (currentSkipHandler) {
        const skipBtn = document.getElementById('skipAnimation');
        skipBtn.removeEventListener('click', currentSkipHandler);
        currentSkipHandler = null;
    }
    // Remove click-to-continue handler if present
    if (currentContinueHandler) {
        document.removeEventListener('click', currentContinueHandler);
        currentContinueHandler = null;
    }
    
    // Clean up DOM
    document.getElementById('gachaOverlay').style.display = 'none';
    document.getElementById('shootingStarsContainer').innerHTML = '';
    const centerReveal = document.getElementById('centerPogReveal');
    if (centerReveal) {
        centerReveal.style.display = 'none';
        centerReveal.innerHTML = '';
    }
    
    // Hide skip button
    hideSkipButton();
    
    // Reset animation state
    isAnimationRunning = false;
    
    console.log('🧹 Cleanup complete. isAnimationRunning:', isAnimationRunning);
}



// ===== MAIN ANIMATION FUNCTIONS =====
async function openCrateWithAnimation(cost, index) {
    clearAllEventListeners();
    if (!validateCrateOpening(cost, 1)) return;
    if (isAnimationRunning) {
        console.log('❌ Animation already running, blocking new animation');
        return;
    }

    const result = calculatePogResult(cost, index);
    if (!result) return;

    addPogToInventory(result);
    cratesOpened++;
    refreshInventory();
    
    // IMPORTANT: Clean up any leftover state first
    cleanupGachaOverlay();
    
    // THEN start new animation
    isAnimationRunning = true;
    setupSkipButton('single', result);
    
    try {
        await showAnimationForRarity(result.rarity, result);
    } catch (error) {
        console.error('Animation error:', error);
        cleanupGachaOverlay();
    }
}

async function openMultipleCratesWithAnimation(cost, index, count) {
    clearAllEventListeners();
    if (!validateCrateOpening(cost, count)) return;
    if (isAnimationRunning) {
        console.log('❌ Animation already running, blocking new animation');
        return;
    }

    const results = [];
    for (let i = 0; i < count; i++) {
        const result = calculatePogResult(cost, index);
        if (result) results.push(result);
    }

    const rarityOrder = { 'Unique': 6, 'Mythic': 5, 'Rare': 4, 'Uncommon': 3, 'Common': 2, 'Trash': 1 };
    console.log(results);
    const highestRarity = results.reduce((highest, pog) => 
        rarityOrder[pog.rarity] > rarityOrder[highest.rarity] ? pog : highest
    );

    results.forEach(result => addPogToInventory(result));
    cratesOpened += count;
    refreshInventory();

    // IMPORTANT: Clean up any leftover state first
    cleanupGachaOverlay();
    
    // THEN start new animation
    isAnimationRunning = true;
    setupSkipButton('multi', results);
    
    try {
        await showMultiPullAnimation(results, count, highestRarity);
    } catch (error) {
        console.error('Animation error:', error);
        cleanupGachaOverlay();
    }
}


// ===== ANIMATION SEQUENCES =====
async function showAnimationForRarity(rarity, pogResult) {
    if (!isAnimationRunning) return;
    
    document.getElementById('gachaOverlay').style.display = 'block';
    
    let animationType, starCount, duration;
    
    switch(rarity) {
        case 'Unique':
            animationType = 'unique';
            starCount = 15;
            duration = 4000;
            addUniqueScreenEffects();
            break;
        case 'Mythic':
            animationType = 'mythic';
            starCount = 12;
            duration = 3500;
            break;
        default:
            animationType = 'normal';
            starCount = 8;
            duration = 2500;
            break;
    }
    
    createStarShapedShootingStars(animationType, starCount);
    await new Promise(resolve => setTimeout(resolve, duration));
    
    if (!isAnimationRunning) return;
    
    const isSpecial = rarity === 'Unique' || rarity === 'Mythic';
    await showClickToContinue(isSpecial);
    
    if (!isAnimationRunning) return;
    
    if (rarity === 'Unique') {
        await createMiniExplosion();
        if (!isAnimationRunning) return;
        await revealUniquePogInCenter(pogResult);
        if (!isAnimationRunning) return;
        await showUniqueParticleExplosion();
    } else if (rarity === 'Mythic') {
        await revealMythicPog(pogResult);
    } else {
        await revealCommonPog(pogResult);
    }
    
    cleanupGachaOverlay();
}

async function showMultiPullAnimation(results, pullCount, highestRarity) {
    if (!isAnimationRunning) return;
    
    document.getElementById('gachaOverlay').style.display = 'block';
    
    let animationType, starCount, duration;
    
    switch(highestRarity.rarity) {
        case 'Unique':
            animationType = 'unique';
            starCount = 15;
            duration = 4000;
            addUniqueScreenEffects();
            break;
        case 'Mythic':
            animationType = 'mythic';
            starCount = 12;
            duration = 3500;
            break;
        default:
            animationType = 'normal';
            starCount = 8;
            duration = 2500;
            break;
    }
    
    createStarShapedShootingStars(animationType, starCount);
    await new Promise(resolve => setTimeout(resolve, duration));
    
    if (!isAnimationRunning) return;
    
    const hasSpecial = results.some(r => r.rarity === 'Unique' || r.rarity === 'Mythic');
    await showClickToContinue(hasSpecial);
    
    if (!isAnimationRunning) return;
    
    await showResultsSummary(results, pullCount);
}

// ===== ANIMATION HELPER FUNCTIONS =====
function createStarShapedShootingStars(type, count) {
    const container = document.getElementById('shootingStarsContainer');
    const isRainbow = type === 'unique';
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const starContainer = document.createElement('div');
            starContainer.className = 'genshinStarShape';
            
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const distance = Math.max(window.innerWidth, window.innerHeight) * 0.8;
            
            const startX = centerX + Math.cos(angle) * distance;
            const startY = centerY + Math.sin(angle) * distance;
            
            const midX = centerX + Math.cos(angle) * (distance * 0.3);
            const midY = centerY + Math.sin(angle) * (distance * 0.3);
            
            const size = 15 + Math.random() * 20;
            
            starContainer.innerHTML = `
                <div class="simpleStarShape ${isRainbow ? 'rainbow' : ''}" style="
                    width: ${size}px;
                    height: ${size}px;
                    animation: starTwinkle 1s ease-in-out infinite;
                "></div>
            `;
            
            starContainer.style.cssText = `
                left: ${startX}px;
                top: ${startY}px;
                --startX: 0px;
                --startY: 0px;
                --midX: ${midX - startX}px;
                --midY: ${midY - startY}px;
                --endX: ${centerX - startX}px;
                --endY: ${centerY - startY}px;
                animation: starShootToCenter 3s ease-out;
                animation-delay: ${i * 150}ms;
            `;
            
            container.appendChild(starContainer);
            
            setTimeout(() => {
                if (starContainer.parentNode) {
                    starContainer.parentNode.removeChild(starContainer);
                }
            }, 3000 + (i * 150) + 500);
            
        }, i * 200);
    }
}

async function showClickToContinue(hasSpecial = false) {
    const myId = ++debugCounter;
    console.log(`🔍 showClickToContinue (dup) #${myId} starting`);

    const clickDiv = document.getElementById('clickToContinue');

    if (hasSpecial) {
        clickDiv.innerHTML = `
            <p style="color: #ff00ff; font-size: 28px; text-shadow: 0 0 20px #ff00ff;">
                Click anywhere to witness your special pog!
            </p>
        `;
        clickDiv.style.animation = 'uniquePulse 1s ease-in-out infinite';
    } else {
        clickDiv.innerHTML = '<p>Click anywhere to continue...</p>';
        clickDiv.style.animation = 'pulse 1.5s infinite';
    }

    clickDiv.style.display = 'block';

    return new Promise(resolve => {
        if (currentContinueHandler) {
            document.removeEventListener('click', currentContinueHandler);
            currentContinueHandler = null;
        }

        const handleClick = (event) => {
            const now = Date.now();
            if (lastSkipTimestamp && (now - lastSkipTimestamp) < 350) {
                console.log(`⏱️ Ignored rapid click after skip (dup) #${myId}, delta=${now - lastSkipTimestamp}ms`);
                return;
            }
            console.log('🖱️ Continue click detected on:', event.target);
            clickDiv.style.display = 'none';
            document.removeEventListener('click', handleClick);
            if (currentContinueHandler === handleClick) currentContinueHandler = null;
            resolve();
        };

        currentContinueHandler = handleClick;
        document.addEventListener('click', handleClick);
    });
}


async function createMiniExplosion() {
    const container = document.getElementById('shootingStarsContainer');
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        
        const angle = (i / 10) * 2 * Math.PI;
        const distance = 50;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        particle.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: radial-gradient(circle, #ffffff, #ffd700);
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: miniExplode 1s ease-out forwards;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
            z-index: 10001;
        `;
        
        particle.style.setProperty('--miniX', endX + 'px');
        particle.style.setProperty('--miniY', endY + 'px');
        
        container.appendChild(particle);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const miniParticles = container.querySelectorAll('[style*="miniExplode"]');
    miniParticles.forEach(particle => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    });
}

async function showUniqueParticleExplosion() {
    const container = document.getElementById('shootingStarsContainer');
    
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        
        const angle = (i / 25) * 2 * Math.PI;
        const distance = 150 + Math.random() * 200;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        const size = 8 + Math.random() * 12;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(45deg, 
                #ff0000, #ff7f00, #ffff00, #00ff00, 
                #0000ff, #4b0082, #9400d3, #ff0000);
            background-size: 400% 400%;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: explodeRainbow 2.5s ease-out forwards, rainbowParticleShimmer 0.5s ease-in-out infinite;
            animation-delay: ${i * 15}ms;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
            z-index: 10002;
        `;
        
        particle.style.setProperty('--endX', endX + 'px');
        particle.style.setProperty('--endY', endY + 'px');
        
        container.appendChild(particle);
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const particles = container.querySelectorAll('[style*="explodeRainbow"]');
    particles.forEach(particle => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    });
}

function addUniqueScreenEffects() {
    const border = document.createElement('div');
    border.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 8px solid;
        border-image: linear-gradient(45deg, 
            #ff0000, #ff7f00, #ffff00, #00ff00, 
            #0000ff, #4b0082, #9400d3, #ff0000) 1;
        pointer-events: none;
        z-index: 9999;
        animation: borderPulse 1s ease-in-out infinite;
    `;
    
    document.body.appendChild(border);
    
    setTimeout(() => {
        if (border.parentNode) {
            border.parentNode.removeChild(border);
        }
    }, 6000);
}

// ===== REVEAL FUNCTIONS =====
async function revealCommonPog(pogResult) {
    let centerReveal = document.getElementById('centerPogReveal');
    if (!centerReveal) {
        centerReveal = document.createElement('div');
        centerReveal.id = 'centerPogReveal';
        centerReveal.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10003;
        `;
        document.getElementById('gachaOverlay').appendChild(centerReveal);
    }
    
    centerReveal.innerHTML = `
        <div style="
            width: 250px;
            height: 150px;
            border-radius: 15px;
            background: linear-gradient(135deg, #919191ff, #9e9c9cff);
            border: 3px solid white;
            box-shadow: 0 0 20px rgba(123, 179, 255, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: commonPogReveal 1s ease-out;
            color: white;
            text-align: center;
        ">
            <div style="
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
            ">
                ${pogResult.name}
            </div>
            
            <div style="
                font-size: 18px; 
                color: #e3f2fd;
                font-weight: bold;
            ">
                ${pogResult.rarity}
            </div>
        </div>
    `;
    
    centerReveal.style.display = 'block';
    await new Promise(resolve => setTimeout(resolve, 2000));
}

async function revealMythicPog(pogResult) {
    let centerReveal = document.getElementById('centerPogReveal');
    if (!centerReveal) {
        centerReveal = document.createElement('div');
        centerReveal.id = 'centerPogReveal';
        centerReveal.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10003;
        `;
        document.getElementById('gachaOverlay').appendChild(centerReveal);
    }
    
    centerReveal.innerHTML = `
        <div style="
            width: 280px;
            height: 180px;
            border-radius: 15px;
            background: linear-gradient(135deg, #ea00ffff, #f86de1ff);
            border: 4px solid white;
            box-shadow: 
                0 0 30px rgba(255, 0, 212, 0.8),
                0 0 60px rgba(255, 0, 255, 0.4);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: mythicPogReveal 1.5s ease-out;
            color: #ffd3fdff;
            text-align: center;
        ">
            <div style="
                font-size: 28px; 
                font-weight: bold; 
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            ">
                ${pogResult.name}
            </div>
            
            <div style="
                font-size: 20px; 
                color: #57075aff;
                font-weight: bold;
                text-shadow: 0 0 10px rgba(80, 9, 76, 0.8);
            ">
                ${pogResult.rarity.toUpperCase()} 
            </div>
        </div>
    `;
    
    centerReveal.style.display = 'block';
    await new Promise(resolve => setTimeout(resolve, 2500));
}

async function revealUniquePogInCenter(uniquePog) {
    let centerReveal = document.getElementById('centerPogReveal');
    if (!centerReveal) {
        centerReveal = document.createElement('div');
        centerReveal.id = 'centerPogReveal';
        centerReveal.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10003;
        `;
        document.getElementById('gachaOverlay').appendChild(centerReveal);
    }
    
    centerReveal.innerHTML = `
        <div style="
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: linear-gradient(135deg, 
                #ff00ff, #ff69b4, #9400d3, #ffd700);
            background-size: 400% 400%;
            border: 8px solid white;
            box-shadow: 
                0 0 50px rgba(255, 0, 255, 1),
                0 0 100px rgba(255, 215, 0, 0.8),
                inset 0 0 40px rgba(255, 255, 255, 0.2);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: uniquePogReveal 2s ease-out, uniqueBackgroundShimmer 2s ease-in-out infinite;
            color: white;
            text-align: center;
            position: relative;
            overflow: hidden;
        ">
            <div style="
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: conic-gradient(
                    transparent, 
                    rgba(255, 255, 255, 0.4), 
                    transparent, 
                    rgba(255, 255, 255, 0.4), 
                    transparent
                );
                animation: circularShine 4s linear infinite;
                border-radius: 50%;
            "></div>
            
            <div style="
                font-size: ${uniquePog.name.length > 12 ? '28px' : '32px'}; 
                font-weight: bold; 
                margin-bottom: 15px;
                text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
                z-index: 1;
                max-width: 240px;
                word-wrap: break-word;
                line-height: 1.2;
            ">
                ${uniquePog.name}
            </div>
            
            <div style="
                font-size: 24px; 
                color: #ffffff; 
                text-shadow: 0 0 15px #ff00ff, 0 0 25px #ffd700;
                font-weight: bold;
                z-index: 1;
            ">
                UNIQUE
            </div>
            
            <div style="
                position: absolute;
                width: 320px;
                height: 320px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                animation: orbitRing 6s linear infinite;
            "></div>
        </div>
    `;
    
    centerReveal.style.display = 'block';
}

// ===== MULTI-PULL SUMMARY FUNCTIONS =====
async function showResultsSummary(results, pullCount) {
    let centerReveal = document.getElementById('centerPogReveal');
    
    centerReveal.innerHTML = `
        <div style="
            background: rgba(0, 0, 20, 0.95);
            border-radius: 15px;
            padding: 30px;
            border: 3px solid #444;
            max-width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <h2 style="
                color: #ffd700;
                text-align: center;
                margin-bottom: 25px;
                font-size: 28px;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
            ">
                ${pullCount} Pull Summary
            </h2>
            
            <div style="
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                justify-content: center;
                align-items: center;
                margin-bottom: 25px;
            ">
                ${results.map((pog, index) => createSummaryPogCard(pog, index)).join('')}
            </div>
            
            <div style="
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 20px;
                text-align: center;
            ">
                <h3 style="color: white; margin-bottom: 10px;">Rarity Breakdown:</h3>
                <div style="color: #ccc; font-size: 14px; display: flex; align-items: center; justify-content: center;">
                    ${createRarityBreakdown(results)}
                </div>
            </div>
            
            <div style="text-align: center;">
                <button id="closeSummary" style="
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    transition: transform 0.2s;
                ">
                    Continue
                </button>
            </div>
        </div>
    `;
    
    const summaryCards = centerReveal.querySelectorAll('.summaryPogCard');
    summaryCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'pogCardReveal 0.4s ease-out forwards';
        }, index * 50);
    });
    
    centerReveal.style.display = 'block';
    
    document.getElementById('closeSummary').addEventListener('click', () => {
        hideSkipButton();
        cleanupGachaOverlay();
    });
}

function createSummaryPogCard(pog, index) {
    const rarityColors = {
        'Unique': { bg: 'linear-gradient(135deg, #ff00ff, #ffd700)', border: '#ff00ff' },
        'Mythic': { bg: 'linear-gradient(135deg, #e41bffff, #eecceeff)', border: '#ffffffff' },
        'Rare': { bg: 'linear-gradient(135deg, #40b1e6ff, #7ad9ffff)', border: '#1b94b3ff' },
        'Uncommon': { bg: 'linear-gradient(135deg, #27ae60, #58d68d)', border: '#27ae60' },
        'Common': { bg: 'linear-gradient(135deg, #e0c423ff, #dfce3aff)', border: '#c7b655ff' },
        'Trash': { bg: 'linear-gradient(135deg, #c53d3dff, #cf4343ff)', border: '#883030ff' }
    };
    
    const colors = rarityColors[pog.rarity] || rarityColors['Common'];
    
    return `
        <div class="summaryPogCard" style="
            width: 80px;
            height: 100px;
            background: ${colors.bg};
            border: 2px solid ${colors.border};
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            opacity: 0;
            transform: translateY(20px) scale(0.8);
            font-size: 10px;
            position: relative;
        ">
            <div style="font-weight: bold; margin-bottom: 3px; line-height: 1.1;">
                ${pog.name.length > 8 ? pog.name.substring(0, 8) + '...' : pog.name}
            </div>
            <div style="font-size: 8px; opacity: 0.9;">
                ${pog.rarity}
            </div>
        </div>
    `;
}

function createRarityBreakdown(results) {
    const counts = {};
    results.forEach(pog => {
        counts[pog.rarity] = (counts[pog.rarity] || 0) + 1;
    });
    
    return Object.entries(counts)
        .sort(([,a], [,b]) => b - a)
        .map(([rarity, count]) => `${rarity}: ${count}`)
        .join(' • ');
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    // Single crate buttons
    document.getElementById('crate1').addEventListener('click', () => 
        transaction(100, 0) // Trash Crate - $100
    );
    document.getElementById('crate2').addEventListener('click', () => 
        transaction(500, 1) // Common Crate - $500
    );
    document.getElementById('crate3').addEventListener('click', () => 
        transaction(1000, 2) // Uncommon Crate - $1000
    );
    document.getElementById('crate4').addEventListener('click', () => 
        transaction(7000, 3) // Mythic Crate - $7000
    );
});