<script lang="ts">
	import { gsap, Draggable } from '$lib/gsap.config';
	import { untrack } from 'svelte';
	import type { WorkMetadata } from '$lib/types';
	import { selectedWork, openModal } from '$lib/stores';
	import { queryParameters } from 'sveltekit-search-params';
	import slug from 'slug';

	const params = queryParameters();

	let { work }: { work: WorkMetadata } = $props();

	let cardElement: HTMLButtonElement | null = $state(null);
	let draggableInstance: Draggable[] | null = $state(null);

	function getRandomPosition() {
		const cardWidth = window.innerWidth <= 640 ? 150 : 300;
		const cardHeight = window.innerWidth <= 640 ? 150 : 300;
		const padding = 20;

		return {
			x: Math.random() * (window.innerWidth - cardWidth - padding * 2) + padding,
			y: Math.random() * (window.innerHeight - cardHeight - padding * 2) + padding
		};
	}

	function handleResize() {
		if (!cardElement) return;

		const x = gsap.getProperty(cardElement, 'x') as number;
		const y = gsap.getProperty(cardElement, 'y') as number;

		const cardWidth = window.innerWidth <= 640 ? 150 : 300;
		const cardHeight = window.innerWidth <= 640 ? 150 : 300;
		const padding = 20;

		const maxX = window.innerWidth - cardWidth - padding;
		const maxY = window.innerHeight - cardHeight - padding;

		const newX = Math.min(Math.max(padding, x), maxX);
		const newY = Math.min(Math.max(padding, y), maxY);

		gsap.set(cardElement, { x: newX, y: newY });

		if (draggableInstance?.[0]) {
			draggableInstance[0].applyBounds('.overflow-container');
		}
	}

	$effect.pre(() => {
		untrack(async () => {
			if (!cardElement) return;
			const initialPos = getRandomPosition();
			gsap.set(cardElement, {
				x: initialPos.x,
				y: initialPos.y
			});
		});

		draggableInstance = Draggable.create(cardElement, {
			type: 'x,y',
			bounds: '.overflow-container',
			cursor: 'grab',
			activeCursor: 'grabbing',
			minimumMovement: 2,
			onClick: function () {
				params.art = slug(work.title);
				$selectedWork = work;
				$openModal = true;
			},
			onDragStart: function () {
				gsap.to(cardElement, {
					scale: 1.05,
					duration: 0.2
				});
			},
			onDragEnd: function () {
				gsap.to(cardElement, {
					scale: 1,
					duration: 0.2
				});
			}
		});

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			if (draggableInstance?.[0]) {
				draggableInstance[0].kill();
			}
		};
	});
</script>

<button
	bind:this={cardElement}
	class="absolute h-auto touch-none opacity-0"
	style="touch-action: none;"
	aria-label={work.title}
>
	<div class="relative h-auto w-[150px] overflow-hidden sm:w-[300px]">
		<enhanced:img
			fetchpriority="high"
			loading="eager"
			onload={() => {
				gsap.to(cardElement, {
					opacity: 1,
					duration: 0.5
				});
			}}
			src={work.image as string}
			alt={work.title}
			class="h-full w-full object-contain"
		/>
	</div>
</button>
