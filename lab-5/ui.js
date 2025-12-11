import { randomHsl } from './helpers.js';

export function initUI(store) {
    console.log('initUI start');

    const addSquareBtn = document.getElementById('addSquare');
    const addCircleBtn = document.getElementById('addCircle');
    const recolorSquaresBtn = document.getElementById('recolorSquares');
    const recolorCirclesBtn = document.getElementById('recolorCircles');
    const cntSquaresEl = document.getElementById('cntSquares');
    const cntCirclesEl = document.getElementById('cntCircles');
    const board = document.getElementById('board');

    console.log('Elements:', {
        addSquareBtn,
        addCircleBtn,
        recolorSquaresBtn,
        recolorCirclesBtn,
        cntSquaresEl,
        cntCirclesEl,
        board,
    });

    addSquareBtn.addEventListener('click', () => {
        console.log('Add square');
        store.addShape('square', randomHsl());
    });

    addCircleBtn.addEventListener('click', () => {
        console.log('Add circle');
        store.addShape('circle', randomHsl());
    });

    recolorSquaresBtn.addEventListener('click', () => {
        console.log('Recolor square');
        store.recolorByType('square', randomHsl);
    });

    recolorCirclesBtn.addEventListener('click', () => {
        console.log('Recolor circle');
        store.recolorByType('circle', randomHsl);
    });

    board.addEventListener('click', (e) => {
        const shapeEl = e.target.closest('.shape');
        if (!shapeEl || !board.contains(shapeEl)) return;
        const id = shapeEl.dataset.id;
        console.log('shape, id =', id);
        if (id) {
            store.removeShape(id);
        }
    });

    function createShapeElement(shape) {
        const el = document.createElement('div');
        el.className = `shape ${shape.type}`;
        el.dataset.id = shape.id;
        el.dataset.type = shape.type;
        el.style.backgroundColor = shape.color;
        return el;
    }

    function renderAllShapes(shapes) {
        board.innerHTML = '';
        shapes.forEach((shape) => {
            const el = createShapeElement(shape);
            board.appendChild(el);
        });
    }

    function updateCountersFromState(state) {
        const { squares, circles } = store.getCounts(state);
        cntSquaresEl.textContent = squares;
        cntCirclesEl.textContent = circles;
    }

    function handleAddShape(action) {
        const shape = action.payload.shape;
        const el = createShapeElement(shape);
        board.appendChild(el);
    }

    function handleRemoveShape(action) {
        const { id } = action.payload;
        const el = board.querySelector(`.shape[data-id="${id}"]`);
        if (el) el.remove();
    }

    function handleRecolorType(state, action) {
        const { type } = action.payload;
        state.shapes
            .filter((s) => s.type === type)
            .forEach((shape) => {
                const el = board.querySelector(`.shape[data-id="${shape.id}"]`);
                if (el) el.style.backgroundColor = shape.color;
            });
    }

    store.subscribe((state, action) => {
        console.log('UI subscriber:', action.type, state);
        switch (action.type) {
            case 'INIT':
                renderAllShapes(state.shapes);
                updateCountersFromState(state);
                break;
            case 'ADD_SHAPE':
                handleAddShape(action);
                updateCountersFromState(state);
                break;
            case 'REMOVE_SHAPE':
                handleRemoveShape(action);
                updateCountersFromState(state);
                break;
            case 'RECOLOR_TYPE':
                handleRecolorType(state, action);
                updateCountersFromState(state);
                break;
            default:
                renderAllShapes(state.shapes);
                updateCountersFromState(state);
        }
    });
}
