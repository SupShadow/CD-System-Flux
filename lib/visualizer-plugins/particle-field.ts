/**
 * Particle Field Visualizer
 *
 * A field of particles that react to audio frequencies.
 * Demonstrates complex state management with multiple entities.
 */

import {
    defineVisualizer,
    rgba,
    lerp,
    clamp,
} from '../visualizer-sdk';

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    size: number;
    speedFactor: number;
    hueOffset: number;
}

interface ParticleFieldState {
    particles: Particle[];
    time: number;
}

const PARTICLE_COUNT = 150;

export const particleFieldVisualizer = defineVisualizer<ParticleFieldState>({
    id: 'plugin-particle-field',
    name: 'Particle Field',
    author: 'FLUX_SDK',
    description: 'A reactive particle system that flows with the music',
    version: '1.0.0',
    tags: ['particles', 'ambient', 'flowing'],
    hasFlashing: false,

    init: (canvas) => {
        const particles: Particle[] = [];
        const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT * (canvas.width / canvas.height)));
        const rows = Math.ceil(PARTICLE_COUNT / cols);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = (col / cols) * canvas.width + (Math.random() - 0.5) * 50;
            const y = (row / rows) * canvas.height + (Math.random() - 0.5) * 50;

            particles.push({
                x,
                y,
                baseX: x,
                baseY: y,
                size: 2 + Math.random() * 3,
                speedFactor: 0.5 + Math.random() * 1.5,
                hueOffset: Math.random() * 30 - 15,
            });
        }

        return { particles, time: 0 };
    },

    render: (context, state) => {
        if (!state) return;

        const { ctx, canvas, metrics, color, dataArray, time } = context;
        const { bassAvg, midAvg, highAvg } = metrics;

        state.time = time;

        // Clear with subtle fade
        ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        state.particles.forEach((particle, index) => {
            // Get frequency data for this particle
            const freqIndex = Math.floor((index / PARTICLE_COUNT) * 128);
            const freqValue = dataArray[freqIndex] / 255;

            // Calculate displacement based on audio
            const angle = time * particle.speedFactor + index * 0.1;
            const displacement = freqValue * 50 + bassAvg * 30;

            // Target position with audio displacement
            const targetX = particle.baseX + Math.cos(angle) * displacement;
            const targetY = particle.baseY + Math.sin(angle) * displacement;

            // Smooth movement
            particle.x = lerp(particle.x, targetX, 0.1);
            particle.y = lerp(particle.y, targetY, 0.1);

            // Size based on frequency
            const dynamicSize = particle.size * (1 + freqValue * 2);

            // Draw particle
            const alpha = 0.3 + freqValue * 0.7;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, dynamicSize, 0, Math.PI * 2);
            ctx.fillStyle = rgba(color, alpha);
            ctx.fill();

            // Draw connections to nearby particles
            if (index < PARTICLE_COUNT - 1) {
                const nextParticle = state.particles[index + 1];
                const dx = nextParticle.x - particle.x;
                const dy = nextParticle.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const lineAlpha = (1 - distance / 100) * 0.3 * (bassAvg + 0.5);
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(nextParticle.x, nextParticle.y);
                    ctx.strokeStyle = rgba(color, lineAlpha);
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        });

        // Draw audio-reactive overlay glow
        const gradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 2
        );
        gradient.addColorStop(0, rgba(color, bassAvg * 0.1));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    onResize: (canvas, state) => {
        if (!state) return { particles: [], time: 0 };

        // Redistribute particles on resize
        const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT * (canvas.width / canvas.height)));
        const rows = Math.ceil(PARTICLE_COUNT / cols);

        state.particles.forEach((particle, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            particle.baseX = (col / cols) * canvas.width + (Math.random() - 0.5) * 50;
            particle.baseY = (row / rows) * canvas.height + (Math.random() - 0.5) * 50;
        });

        return state;
    },
});
