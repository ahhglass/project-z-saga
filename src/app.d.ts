// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'reading-time/lib/reading-time' {
	function readingTime(text: string): { text: string; minutes: number; time: number; words: number };
	export default readingTime;
}

export {};
