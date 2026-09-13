const BACKEND_URL = "https://tournament-tool-f1p7.onrender.com";

const cards = [...document.querySelectorAll(".card")];

let current = 0;

function isMobile() {
    return window.innerWidth <= 700;
}

async function checkAuthentication() {

    try {

        const response = await fetch(
            `${BACKEND_URL}/auth/me`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        if (data.authenticated) {
            window.location.replace("dashboard.html");
            return true;
        }

    } catch (error) {

        console.error(
            "Authentication check failed:",
            error
        );

    }

    return false;
}

function updateCarousel() {

    if (isMobile()) {

        cards.forEach((card, index) => {

            card.className = "card";

            if (index === current) {

                card.classList.add(
                    "mobile-center"
                );

            }

            else if (
                index ===
                (current + 1) % cards.length
            ) {

                card.classList.add(
                    "mobile-next"
                );

            }

            else if (
                index ===
                (current - 1 + cards.length) % cards.length
            ) {

                card.classList.add(
                    "mobile-prev"
                );

            }

            else {

                card.classList.add(
                    "mobile-hidden"
                );

            }

        });

        return;
    }

    cards.forEach(card => {
        card.className = "card hidden";
    });

    cards.forEach((card, index) => {

        const offset =
            (index - current + cards.length) %
            cards.length;

        if (offset === 0) {

            card.className =
                "card center";

        }

        else if (offset === 1) {

            card.className =
                "card down-1";

        }

        else if (offset === 2) {

            card.className =
                "card down-2";

        }

        else if (
            offset === cards.length - 1
        ) {

            card.className =
                "card up-1";

        }

        else if (
            offset === cards.length - 2
        ) {

            card.className =
                "card up-2";

        }

        else {

            card.className =
                "card hidden";

        }

    });
}

function nextCard() {

    current =
        (current + 1) %
        cards.length;

    updateCarousel();
}

async function startPage() {

    const authenticated =
        await checkAuthentication();

    if (authenticated) {
        return;
    }

    updateCarousel();

    setInterval(
        nextCard,
        3500
    );
}

startPage();

window.addEventListener(
    "resize",
    updateCarousel
);