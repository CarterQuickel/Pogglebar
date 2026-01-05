const userdata = (() => { try { return JSON.parse(document.getElementById("userdata")?.textContent || '{}'); } catch (e) { return {}; } })();

// theme 
if (userdata.theme === "light") { document.body.style.backgroundColor = "white"; 
    document.body.style.color = "black"; const messageInputEl = document.getElementById("messageInput"); 
    document.getElementById("messageCont").style.backgroundColor = "white";
    document.getElementById("messageCont").style.color = "black";
    if (messageInputEl) { messageInputEl.style.backgroundColor = "black"; messageInputEl.style.color = "white"; } } 
    else if (userdata.theme === "dark") { document.body.style.backgroundColor = "black"; document.body.style.color = "white"; }


const socket = io(); 
const myName = userdata.displayName || userdata.displayname || 'Guest';

const form = document.querySelector('form'); 
const messageInput = document.getElementById("messageInput"); 
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

function renderMessage(chat) {
    if (!chat) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-line';
    const time = chat.time ? new Date(Number(chat.time)) : new Date();
    const timeStr = time.toLocaleTimeString();
    
    // Determine colors based on theme for visibility
    const isLight = userdata.theme === 'light';
    const textColor = isLight ? 'black' : 'white';
    const metaColor = isLight ? '#333' : '#ddd'; // slightly different for meta (time/name)

    // Profile picture logic (unchanged)
    let pfp;
    if (chat.pfp && chat.pfp.startsWith('data:') && chat.pfp.length > 1000) {
        pfp = chat.pfp;
    } else if (chat.name === myName) {
        pfp = userdata.pfp;
    } else {
        pfp = '/static/icons/pfp/defaultpfp.png';
    }
    
    if (pfp) {
        // create a button wrapper so the pfp is clickable and keyboard accessible
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pfp-btn';
        btn.setAttribute('aria-label', `Open profile for ${chat.name || 'user'}`);

        const imgEl = document.createElement('img');
        imgEl.src = pfp;
        imgEl.alt = `${chat.name}'s profile picture`;
        imgEl.className = 'chat-pfp';
        imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = '/static/icons/pfp/defaultpfp.png'; };

        btn.appendChild(imgEl);
        // sample click handler - replace with your real action
        btn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    console.log('🔴 CLICK DETECTED!'); // This should show if click works
    console.log('🔴 chat.name:', chat.name);
    console.log('🔴 chat.userId:', chat.userId);
    console.log('🔴 Full chat object:', chat);
    
    // Test the function directly first
    console.log('🔴 About to call handleUserProfileClick...');
    
    if (chat.userId) {
        console.log('🔴 userId exists, calling function...');
        handleUserProfileClick(chat.userId, chat.name);
    } else {
        console.log('🔴 No userId found! This might be an old message.');
        // Let's test with a fallback
        alert('Profile clicked but no userId found. This might be an old message.');
    }
});


        wrapper.appendChild(btn);
    }

    // Build meta (time + name) as separate elements so we can style them
    const metaSpan = document.createElement('span');
    metaSpan.className = 'chat-meta';

    const timeEl = document.createElement('span');
    timeEl.className = 'chat-time';
    timeEl.textContent = timeStr + ' ';
    timeEl.style.color = metaColor;
    timeEl.style.fontSize = '0.9em';
    metaSpan.appendChild(timeEl);

    const nameEl = document.createElement('strong');
    nameEl.className = 'chat-name';
    nameEl.textContent = chat.name || 'Anon';
    nameEl.style.color = metaColor;
    nameEl.style.marginRight = '6px';
    metaSpan.appendChild(nameEl);

    wrapper.appendChild(metaSpan);

    const msgEl = document.createElement('span');
    msgEl.className = 'chat-msg';
    msgEl.textContent = chat.msg || '';
    msgEl.style.color = textColor;
    wrapper.appendChild(msgEl);

    messageCont.appendChild(wrapper);
    messageCont.scrollTop = messageCont.scrollHeight;

    // Ensure wrapper background/text follow theme
    if (isLight) {
        wrapper.style.backgroundColor = 'white';
        wrapper.style.color = 'black';
    } else {
        wrapper.style.backgroundColor = 'black';
        wrapper.style.color = 'white';
    }
}

function handleUserProfileClick(userId, userName) {
    console.log('🟢 handleUserProfileClick called with:', userId, userName);
    alert(`User Profile\nName: ${userName}\nID: ${userId}`);
}

// Test the function immediately to make sure it works
console.log('🟢 Testing alert function...');
// Uncomment this line to test:
// handleUserProfileClick('test123', 'TestUser');



socket.on('chat history', (rows) => { messageCont.innerHTML = ''; (rows || []).forEach(renderMessage); });


socket.on('chat message', (chat) => { renderMessage(chat); });
form.addEventListener("submit", (e) => { 
    e.preventDefault(); 
    const text = (messageInput.value || '').trim(); 
    if (!text) return; 
    
    console.log('userdata.pfp length:', userdata.pfp ? userdata.pfp.length : 'null');
    console.log('Sending pfp length:', (userdata.pfp || null) ? (userdata.pfp || null).length : 'null');
    
    socket.emit("chat message", { 
        name: myName, 
        msg: text, 
        pfp: userdata.pfp || null,
        userId: userdata.displayName || null // Add this line - using displayName as user ID
    }); 
    
    messageInput.value = ""; 
});




setTimeout(() => { if (messageCont.children.length === 0) { fetch('/api/chat/recent').then(r => r.ok ? r.json() : []).then(rows => { messageCont.innerHTML = ''; (rows || []).forEach(renderMessage); }).catch(()=>{}); } }, 300);