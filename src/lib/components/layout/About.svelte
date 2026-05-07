<script lang="ts">
	import { onMount } from 'svelte';
	import SparklingHighlight from '$blocks/SparklingHighlight.svelte';
	import Socials from '$blocks/Socials.svelte';

	interface Props {
		/** From DB (about_heading). Fallback when empty. */
		aboutHeading?: string;
		/** From DB (about_highlight). Phrase in heading to wrap in sparkle; must match exactly. */
		aboutHighlight?: string;
		/** From DB (about_text). Fallback when empty. */
		aboutText?: string;
		/** From DB (about_image). Fallback when empty. */
		aboutImage?: string;
		/** Legacy: from DB (site_title) when about_heading empty. */
		siteTitle?: string;
		/** Legacy: from DB (site_description) when about_text empty. */
		siteDescription?: string;
		/** From DB (social_links JSON). */
		socialLinks?: import('$lib/utils/types').SocialLinkItem[];
	}
	let {
		aboutHeading = '',
		aboutHighlight = '',
		aboutText = '',
		aboutImage = '',
		siteTitle = '',
		siteDescription = '',
		socialLinks = []
	}: Props = $props();

	const heading = $derived(aboutHeading?.trim() || siteTitle?.trim() || 'About');
	const highlightPhrase = $derived(aboutHighlight?.trim() || '');
	const headingParts = $derived(
		highlightPhrase && heading.includes(highlightPhrase)
			? (() => {
					const i = heading.indexOf(highlightPhrase);
					return [heading.slice(0, i), highlightPhrase, heading.slice(i + highlightPhrase.length)];
				})()
			: null
	);
	const text = $derived(aboutText?.trim() || siteDescription?.trim() || 'Site description is set in Admin → Settings.');
	const aboutImageSrc = $derived(aboutImage?.trim() || '/images/sample-image.webp');
	const aboutImageUrl = $derived(
		aboutImageSrc.startsWith('http') || aboutImageSrc.startsWith('/') ? aboutImageSrc : '/' + aboutImageSrc.replace(/^\//, '')
	);
	let imageRef: HTMLDivElement;
	let wrapRef: HTMLDivElement;
	let canvasRef: HTMLCanvasElement;
	let inView = $state(false);

	type Particle = {
		x: number;
		y: number;
		vx: number;
		vy: number;
		opacity: number;
		decay: number;
		size: number;
	};

	let particles: Particle[] = [];
	let rafId = 0;
	const PARTICLE_COUNT = 100;
	const EXTRA_TOP = 100;

	function createParticle(w: number, h: number, spawnMinY: number, spawnMaxY: number): Particle {
		return {
			x: Math.random() * w,
			y: spawnMinY + Math.random() * (spawnMaxY - spawnMinY),
			vx: (Math.random() - 0.5) * 0.4,
			vy: -Math.random() * 0.7 - 0.2,
			opacity: 1,
			decay: 0.0025 + Math.random() * 0.003,
			size: 0.5 + Math.random() * 1
		};
	}

	function tick() {
		if (!canvasRef || !wrapRef || !inView) {
			rafId = requestAnimationFrame(tick);
			return;
		}
		const rect = wrapRef.getBoundingClientRect();
		const w = rect.width;
		const h = rect.height;
		if (w <= 0 || h <= 0) {
			rafId = requestAnimationFrame(tick);
			return;
		}
		const canvasH = h + EXTRA_TOP;
		const spawnMinY = EXTRA_TOP;
		const spawnMaxY = canvasH;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		if (
			canvasRef.width !== w * dpr ||
			canvasRef.height !== canvasH * dpr
		) {
			canvasRef.width = w * dpr;
			canvasRef.height = canvasH * dpr;
			canvasRef.style.width = `${w}px`;
			canvasRef.style.height = `${canvasH}px`;
			canvasRef.style.top = `-${EXTRA_TOP}px`;
			canvasRef.style.left = '0';
		}
		const ctx = canvasRef.getContext('2d');
		if (!ctx) {
			rafId = requestAnimationFrame(tick);
			return;
		}
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, w, canvasH);

		// keep pool filled
		while (particles.length < PARTICLE_COUNT) {
			particles.push(createParticle(w, h, spawnMinY, spawnMaxY));
		}

		// update & draw
		const color =
			getComputedStyle(document.documentElement).getPropertyValue('--color--text-rgb').trim() ||
			'255, 255, 255';
		for (let i = particles.length - 1; i >= 0; i--) {
			const p = particles[i];
			p.x += p.vx;
			p.y += p.vy;
			p.opacity -= p.decay;

			const dead = p.y < -15 || p.opacity <= 0;
			if (dead) {
				particles[i] = createParticle(w, h, spawnMinY, spawnMaxY);
			} else {
				ctx.fillStyle = `rgba(${color}, ${Math.max(0, p.opacity)})`;
				ctx.fillRect(p.x, p.y, p.size, p.size);
			}
		}

		rafId = requestAnimationFrame(tick);
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) inView = true;
			},
			{ threshold: 0.2, rootMargin: '0px' }
		);
		if (imageRef) observer.observe(imageRef);

		const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!prefersReducedMotion) {
			rafId = requestAnimationFrame(tick);
		}

		return () => {
			observer.disconnect();
			cancelAnimationFrame(rafId);
		};
	});
</script>

<section id="about">
	<div class="info">
		<h2>
			{#if headingParts}
				{headingParts[0]}
				<SparklingHighlight color="secondary">{headingParts[1]}</SparklingHighlight>
				{headingParts[2]}
			{:else}
				<SparklingHighlight color="secondary">{heading}</SparklingHighlight>
			{/if}
		</h2>
		<p>
			{text}
		</p>
		<div class="socials">
			<span>Socials:</span>
			<Socials items={socialLinks} />
		</div>
	</div>
	<div
		class="image {inView ? 'in-view' : ''}"
		bind:this={imageRef}
	>
		<div class="image-wrap" bind:this={wrapRef}>
			<img src={aboutImageUrl} alt="About" loading="lazy" decoding="async" />
			<canvas
				class="particles-canvas"
				bind:this={canvasRef}
				aria-hidden="true"
			></canvas>
		</div>
	</div>
</section>

<style lang="scss">
	@use '$lib/scss/mixins' as *;
	@use '$lib/scss/fluid' as *;

	#about {
		position: relative;
		display: grid;
		grid-template-columns: 500px 250px;
		align-items: center;
		justify-content: space-between;
		padding: 6.25em 0 4.75em 0;
		width: 100%;
		max-width: 1080px;
		margin: 0 auto;

		@include for-phone-only {
			grid-template-columns: 1fr;
			justify-items: center;
			gap: 6em 20px;
			padding: 3.25em 0 0.75em 0;
		}
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: 10px;

		h2 {
			font-family: var(--font--title);
			@include fluid-text(1.25rem, 1.8rem);
			font-weight: 600;
			margin: 0;
			color: var(--color--text);

			@include for-phone-only {
				text-align: center;
			}
		}

		p {
			margin: 0;
			line-height: 1.5;
			color: var(--color--text);
			@include fluid-text(0.9375rem, 1.125rem);

			@include for-phone-only {
				text-align: justify;
			}
		}

		@include for-phone-only {
			gap: 20px;
		}
	}

	.socials {
		display: flex;
		align-items: center;
		gap: 15px;

		@include for-phone-only {
			justify-content: center;
			margin-bottom: 10px;

			span {
				display: none;
			}
		}
	}

	.image {
		width: 220px;
		height: 220px;
		overflow: visible;
		border-radius: 6px;
		transform: translateX(120%);
		opacity: 0;

		&.in-view {
			animation: slide-in-bounce 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		}

		@media screen and (prefers-reduced-motion: reduce) {
			&.in-view {
				animation: none;
				transform: none;
				opacity: 1;
			}
		}

		.image-wrap {
			position: relative;
			width: 100%;
			height: 100%;
			overflow: visible;
			border-radius: 6px;
		}

		.image-wrap img {
			width: 100%;
			height: 100%;
			object-fit: contain;
			display: block;
			border-radius: 6px;
		}

		.particles-canvas {
			position: absolute;
			left: 0;
			top: -100px;
			width: 100%;
			height: calc(100% + 100px);
			pointer-events: none;
			border-radius: 6px;
			z-index: 1;
		}
	}

	@keyframes slide-in-bounce {
		0% {
			transform: translateX(120%);
			opacity: 0;
		}
		60% {
			transform: translateX(-8%);
			opacity: 1;
		}
		80% {
			transform: translateX(4%);
		}
		100% {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
