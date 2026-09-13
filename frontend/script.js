const cards = [...document.querySelectorAll(".card")];

let current = 0;

function updateCarousel() {
    cards.forEach(card => {
        card.className = "card hidden";
    });

    cards.forEach((card, index) => {
        const offset = (index - current + cards.length) % cards.length;

        if (offset === 0) {
            card.className = "card center";
        } else if (offset === 1) {
            card.className = "card down-1";
        } else if (offset === 2) {
            card.className = "card down-2";
        } else if (offset === cards.length - 1) {
            card.className = "card up-1";
        } else if (offset === cards.length - 2) {
            card.className = "card up-2";
        } else {
            card.className = "card hidden";
        }
    });
}

function nextCard() {
    current = (current + 1) % cards.length;
    updateCarousel();
}

updateCarousel();

setInterval(nextCard, 3500);