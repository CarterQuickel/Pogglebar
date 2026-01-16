// Get userdata and pogList from EJS
const userdata = (() => { try { return JSON.parse(document.getElementById("userdata")?.textContent || '{}'); } catch (e) { return {}; } })();
const pogList = (() => { try { return JSON.parse(document.getElementById("pogList")?.textContent || '[]'); } catch (e) { return []; } })();

// Theme setup
if (userdata.theme === "light") { 
    document.body.style.backgroundColor = "white"; 
    document.body.style.color = "black"; 
    document.getElementById("messageCont").style.backgroundColor = "white";
    document.getElementById("messageCont").style.color = "black";
} else if (userdata.theme === "dark") { 
    document.body.style.backgroundColor = "black"; 
    document.body.style.color = "white"; 
}

const socket = io(); 
const myName = userdata.displayName || userdata.displayname || 'Guest';

// Update these to target trade elements
const tradeForm = document.getElementById('tradeForm'); 
const messageCont = document.getElementById("messageCont");

function escapeHtml(s = '') {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return String(s).replace(/[&<>"']/g, (m) => map[m]);
}

// Helper function to get specific pog color from pogList
function getItemColor(itemName) {
    // Look up the pog in pogList to get its specific color
    if (pogList) {
        const pogItem = pogList.find(pog => pog.name === itemName);
        if (pogItem && pogItem.color) {
            return pogItem.color;
        }
    }
    
    // Default color if not found
    return '#888';
}

// Populate trade dropdowns function with pog names and color names
function populateTradeDropdowns() {
    const givingSelect = document.getElementById('givingSelect');
    const receivingSelect = document.getElementById('receivingSelect');
    
    if (!givingSelect || !receivingSelect) return; // Elements don't exist yet
    
    // Clear existing options
    givingSelect.innerHTML = '<option value="">What I\'m giving...</option>';
    receivingSelect.innerHTML = '<option value="">What I want in exchange...</option>';
    
    // Populate giving dropdown with user's non-unique inventory
    if (userdata.inventory) {
        const tradeableItems = userdata.inventory.filter(item => item.rarity !== "Unique");
        tradeableItems.forEach(item => {
            // Find the pog in pogList to get its specific color
            const pogData = pogList.find(pog => pog.name === item.name);
            const pogColor = pogData ? pogData.color : '#000';
            
            const option = document.createElement('option');
            option.value = item.name;
            option.style.color = pogColor;
            option.style.fontWeight = 'bold';
            // Display both name and color
            option.textContent = `${item.name} (${pogColor})`;
            givingSelect.appendChild(option);
        });
    }
    
    // Populate receiving dropdown with all non-unique pogs
    if (pogList) {
        const requestableItems = pogList.filter(pog => pog.rarity !== "Unique");
        requestableItems.forEach(pog => {
            const option = document.createElement('option');
            option.value = pog.name;
            // Use the pog's specific color from pogList
            option.style.color = '#000';
            option.style.fontWeight = 'bold';
            // Display both name and color
            option.textContent = `${pog.name} (${pog.color || 'No Color'})`;
            receivingSelect.appendChild(option);
        });
    }
}


// Render trade function with color names displayed
function renderTrade(trade) {
    if (!trade) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'trade-card';
    // Tag the card so we can find/remove it later when the trade completes
    const tradeId = trade.id || trade.tradeId || trade.trade_id || '';
    if (tradeId) wrapper.setAttribute('data-trade-id', tradeId);
    const time = trade.time ? new Date(Number(trade.time)) : new Date();
    const timeStr = time.toLocaleTimeString();
    
    const isLight = userdata.theme === 'light';
    const textColor = isLight ? 'black' : 'white';
    const metaColor = isLight ? '#333' : '#ddd';

    // Profile picture logic
    let pfp;
    if (trade.pfp && trade.pfp.startsWith('data:') && trade.pfp.length > 1000) {
        pfp = trade.pfp;
    } else if (trade.name === myName) {
        pfp = userdata.pfp;
    } else {
        pfp = '/static/icons/pfp/defaultpfp.png';
    }
    
    // Check if current user can accept this trade
    const canAccept = userdata.inventory && userdata.inventory.some(item => 
        item.name === trade.receiving_item_name && item.rarity !== "Unique"
    );
    
    // Find colors for the items
    const givingItemColor = getItemColor(trade.giving_item_name);
    const receivingItemColor = getItemColor(trade.receiving_item_name);
    
    // Build trade card HTML with colors and color names
    wrapper.innerHTML = `
        <div class="trade-header">
            ${pfp ? `<img src="${pfp}" alt="${trade.name}'s profile picture" class="trade-pfp">` : ''}
            <div class="trade-meta">
                <strong style="color: ${metaColor}">${trade.name || 'Anonymous'}</strong>
                <span style="color: ${metaColor}; font-size: 0.9em">${timeStr}</span>
            </div>
        </div>
        ${trade.message ? `<div class="trade-message" style="color: ${textColor}">${escapeHtml(trade.message)}</div>` : ''}
        <div class="trade-details" style="color: ${textColor}">
        <div id="givingBox">
            <strong>Giving:</strong> 
            <span style="color: ${givingItemColor}; font-weight: bold;">${escapeHtml(trade.giving_item_name)} (${givingItemColor})</span>
        </div>
        <div id="gettingBox">
            <strong>Wants:</strong> 
            <span style="color: ${receivingItemColor}; font-weight: bold;">${escapeHtml(trade.receiving_item_name)} (${receivingItemColor})</span>
        </div>
        </div>
        ${canAccept && trade.name !== myName ? 
            `<button class="accept-trade-btn" onclick="acceptTrade('${trade.id}', '${trade.giving_item_name}', '${trade.receiving_item_name}', '${trade.userId}')">Accept Trade</button>` 
            : ''}
    `;

    if (messageCont) {
        messageCont.appendChild(wrapper);
        messageCont.scrollTop = messageCont.scrollHeight;
    } else {
        // Fallback: append to body so it isn't lost (shouldn't normally happen)
        document.body.appendChild(wrapper);
    }

    // Ensure wrapper background/text follow theme
    if (isLight) {
        wrapper.style.backgroundColor = 'rgba(255,255,255,0.9)';
        wrapper.style.color = 'black';
    } else {
        wrapper.style.backgroundColor = 'rgba(0,0,0,0.3)';
        wrapper.style.color = 'white';
    }
}


// Accept trade function
function acceptTrade(tradeId, givingItem, receivingItem, traderId) {
    if (confirm(`Accept this trade?\nYou give: ${receivingItem}\nYou get: ${givingItem}`)) {
        socket.emit('accept trade', {
            tradeId: tradeId,
            accepter_name: myName,
            accepter_userId: userdata.displayName,
            giving_item: givingItem,
            receiving_item: receivingItem,
            trader_userId: traderId
        });
    }
}

// Socket event listeners for trades
socket.on('trade history', (rows) => { 
    messageCont.innerHTML = ''; 
    (rows || []).forEach(renderTrade); 
});

socket.on('trade offer', (trade) => { 
    renderTrade(trade); 
});

socket.on('trade accepted', (data) => {
    // Handle trade acceptance response
    if (data.success) {
        alert(`Trade completed! You received: ${data.received_item}`);
        // Refresh the page to update inventory
        // Remove the trade card from the UI if a tradeId was provided
        try {
            if (data.tradeId) {
                const card = document.querySelector(`[data-trade-id="${data.tradeId}"]`);
                if (card) card.remove();
            }
        } catch (err) { console.warn('Could not remove accepted trade card:', err); }

        // Then reload to ensure full sync
        window.location.reload();
    } else {
        alert(`Trade failed: ${data.message}`);
    }
});

// when server confirms the accepter, update local inventory immediately
socket.on('trade accepted', (data) => {
    if (!data) return;
    if (data.success) {
        // if server included updatedInventory, use it
        if (Array.isArray(data.updatedInventory)) {
            window.inventory = data.updatedInventory;
            if (typeof userdata === 'object') userdata.inventory = data.updatedInventory;
            if (typeof refreshInventory === 'function') refreshInventory();
            if (typeof refreshTradeDropdowns === 'function') refreshTradeDropdowns();

            // sync session on server so page navigations will show latest inventory
            fetch('/api/user/sync-inventory', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory: data.updatedInventory })
            }).then(r => r.ok ? r.json() : Promise.reject()).then(resp => {
                console.log('Server session inventory synced', resp);
            }).catch(err => {
                console.warn('Failed to sync inventory to session:', err);
            });
        }
        // optional: notify user
        console.log('Trade accepted:', data.message || '', data.received_item || '');
        // auto-save if save() is available
        if (typeof save === 'function') save();
        // Remove the trade card from the UI as well if tradeId provided
        try {
            if (data.tradeId) {
                const card = document.querySelector(`[data-trade-id="${data.tradeId}"]`);
                if (card) card.remove();
            }
        } catch (err) { console.warn('Could not remove accepted trade card (inventory handler):', err); }
    } else {
        alert('Trade failed: ' + (data.message || 'unknown'));
    }
});

// when any trade completes (broadcast), apply updated inventories for affected users
socket.on('trade completed', (payload) => {
    if (!payload) return;
    // payload includes traderUserId, accepterUserId, updatedTraderInventory, updatedAccepterInventory
    try {
        const myId = userdata && (userdata.displayName || userdata.displayname || userdata.fid);
        // if I'm the trader, apply trader inventory
        if (String(payload.traderUserId) === String(myId) && Array.isArray(payload.updatedTraderInventory)) {
            window.inventory = payload.updatedTraderInventory;
            if (typeof userdata === 'object') userdata.inventory = payload.updatedTraderInventory;
            if (typeof refreshInventory === 'function') refreshInventory();
            if (typeof refreshTradeDropdowns === 'function') refreshTradeDropdowns();
        }
        // if I'm the accepter, apply accepter inventory
        if (String(payload.accepterUserId) === String(myId) && Array.isArray(payload.updatedAccepterInventory)) {
            window.inventory = payload.updatedAccepterInventory;
            if (typeof userdata === 'object') userdata.inventory = payload.updatedAccepterInventory;
            if (typeof refreshInventory === 'function') refreshInventory();
            if (typeof refreshTradeDropdowns === 'function') refreshTradeDropdowns();
        }
        // If the server included a tradeId, remove the corresponding trade card from the UI
        if (payload.tradeId) {
            try {
                const completedCard = document.querySelector(`[data-trade-id="${payload.tradeId}"]`);
                if (completedCard) {
                    completedCard.remove();
                }
            } catch (err) {
                console.warn('Could not remove trade card for payload.tradeId', payload.tradeId, err);
            }
        }
    } catch (err) {
        console.error('Error applying trade completed inventory:', err);
    }

    // auto-save after any completion to persist changes client-side
    if (typeof save === 'function') save();
});

// after socket is set up, run save() when a trade finishes
socket.on('trade completed', (tradeId) => {
    try {
        if (typeof save === 'function') {
            console.log('Trade completed:', tradeId, '- auto-saving user data');
            save();
        } else {
            console.warn('save() not available on this page');
        }
    } catch (err) {
        console.error('Error invoking save() after trade completed:', err);
    }
});

// also save for the accepter (server sends trade accepted to the accepter socket)
socket.on('trade accepted', (info) => {
    try {
        if (typeof save === 'function') {
            console.log('Trade accepted (you):', info, '- auto-saving user data');
            save();
        }
    } catch (err) {
        console.error('Error invoking save() after trade accepted:', err);
    }
});

socket.on('trade completed', (tradeId) => {
    // Remove the completed trade from display
    if (!tradeId) return;
    try {
        // Prefer direct lookup by data attribute
        const card = document.querySelector(`[data-trade-id="${tradeId}"]`);
        if (card) {
            card.remove();
            return;
        }

        // Fallback: search for onclick marker
        const tradeCards = document.querySelectorAll('.trade-card');
        tradeCards.forEach(card => {
            if (card.innerHTML.includes(`acceptTrade('${tradeId}'`)) {
                card.remove();
            }
        });
    } catch (err) {
        console.error('Error removing completed trade card:', err);
    }
});

// Trade form submission
if (tradeForm) {
    tradeForm.addEventListener("submit", (e) => { 
        e.preventDefault(); 
        
        const givingItem = document.getElementById('givingSelect')?.value;
        const receivingItem = document.getElementById('receivingSelect')?.value;
        const message = document.getElementById('tradeMessage')?.value?.trim() || '';
        
        if (!givingItem || !receivingItem) {
            alert('Please select both items for the trade');
            return;
        }
        
        if (givingItem === receivingItem) {
            alert('You cannot trade an item for the same item');
            return;
        }
        
        socket.emit("trade offer", { 
            name: myName, 
            pfp: userdata.pfp || null,
            userId: userdata.displayName || null,
            giving_item_name: givingItem,
            receiving_item_name: receivingItem,
            message: message
        }); 
        
        // Clear form
        document.getElementById('givingSelect').value = "";
        document.getElementById('receivingSelect').value = "";
        document.getElementById('tradeMessage').value = "";
    });
}

// Initialize when page loads
setTimeout(() => {
    populateTradeDropdowns();
    // Load existing trades
    if (messageCont.children.length === 0) { 
        fetch('/api/trades/recent').then(r => r.ok ? r.json() : []).then(rows => { 
            messageCont.innerHTML = ''; 
            (rows || []).forEach(renderTrade); 
        }).catch(()=>{}); 
    }
}, 300);

// Refresh dropdowns when inventory might change
function refreshTradeDropdowns() {
    populateTradeDropdowns();
}

// Make refreshTradeDropdowns available globally
window.refreshTradeDropdowns = refreshTradeDropdowns;
