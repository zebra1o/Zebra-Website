// @ts-expect-error Module '"gsap"' has no exported member 'gsap'.
import { gsap } from 'gsap';

// @ts-expect-error Module '"gsap"' has no exported member 'gsap'.
import { Draggable } from 'gsap/dist/Draggable';

// Only register plugins once
if (typeof window !== 'undefined') {
	gsap.registerPlugin(Draggable);
}

export { gsap, Draggable };
