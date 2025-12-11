import { createId } from './helpers.js';

const STORAGE_KEY = 'lab5-shapes';

class Store {
    constructor() {
        this.subscribers = new Set();
        this.state = {
            shapes: [],
        };

        this._loadFromStorage();
    }

    _loadFromStorage() {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.shapes)) {
            this.state.shapes = parsed.shapes;
        }
    }

    _saveToStorage() {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }

    _cloneState() {
        return {
            shapes: this.state.shapes.map((s) => ({ ...s })),
        };
    }

    _notify(action) {
        this._saveToStorage();
        const snapshot = this._cloneState();
        console.log('notify:', action.type, snapshot);
        this.subscribers.forEach((fn) => fn(snapshot, action));
    }

    subscribe(fn) {
        this.subscribers.add(fn);
        fn(this._cloneState(), { type: 'INIT' });
        return () => this.subscribers.delete(fn);
    }

    getCounts(state = this.state) {
        let squares = 0;
        let circles = 0;
        for (const s of state.shapes) {
            if (s.type === 'square') squares++;
            if (s.type === 'circle') circles++;
        }
        return { squares, circles };
    }

    addShape(type, color) {
        const shape = { id: createId(), type, color };
        this.state.shapes = [...this.state.shapes, shape];
        this._notify({ type: 'ADD_SHAPE', payload: { shape } });
    }

    removeShape(id) {
        const exists = this.state.shapes.some((s) => s.id === id);
        if (!exists) return;
        this.state.shapes = this.state.shapes.filter((s) => s.id !== id);
        this._notify({ type: 'REMOVE_SHAPE', payload: { id } });
    }

    recolorByType(type, colorFn) {
        this.state.shapes = this.state.shapes.map((s) =>
            s.type === type ? { ...s, color: colorFn() } : s
        );
        this._notify({ type: 'RECOLOR_TYPE', payload: { type } });
    }
}

export const store = new Store();
