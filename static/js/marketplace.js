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
const pogContainer = document.getElementById('pogContainer');

// Function to create pog elements