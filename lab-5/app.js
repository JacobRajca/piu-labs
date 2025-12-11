import { store } from './store.js';
import { initUI } from './ui.js';

console.log('app.js załadowany');

initUI(store);
