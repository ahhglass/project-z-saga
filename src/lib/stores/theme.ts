import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createTheme() {
	let currentTheme: string | undefined;
	if (browser) {
		currentTheme = localStorage.getItem('theme-preference') || 'auto';
		document.firstElementChild?.setAttribute('data-theme', currentTheme ?? 'auto');
	}

	const { subscribe, set } = writable<string>(currentTheme ?? 'auto');

	return {
		subscribe,
		set: (value: string) => {
			if (browser) {
				localStorage.setItem('theme-preference', value);
				document.firstElementChild?.setAttribute('data-theme', value);
			}
			set(value);
		}
	};
}

export const theme = createTheme();
