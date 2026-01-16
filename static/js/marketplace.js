// Debug: Check the raw script tag contents
const userdataElement = document.getElementById("userdata");
const pogListElement = document.getElementById("pogList");

console.log('=== CLIENT-SIDE DEBUG ===');
console.log('userdata element exists:', !!userdataElement);
console.log('userdata raw textContent:', userdataElement?.textContent);
console.log('pogList element exists:', !!pogListElement);
console.log('pogList raw textContent:', pogListElement?.textContent);

// Your existing parsing code
const userdata = (() => { 
    try { 
        return JSON.parse(document.getElementById("userdata")?.textContent || '{}'); 
    } catch (e) { 
        console.error('Error parsing userdata:', e);
        return {}; 
    } 
})();

let pogList = (() => { 
    try { 
        return JSON.parse(document.getElementById("pogList")?.textContent || '[]'); 
    } catch (e) { 
        console.error('Error parsing pogList:', e);
        return []; 
    } 
})();

console.log('Parsed userdata:', userdata);
console.log('Parsed pogList length:', pogList.length);
console.log('================================');


// Theme setup
if (userdata.theme === "light") { 
    document.body.style.backgroundColor = "white"; 
    document.body.style.color = "black"; 
    const messageCont = document.getElementById("messageCont");
    if (messageCont) {
        messageCont.style.backgroundColor = "white";
        messageCont.style.color = "black";
    }
} else if (userdata.theme === "dark") { 
    document.body.style.backgroundColor = "black"; 
    document.body.style.color = "white"; 
}

// PFP (default for current user)
const pfp = (userdata && userdata.pfp) ? userdata.pfp : '/static/icons/pfp/defaultpfp.png';

// Add this to your marketplace.js
document.addEventListener('DOMContentLoaded', () => {
    // Find the marketplace content area
    const marketplaceContent = document.getElementById('marketplaceContent');
    
    if (marketplaceContent) {
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            padding: 20px;
        `;
        
        // Create the button
        const createAuctionBtn = document.createElement('button');
        createAuctionBtn.id = 'createAuctionButton';
        createAuctionBtn.textContent = 'Create New Auction';
        createAuctionBtn.onclick = showCreateAuctionPopup;
        createAuctionBtn.style.cssText = `
            padding: 15px 30px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.3s ease;
        `;
        
        // Hover effect
        createAuctionBtn.addEventListener('mouseenter', () => {
            createAuctionBtn.style.backgroundColor = '#218838';
        });
        createAuctionBtn.addEventListener('mouseleave', () => {
            createAuctionBtn.style.backgroundColor = '#28a745';
        });
        
        buttonContainer.appendChild(createAuctionBtn);
        
        // Insert at the beginning of marketplace content
        marketplaceContent.insertBefore(buttonContainer, marketplaceContent.firstChild);
    }
});


const socket = io(); 
const myName = userdata.displayName || userdata.displayname || 'Guest';
let pogContainer = document.getElementById('pogContainer');

// Helper: sync current session inventory to server-side DB
function syncInventoryToServer() {
    try {
        const inv = Array.isArray(userdata.inventory) ? userdata.inventory : [];
        // If session doesn't include a display name, skip (server endpoint needs it)
        return fetch('/api/user/sync-inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inventory: inv })
        }).then(r => r.ok ? r.json() : Promise.reject(r)).then(res => {
            console.log('Inventory sync result:', res);
            return res;
        }).catch(err => {
            console.warn('Failed to sync inventory to server:', err);
            return null;
        });
    } catch (e) {
        console.warn('Exception while syncing inventory:', e);
        return Promise.resolve(null);
    }
}

function renderAuction(auction) {
    if (!auction) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'auction-card';
    wrapper.setAttribute('data-auction', `${auction.user_id}-${auction.pog}`);
    
    // Time calculation (your format: "5m 32s left" or "EXPIRED")
    // Be defensive: support different casing for auction time and missing createdAt
    const auctionMinutes = auction.AuctionTime || auction.auctionTime || 30;
    const endTime = (auction.createdAt || Date.now()) + (auctionMinutes * 60 * 1000);
    const timeLeft = endTime - Date.now();
    
    let timeDisplay;
    if (timeLeft > 0) {
        const minutes = Math.floor(timeLeft / (60 * 1000));
        const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
        timeDisplay = `${minutes}m ${seconds}s left`;
    } else {
        timeDisplay = "EXPIRED";
    }
    
    // Current bid logic
    const currentBid = auction.winner_bid || auction.startPrice;
    const isFirstBid = !auction.winner_bid;
    
    // Theme setup (following your trade room)
    const isLight = userdata.theme === 'light';
    const textColor = isLight ? 'black' : 'white';
    const metaColor = isLight ? '#333' : '#ddd';
    
    // Can user interact with this auction?
    const canBid = auction.AuctionStatus === 'active' && 
                   timeLeft > 0 && 
                   auction.user_id !== userdata.fid;
    
    // TODO: Build the HTML content
    wrapper.innerHTML = `
    <!-- Your layout: item, time, bid+bidder, buy now, buttons -->
    <div class="pog-name">
        <strong style="color: ${textColor};">${auction.pog}</strong>
    </div>
    <div class="pog-time" style="color: ${metaColor};">${timeDisplay}</div>
    <div class="pog-bid" style="color: ${textColor};">
        Current Bid: $${currentBid} ${isFirstBid ? '(Starting Price)' : ''}
    </div>
    <div class="pog-bidder" style="color: ${metaColor};">
        ${auction.winner_name ? 
            `<img src="${auction.winner_pfp || '/static/icons/pfp/defaultpfp.png'}" class="winner-pfp"> Highest Bidder: ${auction.winner_name}` 
            : 'No bids yet'}
    </div>
    <div class="buy-now-price" style="color: ${textColor};">
        Buy It Now: $${auction.maxAcceptedBid}
    </div>
    <div class="pog-actions">
        ${canBid ? `<button class="bid-button" onclick="placeBid('${auction.user_id}', '${auction.pog}', ${currentBid}, ${auction.minBidIncrement})">Place Bid</button>` : ''}
        ${canBid ? `<button class="buy-now-button" onclick="buyItNow('${auction.user_id}', '${auction.pog}', ${auction.maxAcceptedBid})">Buy It Now</button>` : ''}
    </div>
`;

    
    const container = pogContainer || document.getElementById('pogContainer');
    if (!container) return; // nothing to attach to
    // keep reference for future calls
    pogContainer = container;
    container.appendChild(wrapper);
    
    // Theme styling (following your trade room pattern)
    if (isLight) {
        wrapper.style.backgroundColor = 'rgba(255,255,255,0.9)';
        wrapper.style.color = 'black';
    } else {
        wrapper.style.backgroundColor = 'rgba(0,0,0,0.3)';
        wrapper.style.color = 'white';
    }
}

function placeBid(sellerId, pogName, currentBid, minIncrement) {
    const minimumBid = currentBid + minIncrement;
    
    // Create popup asking for bid amount
    const bidAmount = prompt(
        `Place your bid for ${pogName}\n\n` +
        `Current Bid: $${currentBid}\n` +
        `Minimum Bid: $${minimumBid}\n\n` +
        `Enter your bid amount:`
    );
    
    // User cancelled
    if (bidAmount === null) return;
    
    // Convert to number and validate
    const bid = parseInt(bidAmount);
    
    // Validation checks
    if (isNaN(bid)) {
        alert('Please enter a valid number');
        return;
    }
    
    if (bid < minimumBid) {
        alert(`Your bid must be at least $${minimumBid}`);
        return;
    }
    
    // Check if user has enough money
    if (bid > userdata.score) {
        alert(`You don't have enough money. You have $${userdata.score}`);
        return;
    }
    
    // Confirm the bid
    if (confirm(`Confirm bid of $${bid} for ${pogName}?`)) {
        // Send bid to server via socket
        socket.emit('place bid', {
            sellerId: sellerId,
            pogName: pogName,
            bidAmount: bid,
            bidderName: myName,
            bidderPfp: userdata.pfp,
            bidderId: userdata.fid
        });
    }
}

function buyItNow(sellerId, pogName, price) {
    // Check if user has enough money
    if (price > userdata.score) {
        alert(`You don't have enough money. You need $${price} but only have $${userdata.score}`);
        return;
    }
    
    // Confirm the purchase
    if (confirm(`Buy ${pogName} now for $${price}?`)) {
        // Send buy it now to server via socket
        socket.emit('buy it now', {
            sellerId: sellerId,
            pogName: pogName,
            price: price,
            buyerName: myName,
            buyerPfp: userdata.pfp,
            buyerId: userdata.fid
        });
    }
}

function updateAuctionCard(auction) {
    // Find the existing auction card
    const existingCard = document.querySelector(`[data-auction="${auction.user_id}-${auction.pog}"]`);
    
    if (existingCard) {
        // Remove the old card
        existingCard.remove();
    }
    
    // Render the updated auction card
    renderAuction(auction);
}


// Move these socket listeners OUTSIDE and BEFORE the 'auction completed' listener

// Handle bid updates (broadcast to all clients)
socket.on('bid placed', (updatedAuction) => {
    updateAuctionCard(updatedAuction);
});

// Handle auction creation
socket.on('auction created', (newAuction) => {
    // support both numeric fid and string displayName identifiers
    const auctionUserId = newAuction.user_id;
    const myIds = [userdata.fid, userdata.displayName, userdata.displayname].map(String);
    if (myIds.includes(String(auctionUserId))) {
        userdata.inventory = userdata.inventory.filter(pog => pog.name !== newAuction.pog);
        if (typeof save === 'function') {
            save();
        }
        alert(`Auction created for ${newAuction.pog}!`);
    }
    renderAuction(newAuction);
});

// Handle auction expiration
socket.on('auction expired', (expiredAuction) => {
    if (expiredAuction.user_id === userdata.fid) {
        const pogDetails = pogList.find(pog => pog.name === expiredAuction.pog);
        if (pogDetails) {
            userdata.inventory.push(pogDetails);
        }
        if (typeof save === 'function') {
            save();
        }
        alert(`Your auction for ${expiredAuction.pog} expired with no bids. Item returned to inventory.`);
    }
    updateAuctionCard(expiredAuction);
});

// Handle errors
socket.on('bid error', (error) => {
    alert(error.message);
});

socket.on('buy error', (error) => {
    alert(error.message);
});
// Auction errors
socket.on('auction error', (error) => {
    alert(error.message || 'Auction error');
});

// Handle auction history
socket.on('auction history', (auctions) => {
    pogContainer.innerHTML = ''; // Clear existing
    (auctions || []).forEach(renderAuction);
});

// NOW put the auction completed listener
socket.on('auction completed', (completedAuction) => {
    // Update the card to show completion
    updateAuctionCard(completedAuction);

    // Normalize ids for comparison to avoid type/coercion mismatches
    const winnerId = completedAuction.winner_id != null ? String(completedAuction.winner_id) : null;
    const sellerId = completedAuction.user_id != null ? String(completedAuction.user_id) : null;
    const myId = userdata && (userdata.fid != null ? String(userdata.fid) : String(userdata.displayName || userdata.displayname || ''));

    // If I'm the winner, add pog to my inventory and deduct money
    if (winnerId && myId && winnerId === myId) {
        userdata.score = (typeof userdata.score === 'number') ? userdata.score - (completedAuction.winner_bid || 0) : userdata.score;

        if (!Array.isArray(userdata.inventory)) userdata.inventory = [];
        let pogDetails = pogList.find(pog => pog.name === completedAuction.pog);
        if (!pogDetails) {
            // fallback minimal pog structure
            pogDetails = { name: completedAuction.pog };
        }
        userdata.inventory.push(pogDetails);

        alert(`Congratulations! You won ${completedAuction.pog} for $${completedAuction.winner_bid}!`);

        // Persist buyer inventory to server (and also call local save if available)
        syncInventoryToServer().then(() => {
            if (typeof save === 'function') save();
        });
    }

    // If I'm the seller, credit money and ensure my state is saved
    if (sellerId && myId && sellerId === myId) {
        userdata.score = (typeof userdata.score === 'number') ? userdata.score + (completedAuction.winner_bid || 0) : userdata.score;
        alert(`Your ${completedAuction.pog} sold for $${completedAuction.winner_bid}!`);

        // Persist seller inventory/state to server (auction creation likely removed the pog earlier, but persist any state changes)
        syncInventoryToServer().then(() => {
            if (typeof save === 'function') save();
        });
    }
});

// Load existing auctions when page loads
setTimeout(() => {
    if (pogContainer.children.length === 0) {
        fetch('/api/auctions/active').then(r => r.ok ? r.json() : []).then(auctions => {
            pogContainer.innerHTML = '';
            (auctions || []).forEach(renderAuction);
        }).catch(() => {});
    }
}, 300);


//form popup
function showCreateAuctionPopup() {
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'auctionPopupOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;

    // Create popup content
    const popup = document.createElement('div');
    popup.id = 'auctionPopup';
    popup.style.cssText = `
        background-color: ${userdata.theme === 'light' ? 'white' : '#333'};
        color: ${userdata.theme === 'light' ? 'black' : 'white'};
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        width: 400px;
        max-width: 90%;
    `;

    popup.innerHTML = `
        <h2 style="text-align: center; margin-bottom: 20px;">Create Auction</h2>
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Select Pog to Auction:</label>
            <select id="auctionPogSelect" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
                <option value="">Choose a pog...</option>
            </select>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Starting Price ($):</label>
            <input type="number" id="startingPrice" min="1" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Buy It Now Price ($):</label>
            <input type="number" id="buyNowPrice" min="1" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Minimum Bid Increment ($):</label>
            <input type="number" id="minIncrement" min="1" value="1" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Auction Duration (minutes):</label>
            <input type="number" id="auctionDuration" min="1" value="30" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
        </div>

        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="createAuctionBtn" style="padding: 12px 24px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Create Auction</button>
            <button id="cancelAuctionBtn" style="padding: 12px 24px; background-color: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Cancel</button>
        </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Populate pog dropdown with user's tradeable inventory
    populateAuctionPogDropdown();

    // Add event listeners
    document.getElementById('cancelAuctionBtn').addEventListener('click', closeAuctionPopup);
    document.getElementById('createAuctionBtn').addEventListener('click', submitAuction);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAuctionPopup();
    });
}

function populateAuctionPogDropdown() {
    const select = document.getElementById('auctionPogSelect');
    if (!select || !userdata.inventory) return;

    // DEBUG: Check what we're working with
    console.log('DEBUG: userdata:', userdata);
    console.log('DEBUG: userdata.inventory:', userdata.inventory);
    console.log('DEBUG: inventory length:', userdata.inventory ? userdata.inventory.length : 'undefined');

    // Clear existing options except first
    select.innerHTML = '<option value="">Choose a pog...</option>';

    // Add tradeable pogs (non-unique)
    const tradeablePogs = userdata.inventory.filter(pog => pog.rarity !== "Unique");
    console.log('DEBUG: tradeable pogs:', tradeablePogs);
    console.log('DEBUG: tradeable pogs length:', tradeablePogs.length);

    tradeablePogs.forEach(pog => {
        console.log('DEBUG: Adding pog to dropdown:', pog.name, pog.rarity);
        const option = document.createElement('option');
        option.value = pog.name;
        option.textContent = pog.name;
        select.appendChild(option);
    });
}


function closeAuctionPopup() {
    const overlay = document.getElementById('auctionPopupOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function submitAuction() {
    console.log('=== SUBMIT AUCTION DEBUG ===');
    
    // Get form values
    const pogName = document.getElementById('auctionPogSelect').value;
    const startPrice = parseInt(document.getElementById('startingPrice').value);
    const buyNowPrice = parseInt(document.getElementById('buyNowPrice').value);
    const minIncrement = parseInt(document.getElementById('minIncrement').value);
    const duration = parseInt(document.getElementById('auctionDuration').value);

    console.log('Form values:');
    console.log('- pogName:', pogName);
    console.log('- startPrice:', startPrice);
    console.log('- buyNowPrice:', buyNowPrice);
    console.log('- minIncrement:', minIncrement);
    console.log('- duration:', duration);
    console.log('- userdata.fid:', userdata.fid);
    console.log('- myName:', myName);
    console.log('- userdata.pfp:', userdata.pfp);

    // Validation
    if (!pogName) {
        console.log('Validation failed: No pog selected');
        alert('Please select a pog to auction');
        return;
    }
    if (!startPrice || startPrice < 1) {
        console.log('Validation failed: Invalid starting price');
        alert('Please enter a valid starting price');
        return;
    }
    if (!buyNowPrice || buyNowPrice <= startPrice) {
        console.log('Validation failed: Buy now price too low');
        alert('Buy It Now price must be higher than starting price');
        return;
    }
    if (!minIncrement || minIncrement < 1) {
        console.log('Validation failed: Invalid increment');
        alert('Please enter a valid minimum bid increment');
        return;
    }
    if (!duration || duration < 1) {
        console.log('Validation failed: Invalid duration');
        alert('Please enter a valid auction duration');
        return;
    }

    console.log('All validations passed');
    console.log('Socket connected?', socket.connected);

    // Send to server
    const auctionData = {
        pogName: pogName,
        startPrice: startPrice,
        maxAcceptedBid: buyNowPrice,
        minBidIncrement: minIncrement,
        auctionTime: duration,
        sellerName: myName,
        sellerPfp: userdata.pfp,
        // server expects a display name (userSettings.displayname) when checking inventory
        sellerId: userdata.displayName || userdata.displayname || userdata.fid
    };

    console.log('Sending auction data:', auctionData);
    socket.emit('create auction', auctionData);
    console.log('Socket emit sent');
    console.log('=============================');

    // Close popup
    closeAuctionPopup();
}


// Initialize when page loads - ADD THIS
setTimeout(() => {
    // Test if userdata loaded properly
    console.log('DEBUG: Page loaded, userdata:', userdata);
    console.log('DEBUG: Page loaded, inventory:', userdata.inventory);
    
    // Load existing auctions
    if (pogContainer.children.length === 0) {
        fetch('/api/auctions/active').then(r => r.ok ? r.json() : []).then(auctions => {
            pogContainer.innerHTML = '';
            (auctions || []).forEach(renderAuction);
        }).catch(() => {});
    }
}, 300);
