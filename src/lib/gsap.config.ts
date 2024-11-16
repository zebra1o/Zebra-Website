import { gsap } from 'gsap';
import { Draggable } from 'gsap/dist/Draggable';

// Only register plugins once
if (typeof window !== 'undefined') {
	gsap.registerPlugin(Draggable);
}

export { gsap, Draggable };
