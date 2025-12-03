// LOCAL STORAGE //

function loadBoard() {
    const data = JSON.parse(localStorage.getItem('kanban')) || {};
    for (const columnName of ['todo', 'progress', 'done']) {
        const column = document.querySelector(
            `.column[data-column="${columnName}"] .cards`
        );
        column.innerHTML = '';

        (data[columnName] || []).forEach((card) => {
            createCard(column, card.id, card.text, card.color);
        });
    }
    updateCounters();
}

function saveBoard() {
    const data = {};
    document.querySelectorAll('.column').forEach((col) => {
        const name = col.dataset.column;
        const cards = [...col.querySelectorAll('.card')].map((c) => ({
            id: c.dataset.id,
            text: c.querySelector('.card-text').innerText,
            color: c.style.background,
        }));
        data[name] = cards;
    });
    localStorage.setItem('kanban', JSON.stringify(data));
}

// Losowy kolor i licznik //

function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function updateCounters() {
    document.querySelectorAll('.column').forEach((col) => {
        const count = col.querySelectorAll('.card').length;
        col.querySelector('.counter').innerText = count;
    });
}

// Tworzenie kart //

function createCard(
    container,
    id = Date.now(),
    text = 'Nowa karta',
    color = randomColor()
) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = id;
    card.draggable = true;
    card.style.background = color;

    card.innerHTML = `
        <div class="card-header">
            <span class="card-text" contenteditable="true">${text}</span>
            <div class="card-buttons">
                <button class="left">←</button>
                <button class="right">→</button>
                <button class="color">🎨</button>
                <button class="delete">x</button>
            </div>
        </div>
    `;

    container.appendChild(card);
    saveBoard();
    updateCounters();
}

document.querySelectorAll('.column').forEach((column) => {
    const cardsContainer = column.querySelector('.cards');

    // Dodawanie kart
    column.querySelector('.add-card').addEventListener('click', () => {
        createCard(cardsContainer);
    });

    // Kolorowanie kolumny
    column.querySelector('.color-column').addEventListener('click', () => {
        cardsContainer.querySelectorAll('.card').forEach((c) => {
            c.style.background = randomColor();
        });
        saveBoard();
    });

    // Sortowanie kart alfabetyczne //
    column.querySelector('.sort').addEventListener('click', () => {
        const cards = [...cardsContainer.children];
        cards.sort((a, b) =>
            a
                .querySelector('.card-text')
                .innerText.localeCompare(
                    b.querySelector('.card-text').innerText
                )
        );
        cards.forEach((c) => cardsContainer.appendChild(c));
        saveBoard();
    });

    // Przenoszenie, usuwanie, kolorowanie //
    cardsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;

        // Usuwanie
        if (e.target.classList.contains('delete')) {
            card.remove();
            saveBoard();
            updateCounters();
        }

        // Zmiana koloru pojedynczej karty
        if (e.target.classList.contains('color')) {
            card.style.background = randomColor();
            saveBoard();
        }

        // Przenoszenie
        if (e.target.classList.contains('left')) {
            const prev = column.previousElementSibling;
            if (prev) prev.querySelector('.cards').appendChild(card);
            saveBoard();
            updateCounters();
        }

        if (e.target.classList.contains('right')) {
            const next = column.nextElementSibling;
            if (next) next.querySelector('.cards').appendChild(card);
            saveBoard();
            updateCounters();
        }
    });
});
// Drag & Drop //
let draggedCard = null;

document.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;

    draggedCard = card;
    e.dataTransfer.effectAllowed = 'move';
    card.style.opacity = '0.5';
});

document.addEventListener('dragend', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;

    card.style.opacity = '1';
    draggedCard = null;
});

document.addEventListener('dragover', (e) => {
    const col = e.target.closest('.column');
    if (!col) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
});

document.addEventListener('drop', (e) => {
    const col = e.target.closest('.column');
    if (!col || !draggedCard) return;

    e.preventDefault();

    const cardsArea = col.querySelector('.cards');
    cardsArea.appendChild(draggedCard);

    saveBoard();
    updateCounters();
});

// Odtwórz tablice przy starcie
loadBoard();
