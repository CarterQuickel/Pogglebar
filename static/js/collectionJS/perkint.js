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
            const type = item.type
            let typeIcon = ""
            switch (type) {
                case "attack":
                    typeIcon += "⚔";
                    break;
                case "defense":
                    typeIcon += "🛡️";
                    break;
                case "element":
                    typeIcon += "🔥";
                    break;
                case "support":
                    typeIcon += "💊";
                    break;
                case "utility":
                    typeIcon += "⚙";
                    break;
            }
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
                        <p>${typeIcon}</p>
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
    const cards = document.querySelectorAll(".perk_card");

cards.forEach(card => {
    card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
    `;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "scale(1) rotateX(0) rotateY(0)";
    });
});
}