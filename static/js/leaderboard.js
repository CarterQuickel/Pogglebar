var userdata = JSON.parse(document.getElementById("userdata").textContent);
var scores = JSON.parse(document.getElementById("scores").textContent);

//mode
if (userdata.theme === "light") {
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";
} else if (userdata.theme === "dark") {
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
}

function hide() {
    const info = document.getElementById("details");
    info.style.display = "none";
}

document.querySelectorAll(".infobtn").forEach(button => {
    button.addEventListener('click', () => {
        const index = button.dataset.index;
        const player = scores[index]
        const inv = JSON.parse(player.inventory)
        let sortedI = inv.map((item => ` ${item.name}`));
        displayed = sortedI.slice(0, 50);
        let experience = player.xp;
        const info = document.getElementById("details");
        info.style.display = "block";
        info.innerHTML = ` <h1>Player Details</h1>
                            <img id="pfpimg" src="${player.pfp}" style="width: 100px; height: 100px; border-radius: 50%;"><br>
                            <h2>${player.displayname}</h2>
                          <div style="display: flex; gap: 40px; justify-content: center;">
                            <div>
                                <h3>Score</h3> <p>${player.score}</p>
                                <h3>Level</h3> <p>${player.level}</p>
                                <h3>Current XP</h3> <p style="font-size: ${experience.toString().length > 9 ? "11px" : "13px"}">${player.xp}</p>
                                <h3>Wishes</h3> <p>${player.wish}</p>
                            </div>
                            <div>
                                <h3>Income</h3> <p>$${player.income}/s</p>
                                <h3>Total Sold</h3> <p>${player.totalSold} pogs</p>
                                <h3>Crates Opened</h3> <p>${player.cratesOpened} crates</p>
                                <h3>Pogs in Inventory</h3> <p>${sortedI.length}</p>
                            </div>
                          </div>
                          <button id="hideBtn" onclick="hide()" style="margin-bottom: 10px;">Hide Details</button>`;
    })
});

