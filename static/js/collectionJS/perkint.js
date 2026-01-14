document.getElementById("perkB").addEventListener("click", () => {
    const perksB = document.getElementById("perkBanner");
    perksB.style.display = "block";
    viewPerks()
});

document.getElementById("closePerks").addEventListener("click", () => {
    const perksB = document.getElementById("perkBanner");
    perksB.style.display = "none";
});

async function viewPerks() {
    try {
        const response = await fetch('/api/perks');
        const data = await response.json();
        const perks = data.perks;

        const itemsHTML = document.getElementById("perkCards");
        const itemView = perks.map((item) => {
            const name = item.name;
            const description = item.description;
            return `
            <div class="perk_card">
                <div class="inner_card">
                    <h3>${name}</h3>
                    <p>${description}</p>
                </div>
            </div>
        `
        }).join("");
        itemsHTML.innerHTML = itemView;
    } catch (err) {
        console.error("Error fetching perks:", err);
    }
}