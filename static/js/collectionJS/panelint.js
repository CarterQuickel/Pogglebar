document.getElementById("play_btn").addEventListener(("click"), () => {
    const gamemodes = document.getElementById("gamemode_overlay");
    gamemodes.style.display = "flex";
});

document.getElementById("gamemode_overlay").addEventListener(("click"), (overlay) => {
    const gamemodes = document.getElementById("gamemode_overlay");
    console.log(overlay.target)
    const target = overlay.target
    if (target === gamemodes) {
        gamemodes.style.display = "none";
    };
});