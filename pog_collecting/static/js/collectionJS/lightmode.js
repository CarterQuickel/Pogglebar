//mode

if (userdata.theme === "light") {
    document.body.style.backgroundColor = "white";
    lightMode = true;
} else if (userdata.theme === "dark") {
    document.body.style.backgroundColor = "black";
    lightMode = false;
}

// mode toggle
document.getElementById("darkmode").addEventListener("click", () => {
    lightMode = !lightMode;
    if (lightMode) {
        document.body.style.backgroundColor = "white";
        document.body.style.color = "black";
        save();
    } else {
        document.body.style.backgroundColor = "black";
        document.body.style.color = "white";
        save();
    }
});