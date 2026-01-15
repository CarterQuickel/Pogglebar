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
        const sortedPerks = [...perks].sort((a, b) => a.notches - b.notches)
        const itemsHTML = document.getElementById("perkCards");
        const itemView = sortedPerks.map((item) => {
            const name = item.name;
            const description = item.description;
            let notches = "";
            for (let i = 0; i < item.notches; i++) {
                notches += "⬣";
            }
            return `
            <div class="perk_card">
                <div class="inner_card">
                    <div class="card_padding">
                        <h3>${name}</h3>
                        <p>${description}</p>
                        <p class="notches">${notches}</p>
                    </div>
                </div>
            </div>
        `
        }).join("");
        itemsHTML.innerHTML = itemView;
    } catch (err) {
        console.error("Error fetching perks:", err);
    }
}