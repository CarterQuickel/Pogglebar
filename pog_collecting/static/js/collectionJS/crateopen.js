// ===== HELPER FUNCTIONS =====

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
    if (inventory.length + count >= 999) {
        alert("Inventory full! Sell some pogs to make space.");
        return false;
    }
    return true;
}

// Replace the calculate/add/open functions with the cleaned versions below

function calculatePogResult(cost, index) {
    const crateKeys = Object.keys(crates || {});
    const key = crateKeys[index];
    if (!key) return null;
    const crate = crates[key];
    if (!crate || !Array.isArray(crate.rarities)) return null;

    let rand = Math.random();
    let cumulativeChance = 0;

    for (const item of crate.rarities) {
        cumulativeChance += Number(item.chance) || 0;
        if (rand < cumulativeChance) {
            const candidates = (pogList || []).filter(p => p.rarity === item.name);
            if (candidates.length === 0) return null;
            const chosen = candidates[Math.floor(Math.random() * candidates.length)];
            console.log(chosen)

            const meta = (rarityColor || []).find(r => r.name === chosen.rarity) || {};
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
    return null;
}

function openCrate(cost, index) {
    
    const result = calculatePogResult(cost, index);
    if (!result) return;
    // play animation path here if desired, then add
    addPogToInventory(result);
    cratesOpened = (typeof cratesOpened === 'number' ? cratesOpened : 0) + 1;
    refreshInventory();
}

function openMultipleCrates(cost, index, count) {
    
    const results = [];
    for (let i = 0; i < count; i++) {
        const res = calculatePogResult(cost, index);
        if (res) results.push(res);
    }
    // Optionally animate sequential reveals here
    results.forEach(r => addPogToInventory(r));
    cratesOpened = (typeof cratesOpened === 'number' ? cratesOpened : 0) + results.length;
    refreshInventory();
}

// ===== ANIMATION FUNCTIONS (for future integration) =====

//reduces lag
function cleanupGachaOverlay() {
    document.getElementById('gachaOverlay').style.display = 'none';
        document.getElementById('shootingStarsContainer').innerHTML = '';
        const centerReveal = document.getElementById('centerPogReveal');
        if (centerReveal) {
            centerReveal.style.display = 'none';
            centerReveal.innerHTML = '';
        }
}

// ===== UPDATED SINGLE CRATE WITH BETTER CLEANUP =====

async function openCrateWithAnimation(cost, index) {

    const result = calculatePogResult(cost, index);
    if (!result) return;

    // Show animation based on rarity
    await showAnimationForRarity(result.rarity, result);

    // Add to inventory AFTER animation completes
    addPogToInventory(result);
    cratesOpened++;
    
    // Make sure inventory refreshes and is visible
    refreshInventory();
}


async function openMultipleCratesWithAnimation(cost, index, count) {
    
    // Calculate all results
    const results = [];
    for (let i = 0; i < count; i++) {
        const result = calculatePogResult(cost, index);
        if (result) results.push(result);
    }

    // TODO: Add multi-pull animation
    // await showMultiPullAnimation(results, count);

    // Add all to inventory
    results.forEach(result => addPogToInventory(result));
    cratesOpened += count;
    refreshInventory();
}

// ===== EVENT LISTENERS =====

const crateButtons = [
    { single: "crate1", multi5: "crate1_b5", multi10: "crate1_b10", index: 0 },
    { single: "crate2", multi5: "crate2_b5", multi10: "crate2_b10", index: 1 },
    { single: "crate3", multi5: "crate3_b5", multi10: "crate3_b10", index: 2 },
    { single: "crate4", multi5: "crate4_b5", multi10: "crate4_b10", index: 3 },
    { single: "crate5", multi5: "crate5_b5", multi10: "crate5_b10", index: 4 }
];

// ===== ANIMATION INTEGRATION =====

async function showAnimationForRarity(rarity, pogResult) {
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
    
    const isSpecial = rarity === 'Unique' || rarity === 'Mythic';
    await showClickToContinue(isSpecial);
    
    if (rarity === 'Unique') {
        await createMiniExplosion();
        await revealUniquePogInCenter(pogResult);
        await showUniqueParticleExplosion();
    }
    
    cleanupGachaOverlay();
}

// Updated main functions with animation
async function openCrateWithAnimation(cost, index) {
    const result = calculatePogResult(cost, index);
    if (!result) return;

    // changed it so the pog is added before animation to prevent save scumming
    addPogToInventory(result);
    cratesOpened++;
    refreshInventory();
    
    // Show animation based on rarity
    showAnimationForRarity(result.rarity, result);
}


// ===== UPDATED EVENT LISTENERS =====

// Set up all event listeners with animation
// ===== UPDATED EVENT LISTENERS WITH MULTI-PULL ANIMATIONS =====
function amount() {
    const boxnum = document.getElementById("amountSelect").value;
    console.log(boxnum);
    return parseInt(boxnum);
}
crateButtons.forEach(crate => {
    const price = crates[Object.keys(crates)[crate.index]].price;

    // Single crate WITH animation
    document.getElementById(crate.single).addEventListener("click", () =>
        transaction(price, crate.index)
    );
});

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
    
    // Wait for click
    return new Promise(resolve => {
        const handleClick = () => {
            clickDiv.style.display = 'none';
            document.removeEventListener('click', handleClick);
            resolve();
        };
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
            animation: miniExplode 1s ease-out forwards;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
            z-index: 10001;
        `;
        
        particle.style.setProperty('--miniX', endX + 'px');
        particle.style.setProperty('--miniY', endY + 'px');
        
        container.appendChild(particle);
    }
    
    // Wait for mini explosion to finish
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clean up mini particles
    const miniParticles = container.querySelectorAll('[style*="miniExplode"]');
    miniParticles.forEach(particle => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    });
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
    
    // Circular pog display
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
            <!-- Circular shine effect -->
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
            
            <!-- Pog Name -->
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
            
            <!-- Rarity Label -->
            <div style="
                font-size: 24px; 
                color: #ffffff; 
                text-shadow: 0 0 15px #ff00ff, 0 0 25px #ffd700;
                font-weight: bold;
                z-index: 1;
            ">
                UNIQUE
            </div>
            
            <!-- Orbiting ring -->
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

async function showUniqueParticleExplosion() {
    const container = document.getElementById('shootingStarsContainer');
    
    // Create 25 big rainbow particles
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
    
    // Clean up particles
    const particles = container.querySelectorAll('[style*="explodeRainbow"]');
    particles.forEach(particle => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    });
}

function addUniqueScreenEffects() {
    // Rainbow border flash effect
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
    
    // Remove after animation
    setTimeout(() => {
        if (border.parentNode) {
            border.parentNode.removeChild(border);
        }
    }, 6000);
}

// ===== MAIN ANIMATION SEQUENCES =====

async function showAnimationForRarity(rarity, pogResult) {
    document.getElementById('gachaOverlay').style.display = 'block';
    
    // Determine animation type and settings
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
    
    // Step 1: Shooting stars
    createStarShapedShootingStars(animationType, starCount);
    await new Promise(resolve => setTimeout(resolve, duration));
    
    // Step 2: Click to continue
    const isSpecial = rarity === 'Unique' || rarity === 'Mythic';
    await showClickToContinue(isSpecial);
    
    // Step 3: Show pog result based on rarity
    if (rarity === 'Unique') {
        await createMiniExplosion();
        await revealUniquePogInCenter(pogResult);
        await showUniqueParticleExplosion();
    } else if (rarity === 'Mythic') {
        await revealMythicPog(pogResult);
    } else {
        // Show simple reveal for common pogs
        await revealCommonPog(pogResult);
    }
    
    // Step 4: Clean up
    cleanupGachaOverlay();
}


// ===== TEST FUNCTIONS =====

async function testCompleteStarAnimation() {
    console.log("Testing complete star animation...");
    
    // Create fake unique pog for testing
    const testPog = {
        name: "Rainbow Dragon",
        rarity: "Unique"
    };
    
    await showAnimationForRarity('Unique', testPog);
}

async function testNormalAnimation() {
    console.log("Testing normal animation...");
    
    const testPog = {
        name: "Common Pog",
        rarity: "Common"
    };
    
    await showAnimationForRarity('Common', testPog);
}

async function testMythicAnimation() {
    console.log("Testing mythic animation...");
    
    const testPog = {
        name: "Mythic Pog",
        rarity: "Mythic"
    };
    
    await showAnimationForRarity('Mythic', testPog);
}

// ===== MULTI-PULL WITH ANIMATION =====

async function openMultipleCratesWithAnimation(cost, index, count) {
    // Calculate all results first
    const results = [];
    for (let i = 0; i < count; i++) {
        const result = calculatePogResult(cost, index);
        if (result) results.push(result);
    }

    console.log(`Multi-pull results:`, results.map(r => `${r.name} (${r.rarity})`));

    // Determine the highest rarity pulled
    const rarityOrder = { 'Unique': 6, 'Mythic': 5, 'Rare': 4, 'Uncommon': 3, 'Common': 2, 'Trash': 1 };
    const highestRarity = results.reduce((highest, pog) => 
        rarityOrder[pog.rarity] > rarityOrder[highest.rarity] ? pog : highest
    );

    // Add all pogs to inventory AFTER animation
    results.forEach(result => addPogToInventory(result));

    // Deduct money and update
    cratesOpened += count;
    refreshInventory();

    // Show multi-pull animation
    showMultiPullAnimation(results, count, highestRarity);

}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function addPogToInventory(pogResult) {
    if (!pogResult) return;
    
    console.log("Adding pog to inventory:", pogResult.name, pogResult.rarity); // DEBUG
    
    // add to pog amount if new pog
    let ownedQueue = { name: pogResult.name, rarity: pogResult.rarity, pogcol: pogResult.pogcol };
    const alreadyOwned = pogAmount.find(pog =>
        pog.name === ownedQueue.name &&
        pog.rarity === ownedQueue.rarity &&
        pog.pogcol === ownedQueue.pogcol
    );
    if (!alreadyOwned) {
        pogAmount.push(ownedQueue)
    }

    //add pog to inventory
    document.getElementById("descPanel").innerHTML = "";
    inventory.push(pogResult);

    // XP gain
    xp += Math.floor(pogResult.income * (15 * level / 15));
    sorting();
    levelup();
    save();
}

// Simple reveal for common pogs
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
    
    // Simple rectangular card for common pogs
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
    
    // Wait for user to see it
    await new Promise(resolve => setTimeout(resolve, 2000));
}

// Mythic pog reveal (golden theme)
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
    
    // Golden card for mythic pogs
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
    
    // Wait for user to see it
    await new Promise(resolve => setTimeout(resolve, 2500));
}

async function showMultiPullAnimation(results, pullCount, highestRarity) {
    document.getElementById('gachaOverlay').style.display = 'block';
    
    // Determine animation type based on highest rarity
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
    
    // Step 1: Shooting stars (one animation for all pulls)
    createStarShapedShootingStars(animationType, starCount);
    await new Promise(resolve => setTimeout(resolve, duration));
    
    // Step 2: Click to continue
    const hasSpecial = results.some(r => r.rarity === 'Unique' || r.rarity === 'Mythic');
    await showClickToContinue(hasSpecial);
    
    // Step 3: Show ALL pogs in a line
    await showAllPogResults(results, pullCount);
    
    // Step 4: Special effects for unique pogs
    const uniquePogs = results.filter(r => r.rarity === 'Unique');
    if (uniquePogs.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function showAllPogResults(results, pullCount) {
    // Sort results by rarity (highest to lowest)
    const rarityOrder = { 'Unique': 6, 'Mythic': 5, 'Rare': 4, 'Uncommon': 3, 'Common': 2, 'Trash': 1 };
    const sortedResults = [...results].sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
    
    // Step 1: Show each pog individually
    for (let i = 0; i < sortedResults.length; i++) {
        const pog = sortedResults[i];
        const isLast = i === sortedResults.length - 1;
        
        await showIndividualPog(pog, i + 1, pullCount, isLast);
    }
    
    // Step 2: Show summary of all results
    await showResultsSummary(sortedResults, pullCount);
}

async function showIndividualPog(pog, currentIndex, totalCount, isLast) {
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
    
    // Get rarity styling
    const rarityStyles = {
        'Unique': {
            bg: 'linear-gradient(135deg, #ff00ff, #ffd700)', border: '#ff00ff', shadow: 'rgba(255, 0, 255, 0.8)', textColor: 'white', size: '320px', effects: `
                <div style="
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: conic-gradient(transparent, rgba(255, 255, 255, 0.4), transparent);
                    animation: circularShine 3s linear infinite;
                    border-radius: 50%;
                "></div>
            `
        },
        'Mythic': {
            bg: 'linear-gradient(135deg, #9b59b6, #c39bd3)', border: '#9b59b6', shadow: 'rgba(155, 89, 182, 0.6)', textColor: 'white', size: '280px', effects: ''
        },
        'Rare': {
            bg: 'linear-gradient(135deg, #4a9eff, #7bb3ff)', border: '#7bb3ff', shadow: 'rgba(123, 179, 255, 0.5)', textColor: 'white', size: '260px', effects: ''
        },
        'Uncommon': {
            bg: 'linear-gradient(135deg, #27ae60, #58d68d)', border: '#27ae60', shadow: 'rgba(39, 174, 96, 0.5)', textColor: 'white', size: '240px', effects: ''
        },
        'Common': {
            bg: 'linear-gradient(135deg, #ffd700, #ffed4a)', border: '#ffd700', shadow: 'rgba(255, 215, 0, 0.8)', textColor: 'white', size: '230px', effects: ''
        },
        'Trash': {
            bg: 'linear-gradient(135deg, #c93939ff, #c44747ff)', border: '#af2b2bff', shadow: 'rgba(153, 153, 153, 0.3)', textColor: 'white', size: '220px', effects: ''
        }
    };
    
    const style = rarityStyles[pog.rarity] || rarityStyles['Common'];
    const isUnique = pog.rarity === 'Unique';
    const shape = isUnique ? '50%' : '15px'; // Circle for unique, rounded rectangle for others
    
    centerReveal.innerHTML = `
        <div style="
            width: ${style.size};
            height: ${style.size};
            border-radius: ${shape};
            background: ${style.bg};
            background-size: 400% 400%;
            border: ${isUnique ? '8px' : '5px'} solid ${style.border};
            box-shadow: ${style.shadow};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: ${isUnique ? 'uniquePogReveal 2s ease-out, uniqueBackgroundShimmer 2s ease-in-out infinite' : 'individualPogReveal 1.2s ease-out'};
            color: ${style.textColor};
            text-align: center;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        ">
            ${style.effects}
            
            <!-- Progress indicator -->
            <div style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 14px;
                z-index: 2;
            ">
                ${currentIndex}/${totalCount}
            </div>
            
            <!-- Pog Name -->
            <div style="
                font-size: ${pog.name.length > 12 ? (isUnique ? '28px' : '20px') : (isUnique ? '32px' : '24px')}; 
                font-weight: bold; 
                margin-bottom: 15px;
                text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
                z-index: 1;
                max-width: ${parseInt(style.size) - 40}px;
                word-wrap: break-word;
                line-height: 1.2;
            ">
                ${pog.name}
            </div>
            
            <!-- Rarity Label -->
            <div style="
                font-size: ${isUnique ? '24px' : '18px'}; 
                font-weight: bold;
                z-index: 1;
                text-shadow: ${isUnique ? '0 0 15px #ff00ff, 0 0 25px #ffd700' : '2px 2px 4px rgba(0,0,0,0.8)'};
                margin-bottom: 15px;
            ">
                ${pog.rarity.toUpperCase()}
            </div>
            
            <!-- Click instruction -->
            <div style="
                position: absolute;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 14px;
                opacity: 0.8;
                animation: pulse 1.5s infinite;
                z-index: 1;
            ">
                ${isLast ? 'Click to see summary' : 'Click for next pog'}
            </div>
            
            ${isUnique ? `
                <div style="
                    position: absolute;
                    width: ${parseInt(style.size) + 40}px;
                    height: ${parseInt(style.size) + 40}px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    animation: orbitRing 6s linear infinite;
                "></div>
            ` : ''}
        </div>
    `;
    
    centerReveal.style.display = 'block';
    
    // Wait for click
    return new Promise(resolve => {
        const handleClick = () => {
            document.removeEventListener('click', handleClick);
            resolve();
        };
        document.addEventListener('click', handleClick);
    });
}

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
            
            <!-- Rarity breakdown -->
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
    
    // Animate summary cards appearing
    const summaryCards = centerReveal.querySelectorAll('.summaryPogCard');
    summaryCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'pogCardReveal 0.4s ease-out forwards';
        }, index * 50);
    });
    
    document.getElementById('closeSummary').addEventListener('click', () => {
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


function createPogResultCard(pog, index) {
    // Get rarity colors
    const rarityColors = {
        'Unique': { bg: 'linear-gradient(135deg, #ff00ff, #ff69b4, #9400d3, #ffd700)', border: '#ff00ff', shadow: 'rgba(255, 0, 255, 0.8)' },
        'Mythic': { bg: 'linear-gradient(135deg, #9b59b6, #c39bd3)', border: '#9b59b6', shadow: 'rgba(155, 89, 182, 0.6)' },
        'Rare': { bg: 'linear-gradient(135deg, #4a9eff, #7bb3ff)', border: '#7bb3ff', shadow: 'rgba(123, 179, 255, 0.5)' },
        'Uncommon': { bg: 'linear-gradient(135deg, #27ae60, #58d68d)', border: '#27ae60', shadow: 'rgba(39, 174, 96, 0.5)' },
        'Common': { bg: 'linear-gradient(135deg, #ffd700, #ffed4a)', border: '#ffd700', shadow: 'rgba(255, 215, 0, 0.8)' },
        'Trash': { bg: 'linear-gradient(135deg, #c93939ff, #c44747ff)', border: '#af2b2bff', shadow: 'rgba(153, 153, 153, 0.3)' }
    };
    
    const colors = rarityColors[pog.rarity] || rarityColors['Common'];
    
    return `
        <div class="pogResultCard" style="
            width: 120px;
            height: 160px;
            background: ${colors.bg};
            border: 3px solid ${colors.border};
            border-radius: 12px;
            box-shadow: 0 0 20px ${colors.shadow};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            opacity: 0;
            transform: translateY(30px) scale(0.8);
            animation-delay: ${index * 100}ms;
            position: relative;
            overflow: hidden;
        ">
            ${pog.rarity === 'Unique' ? `
                <div style="
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: conic-gradient(transparent, rgba(255, 255, 255, 0.3), transparent);
                    animation: circularShine 2s linear infinite;
                "></div>
            ` : ''}
            
            <div style="
                font-size: ${pog.name.length > 12 ? '12px' : '14px'};
                font-weight: bold;
                margin-bottom: 8px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                z-index: 1;
                max-width: 100px;
                word-wrap: break-word;
                line-height: 1.2;
            ">
                ${pog.name}
            </div>
            
            <div style="
                font-size: 12px;
                font-weight: bold;
                z-index: 1;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            ">
                ${pog.rarity}
            </div>
        </div>
    `;
}