/**
 * Compact sound manager: volume + enabled state persisted in localStorage,
 * UI sounds on hover/click via action. All comments in English.
 */
import { writable } from 'svelte/store';

export type SoundType = 'hover' | 'click' | 'tap' | 'cardHover' | 'popupOpen';
interface SoundConfig {
	volume?: number;
	preload?: boolean;
}

const VOLUME_STORAGE_KEY = 'sound-volume';
const SOUND_STORAGE_KEY = 'sound-enabled';

// Paths under static/sfx/ui/
const SOUND_URLS: Record<SoundType, string> = {
	hover: '/sfx/ui/ui_hover.mp3',
	click: '/sfx/ui/ui_tap.mp3',
	tap: '/sfx/ui/ui_tap.mp3',
	cardHover: '/sfx/ui/interface-zoom.mp3',
	popupOpen: '/sfx/ui/popup-open.mp3'
};

// Min ms between plays per type – prevents spam of same sound
const SOUND_COOLDOWN_MS: Record<SoundType, number> = {
	hover: 120,
	click: 100,
	tap: 100,
	cardHover: 180,
	popupOpen: 400
};

// Min ms between any two sounds – prevents overlap
const GLOBAL_COOLDOWN_MS = 70;

class SoundManager {
	private cache = new Map<string, HTMLAudioElement>();
	private enabled = true;
	private volume = 0.5;
	private lastPlayTimeByType: Partial<Record<SoundType, number>> = {};
	private lastPlayTimeGlobal = 0;

	async preload(src: string, config?: SoundConfig): Promise<void> {
		if (this.cache.has(src)) return;
		try {
			const audio = new Audio(src);
			audio.volume = config?.volume ?? this.volume;
			audio.preload = 'auto';
			await new Promise<void>((resolve, reject) => {
				const onReady = (): void => {
					audio.removeEventListener('canplaythrough', onReady);
					audio.removeEventListener('error', onErr);
					resolve();
				};
				const onErr = (): void => {
					audio.removeEventListener('canplaythrough', onReady);
					audio.removeEventListener('error', onErr);
					reject(new Error(`Failed to load: ${src}`));
				};
				audio.addEventListener('canplaythrough', onReady);
				audio.addEventListener('error', onErr);
				audio.load();
			});
			this.cache.set(src, audio);
		} catch (e) {
			console.warn('[SoundManager] Preload failed:', src, e);
		}
	}

	async play(src: string, config?: SoundConfig): Promise<void> {
		if (!this.enabled) return;
		try {
			let audio = this.cache.get(src);
			if (!audio) {
				audio = new Audio(src);
				audio.volume = config?.volume ?? this.volume;
				audio.preload = 'auto';
				this.cache.set(src, audio);
			}
			const clone = audio.cloneNode() as HTMLAudioElement;
			clone.volume = config?.volume ?? this.volume;
			await clone.play();
			clone.addEventListener('ended', () => clone.remove());
		} catch (e) {
			if (e instanceof Error && e.name !== 'NotAllowedError') {
				console.warn('[SoundManager] Play failed:', src, e);
			}
		}
	}

	playSound(type: SoundType, config?: SoundConfig): void {
		if (!this.enabled) return;
		const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
		const lastByType = this.lastPlayTimeByType[type] ?? 0;
		const cooldown = SOUND_COOLDOWN_MS[type] ?? 100;
		if (now - lastByType < cooldown) return;
		// popupOpen bypasses global cooldown so it always plays when modal opens (even right after button click)
		if (type !== 'popupOpen' && now - this.lastPlayTimeGlobal < GLOBAL_COOLDOWN_MS) return;
		this.lastPlayTimeByType[type] = now;
		this.lastPlayTimeGlobal = now;
		const src = SOUND_URLS[type];
		if (src) this.play(src, config);
	}

	getEnabled(): boolean {
		return this.enabled;
	}
	setEnabled(v: boolean): void {
		this.enabled = v;
	}
	getVolume(): number {
		return this.volume;
	}
	setVolume(v: number): void {
		this.volume = Math.max(0, Math.min(1, v));
		this.cache.forEach((a) => {
			a.volume = this.volume;
		});
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(VOLUME_STORAGE_KEY, String(this.volume));
			} catch {
				// ignore
			}
		}
	}

	async preloadUISounds(): Promise<void> {
		const urls = [
			SOUND_URLS.hover,
			SOUND_URLS.click,
			SOUND_URLS.cardHover,
			SOUND_URLS.popupOpen
		];
		await Promise.all(urls.map((src) => this.preload(src)));
	}
}

export const soundManager = new SoundManager();
export const soundEnabledStore = writable(true);

// Restore volume and enabled state from localStorage on module load
if (typeof window !== 'undefined') {
	try {
		const storedVol = localStorage.getItem(VOLUME_STORAGE_KEY);
		if (storedVol != null) {
			const v = Number(storedVol);
			if (!Number.isNaN(v) && v >= 0 && v <= 1) soundManager.setVolume(v);
		}
		const storedEnabled = localStorage.getItem(SOUND_STORAGE_KEY);
		if (storedEnabled !== null) {
			const enabled = storedEnabled === 'true';
			soundManager.setEnabled(enabled);
			soundEnabledStore.set(enabled);
		}
	} catch {
		// ignore
	}
	soundManager.preloadUISounds();
}

export function getSoundEnabled(): boolean {
	if (typeof window === 'undefined') return true;
	const stored = localStorage.getItem(SOUND_STORAGE_KEY);
	if (stored === null) return true;
	return stored === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
	if (typeof window === 'undefined') return;
	soundManager.setEnabled(enabled);
	try {
		localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
	} catch {
		// ignore
	}
	soundEnabledStore.set(enabled);
}

export function toggleSound(): boolean {
	const next = !getSoundEnabled();
	setSoundEnabled(next);
	return next;
}

export function initSound(): void {
	if (typeof window === 'undefined') return;
	setSoundEnabled(getSoundEnabled());
	try {
		const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
		if (stored != null) {
			const v = Number(stored);
			if (!Number.isNaN(v) && v >= 0 && v <= 1) soundManager.setVolume(v);
		}
	} catch {
		// ignore
	}
}

export function isTouchDevice(): boolean {
	if (typeof window === 'undefined') return false;
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export interface SoundActionOptions {
	hover?: boolean;
	click?: boolean;
	type?: SoundType;
}

/**
 * Svelte action: play hover sound on mouseenter (skipped on touch), click sound on click.
 * Use: use:sound or use:sound={{ hover: true, click: true, type: 'click' }}
 */
export function sound(
	node: HTMLElement,
	options?: SoundActionOptions
): { update?(opts?: SoundActionOptions): void; destroy(): void } {
	const { hover = true, click = true, type } = options ?? {};
	const isTouch = isTouchDevice();

	const onHover = (): void => {
		if (hover && !isTouch) soundManager.playSound(type ?? 'hover');
	};
	const onClick = (): void => {
		if (click) soundManager.playSound(type ?? 'click');
	};

	node.addEventListener('mouseenter', onHover);
	node.addEventListener('click', onClick);

	return {
		update(newOpts?: SoundActionOptions) {
			const { hover: h = true, click: c = true } = newOpts ?? {};
			node.removeEventListener('mouseenter', onHover);
			node.removeEventListener('click', onClick);
			if (h && !isTouch) node.addEventListener('mouseenter', onHover);
			if (c) node.addEventListener('click', onClick);
		},
		destroy() {
			node.removeEventListener('mouseenter', onHover);
			node.removeEventListener('click', onClick);
		}
	};
}
