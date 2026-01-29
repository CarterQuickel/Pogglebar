// Team select script: parses embedded userdata/pogList, renders inventory, and lets user assign pogs to MC slots.
(function () {
    // Helpers
    const qs = (s) => document.querySelector(s);
    const qsa = (s) => Array.from(document.querySelectorAll(s));

    function parseEmbeddedJSON(id) {
        try {
            const el = document.getElementById(id);
            if (!el) return null;
            const txt = el.textContent || el.innerText || el.value || '';
            if (!txt) return null;
            return JSON.parse(txt);
        } catch (err) {
            console.warn('teamSelect: failed to parse', id, err);
            return null;
        }
    }

    // Normalize inventory items to an array of objects with id/name where possible
    function normalizeInventory(inv, pogList) {
        if (!Array.isArray(inv)) return [];
        // attempt to map primitives to pog objects via id or name
        return inv.map(item => {
            if (!item) return null;
            if (typeof item === 'object') {
                // object cartridge: try to keep id/name
                return item;
            }
            // primitive: try to find in pogList by id or name
            const found = (pogList || []).find(p => String(p.id) === String(item) || String(p.name) === String(item));
            return found || { id: item, name: String(item) };
        }).filter(Boolean);
    }

    // Build a simple pog card element
    function makePogCard(pog) {
        const div = document.createElement('div');
        div.className = 'team-pog-card';
        div.tabIndex = 0;
        div.setAttribute('data-pog-id', pog.id || '');
        div.setAttribute('data-pog-name', pog.name || '');

        const title = document.createElement('div');
        title.className = 'team-pog-name';
        title.textContent = pog.name || 'Unknown';

        // optional small color box if color provided
        if (pog.color) {
            const color = document.createElement('div');
            color.className = 'team-pog-color';
            color.style.background = pog.color;
            div.appendChild(color);
        }

        div.appendChild(title);
        return div;
    }

    // Main setup when DOM ready
    function setup() {
        const teamTrigger = document.getElementById('teamSelectButton') || document.getElementById('team');
        const teamOverlay = document.getElementById('teamSelectOverlay');
        const teamClose = document.getElementById('teamSelectClose');
        const teamPanel = document.getElementById('teamSelect');
        const mcSelectWindow = document.getElementById('MCselectWindow');
        const allCharacters = document.getElementById('allCharacters');
        const inTeam = document.getElementById('inTeam');

        if (!teamOverlay || !teamPanel) {
            console.warn('teamSelect: overlay or panel not found in DOM. Aborting teamSelect setup.');
            return;
        }

        // parse embedded userdata/pogList if present
        const userdata = parseEmbeddedJSON('userdata') || window.userdata || {};
        const pogList = parseEmbeddedJSON('pogList') || window.pogList || [];

        // Prefer using the binder's items (if present) instead of userdata.inventory.
        // binderint.js populates #binderItems with `.singleI` elements; use those if available.
        let inventory = [];
        try {
            const binderEl = document.getElementById('binderItems');
            if (binderEl) {
                const singles = Array.from(binderEl.querySelectorAll('.singleI'))
                    .filter(el => window.getComputedStyle(el).display !== 'none');
                if (singles.length) {
                    inventory = singles.map(el => ({
                        id: el.dataset.name || el.dataset.name,
                        name: el.dataset.name || el.dataset.name,
                        color: el.dataset.color || '',
                        rarity: el.dataset.rarity || ''
                    }));

                    // Deduplicate by name using the global maxPogs (or maxBinder) to cap results
                    // Prefer using pogAmount (array of owned pogs) as the cap; fall back to maxPogs or maxBinder
                    const cap = (Array.isArray(window.pogAmount) ? window.pogAmount.length : (typeof maxPogs !== 'undefined' ? maxPogs : (typeof maxBinder !== 'undefined' ? maxBinder : null)));
                    const seen = new Set();
                    inventory = inventory.filter(p => {
                        if (!p || !p.name) return false;
                        if (seen.has(p.name)) return false;
                        seen.add(p.name);
                        return true;
                    });
                    if (cap && inventory.length > cap) inventory = inventory.slice(0, cap);
                }
            }
        } catch (e) { /* ignore DOM errors, fallback below */ }

        // Fallback to userdata.inventory if binder-derived inventory is empty
        if (!inventory || inventory.length === 0) {
            inventory = normalizeInventory(userdata.inventory || [], pogList);
        }

        // Ensure windows are hidden initially
        teamOverlay.style.display = 'none';
        teamPanel.style.display = 'none';
        if (mcSelectWindow) mcSelectWindow.style.display = 'none';

        function show() {
            teamOverlay.style.display = 'block';
            teamPanel.style.display = 'block';
            if (teamClose) teamClose.focus();
        }

        function hide() {
            teamOverlay.style.display = 'none';
            teamPanel.style.display = 'none';
            if (mcSelectWindow) mcSelectWindow.style.display = 'none';
        }

        if (teamTrigger) {
            teamTrigger.addEventListener('click', function (e) { e.preventDefault(); show(); });
        }

        if (teamClose) {
            teamClose.addEventListener('click', function (e) { e.preventDefault(); hide(); });
        }

        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });

        // Render the player's inventory into #allCharacters
        function getAssignedNames() {
            // collect names of currently assigned pogs in slots
            const assignedEls = document.querySelectorAll('.mc-card.mc-assigned .assigned-pog');
            const names = new Set();
            assignedEls.forEach(el => {
                if (el && el.dataset && el.dataset.pogId) names.add(el.dataset.pogId || el.textContent);
                else if (el && el.textContent) names.add(el.textContent);
            });
            return names;
        }

        function renderInventory() {
            if (!allCharacters) return;
            allCharacters.innerHTML = '';
            if (!inventory || inventory.length === 0) {
                const msg = document.createElement('div');
                msg.className = 'team-no-pogs';
                msg.textContent = 'You have no pogs in inventory.';
                allCharacters.appendChild(msg);
                return;
            }

            const assignedNames = getAssignedNames();
            // Use pogAmount (owned pogs) to help dedupe entries by name
            const ownedNames = Array.isArray(window.pogAmount) ? new Set(window.pogAmount.map(p => p.name)) : null;
            const seen = new Set();

            inventory.forEach(pog => {
                const pogKey = (pog.name || pog.id || '').toString();

                // prevent duplicates in sidebar using pogAmount as authoritative list of owned names
                if (seen.has(pogKey)) return;
                seen.add(pogKey);

                // hide pogs that are already assigned (prevent dupes across slots)
                if (assignedNames.has(String(pogKey))) return;

                // If pogAmount exists, only show one entry per owned name (avoid duplicate copies)
                if (ownedNames && !ownedNames.has(pog.name)) {
                    // If the inventory entry isn't represented in pogAmount, still allow it
                    // (this preserves binder behavior). So don't skip here unless you want strict filtering.
                }

                const card = makePogCard(pog);
                card.addEventListener('click', function () {
                    assignPogToSlot(pog);
                });
                allCharacters.appendChild(card);
            });
        }

        // Render the currently selected/assigned pogs into the `#selectedPogs` strip
        function renderSelectedStrip() {
            const selContainer = document.getElementById('selectedPogs');
            if (!selContainer) return;
            selContainer.innerHTML = '';
            // find assigned pogs in slots
            const assignedEls = document.querySelectorAll('.mc-card.mc-assigned .assigned-pog');
            assignedEls.forEach(el => {
                const name = el.textContent || '';
                const id = el.dataset.pogId || '';
                const color = (function() {
                    // try to lookup color from inventory or pogList
                    const found = inventory.find(p => String(p.id) === String(id) || p.name === name);
                    return (found && found.color) ? found.color : null;
                })();

                const card = document.createElement('div');
                card.className = 'selected-card';
                card.setAttribute('data-pog-id', id);
                if (color) {
                    const dot = document.createElement('div');
                    dot.className = 'color-dot';
                    dot.style.background = color;
                    card.appendChild(dot);
                }
                const txt = document.createElement('div');
                txt.textContent = name;
                card.appendChild(txt);
                selContainer.appendChild(card);
            });
        }

        // Loadout persistence (client-side using localStorage)
        const LOADOUT_KEY = 'pog_team_loadouts_v1';

        function getSavedLoadouts() {
            try {
                const raw = localStorage.getItem(LOADOUT_KEY);
                if (!raw) return [null, null, null, null];
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed)) return [null, null, null, null];
                // ensure length 4
                while (parsed.length < 4) parsed.push(null);
                return parsed.slice(0,4);
            } catch (e) { return [null, null, null, null]; }
        }

        function saveLoadout(index, teamArray) {
            const cur = getSavedLoadouts();
            cur[index] = teamArray;
            localStorage.setItem(LOADOUT_KEY, JSON.stringify(cur));
            updateLoadoutButtons();
            showNotice('Saved loadout ' + (index + 1));
        }

        function loadLoadout(index) {
            const cur = getSavedLoadouts();
            const data = cur[index];
            if (!data || !Array.isArray(data)) {
                showNotice('Loadout ' + (index + 1) + ' is empty');
                return;
            }
            // data expected to be array of {id,name}
            setTeam(data);
            showNotice('Loaded loadout ' + (index + 1));
        }

        function updateLoadoutButtons() {
            const arr = getSavedLoadouts();
            const btns = document.querySelectorAll('.loadout-btn');
            btns.forEach((b, i) => {
                const data = arr[i];
                b.classList.toggle('active', !!data);
                // update label to show first member or 'Empty'
                const label = data && data.length ? (data.map(d => d.name).slice(0,2).join(', ')) : 'Empty';
                b.innerHTML = `Loadout ${i+1}<br><small class="hint">${label}</small>`;
            });
        }

        function getCurrentTeamArray() {
            // returns array of up to 4 items: {id, name}
            const result = [];
            const slots = document.querySelectorAll('.mc-card');
            slots.forEach(slot => {
                const assigned = slot.querySelector('.assigned-pog');
                if (assigned) {
                    result.push({ id: assigned.dataset.pogId || assigned.textContent, name: assigned.textContent });
                } else {
                    result.push(null);
                }
            });
            return result;
        }

        function setTeam(teamArray) {
            // teamArray is array of up to 4 items {id,name} or null
            const slots = document.querySelectorAll('.mc-card');
            for (let i = 0; i < slots.length; i++) {
                const slot = slots[i];
                const inner = slot.querySelector('.slot');
                inner.innerHTML = '';
                slot.classList.remove('mc-assigned');
                const item = teamArray[i];
                if (item) {
                    const assignedDiv = document.createElement('div');
                    assignedDiv.className = 'assigned-pog';
                    assignedDiv.setAttribute('data-pog-id', item.id || '');
                    assignedDiv.textContent = item.name || '';
                    inner.appendChild(assignedDiv);
                    slot.classList.add('mc-assigned');
                }
            }
            // after updating slots, sync UI
            renderSelectedStrip();
            renderInventory();
        }

        // Wire loadout buttons (click to load, Shift+click to save current team)
        function setupLoadoutButtons() {
            const bar = document.getElementById('loadoutBar');
            if (!bar) return;
            bar.addEventListener('click', function(e) {
                const btn = e.target.closest('.loadout-btn');
                if (!btn) return;
                const idx = Number(btn.dataset.index || btn.getAttribute('data-index'));
                if (e.shiftKey) {
                    // save current
                    const cur = getCurrentTeamArray();
                    saveLoadout(idx, cur);
                } else {
                    loadLoadout(idx);
                }
            });
            updateLoadoutButtons();
        }

        // Current slot being assigned
        let currentSlotEl = null;

        function openSelectWindowFor(slotEl) {
            currentSlotEl = slotEl;
            if (mcSelectWindow) mcSelectWindow.style.display = 'block';
            // optionally render a focused list or filter
            renderInventory();
        }

        function showNotice(text) {
            // small transient notice inside the modal
            let notice = document.getElementById('teamSelectNotice');
            if (!notice) {
                notice = document.createElement('div');
                notice.id = 'teamSelectNotice';
                notice.style.position = 'absolute';
                notice.style.top = '8px';
                notice.style.left = '50%';
                notice.style.transform = 'translateX(-50%)';
                notice.style.background = 'rgba(0,0,0,0.6)';
                notice.style.color = 'white';
                notice.style.padding = '6px 10px';
                notice.style.borderRadius = '6px';
                notice.style.zIndex = 10002;
                const team = document.getElementById('teamSelect');
                if (team) team.appendChild(notice);
            }
            notice.textContent = text;
            notice.style.opacity = '1';
            clearTimeout(notice._timeout);
            notice._timeout = setTimeout(() => { notice.style.opacity = '0'; }, 2200);
        }

        function assignPogToSlot(pog) {
            if (!currentSlotEl) {
                // open selection modal without target
                console.warn('teamSelect: no slot selected for assignment');
                return;
            }

            // Prevent duplicates: check other assigned slots
            const pogKey = String(pog.id || pog.name || '');
            const assignedEls = document.querySelectorAll('.mc-card.mc-assigned .assigned-pog');
            for (const el of assignedEls) {
                const existingKey = el.dataset.pogId || el.textContent;
                if (String(existingKey) === pogKey) {
                    showNotice('That pog is already assigned to another slot.');
                    return; // block assignment
                }
            }

            // Update the slot UI: place a small label inside .slot
            const slot = currentSlotEl.querySelector('.slot');
            if (!slot) return;

            slot.innerHTML = ''; // clear existing
            const assigned = document.createElement('div');
            assigned.className = 'assigned-pog';
            assigned.setAttribute('data-pog-id', pog.id || '');
            assigned.textContent = pog.name || 'Unknown';
            slot.appendChild(assigned);

            // mark slot as assigned
            currentSlotEl.classList.add('mc-assigned');

            // close selection window
            if (mcSelectWindow) mcSelectWindow.style.display = 'none';
            currentSlotEl = null;

            // re-render inventory so assigned pogs disappear from the list
            renderInventory();
            // update selected strip
            renderSelectedStrip();
        }

        // Wire mc-card click handlers
        const slots = qsa('.mc-card');
        slots.forEach(slot => {
            slot.addEventListener('click', function (e) {
                e.preventDefault();
                openSelectWindowFor(slot);
            });
        });

        // setup loadout buttons
        setupLoadoutButtons();

        // initial render of active assigned pogs from userdata (if present)
        function hydrateAssignedFromUserdata() {
            try {
                const assigned = userdata.team || userdata.assigned || [];
                if (!Array.isArray(assigned) || assigned.length === 0) return;
                assigned.forEach((a, idx) => {
                    const slot = document.querySelector('.mc-card[data-slot="' + (idx + 1) + '"]');
                    if (!slot) return;
                    const pog = (inventory.find(p => String(p.id) === String(a.id)) || a);
                    const slotInner = slot.querySelector('.slot');
                    if (slotInner) {
                        slotInner.innerHTML = '';
                        const assignedDiv = document.createElement('div');
                        assignedDiv.className = 'assigned-pog';
                        assignedDiv.textContent = pog.name || a.name || 'Unknown';
                        slotInner.appendChild(assignedDiv);
                        slot.classList.add('mc-assigned');
                    }
                });
            } catch (err) { /* ignore */ }
        }

        hydrateAssignedFromUserdata();

        // initial hide of MCselectWindow
        if (mcSelectWindow) mcSelectWindow.style.display = 'none';

        // initial render of inventory
        renderInventory();
        // initial render of selected strip (if any are pre-assigned)
        renderSelectedStrip();
        // update loadout buttons to reflect saved loadouts
        updateLoadoutButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();