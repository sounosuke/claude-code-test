/**
 * Enhanced Interaction System for IT Company Website
 * Worker2 Implementation - Advanced Eye Tracking & Interaction Features
 */

class EyeTrackingSystem {
    constructor() {
        this.webgazer = null;
        this.isInitialized = false;
        this.gazeData = [];
        this.currentGaze = { x: 0, y: 0 };
        this.confidenceThreshold = 0.5;
        this.calibrationComplete = false;
    }

    async initialize() {
        try {
            // WebGazer.js initialization
            this.webgazer = await webgazer.setGazeListener((data, timestamp) => {
                if (data && data.x && data.y) {
                    this.handleGazeData(data, timestamp);
                }
            }).begin();

            // Configure WebGazer settings
            this.webgazer.showVideoPreview(false)
                         .showPredictionPoints(false)
                         .applyKalmanFilter(true);

            this.isInitialized = true;
            console.log('Eye tracking initialized successfully');
            
            // Start calibration process
            this.startCalibration();
            
        } catch (error) {
            console.error('Eye tracking initialization failed:', error);
            this.fallbackToMouseTracking();
        }
    }

    handleGazeData(data, timestamp) {
        // Store gaze data with confidence filtering
        if (data.confidence && data.confidence > this.confidenceThreshold) {
            this.currentGaze = { x: data.x, y: data.y, timestamp };
            this.gazeData.push(this.currentGaze);
            
            // Keep only recent data (last 100 points)
            if (this.gazeData.length > 100) {
                this.gazeData.shift();
            }
            
            // Trigger gaze-based interactions
            this.processGazeInteractions();
        }
    }

    startCalibration() {
        const calibrationPoints = [
            { x: window.innerWidth * 0.1, y: window.innerHeight * 0.1 },
            { x: window.innerWidth * 0.9, y: window.innerHeight * 0.1 },
            { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
            { x: window.innerWidth * 0.1, y: window.innerHeight * 0.9 },
            { x: window.innerWidth * 0.9, y: window.innerHeight * 0.9 }
        ];

        this.showCalibrationInterface(calibrationPoints);
    }

    showCalibrationInterface(points) {
        const calibrationOverlay = document.createElement('div');
        calibrationOverlay.id = 'eye-calibration';
        calibrationOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: Arial, sans-serif;
        `;

        const instruction = document.createElement('div');
        instruction.innerHTML = `
            <h2>Eye Tracking Calibration</h2>
            <p>Please look at the red dots that appear and click on them</p>
            <button id="start-calibration" style="padding: 10px 20px; font-size: 16px;">Start Calibration</button>
        `;
        calibrationOverlay.appendChild(instruction);
        document.body.appendChild(calibrationOverlay);

        document.getElementById('start-calibration').onclick = () => {
            this.runCalibrationSequence(points, calibrationOverlay);
        };
    }

    runCalibrationSequence(points, overlay) {
        let currentPoint = 0;
        
        const showPoint = () => {
            if (currentPoint >= points.length) {
                this.completeCalibration(overlay);
                return;
            }

            const point = points[currentPoint];
            const dot = document.createElement('div');
            dot.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                background: red;
                border-radius: 50%;
                left: ${point.x - 10}px;
                top: ${point.y - 10}px;
                cursor: pointer;
                animation: pulse 1s infinite;
            `;
            
            overlay.innerHTML = '';
            overlay.appendChild(dot);
            
            dot.onclick = () => {
                currentPoint++;
                setTimeout(showPoint, 500);
            };
        };

        showPoint();
    }

    completeCalibration(overlay) {
        this.calibrationComplete = true;
        overlay.innerHTML = `
            <div style="text-align: center;">
                <h2>Calibration Complete!</h2>
                <p>Eye tracking is now active</p>
                <button onclick="this.parentElement.parentElement.remove()">Continue</button>
            </div>
        `;
        
        setTimeout(() => {
            overlay.remove();
        }, 2000);
    }

    processGazeInteractions() {
        if (!this.calibrationComplete) return;

        // Find elements under gaze
        const elements = document.elementsFromPoint(this.currentGaze.x, this.currentGaze.y);
        
        elements.forEach(element => {
            if (element.classList.contains('gaze-interactive')) {
                this.triggerGazeEffect(element);
            }
        });
    }

    triggerGazeEffect(element) {
        // Add gaze highlight effect
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.05)';
        element.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
        
        // Remove effect after delay
        setTimeout(() => {
            element.style.transform = '';
            element.style.boxShadow = '';
        }, 1000);
    }

    fallbackToMouseTracking() {
        console.log('Falling back to mouse tracking');
        document.addEventListener('mousemove', (e) => {
            this.currentGaze = { x: e.clientX, y: e.clientY, timestamp: Date.now() };
        });
    }

    getGazeHeatmap() {
        // Generate heatmap data from gaze points
        const heatmapData = {};
        this.gazeData.forEach(point => {
            const key = `${Math.floor(point.x / 50)}-${Math.floor(point.y / 50)}`;
            heatmapData[key] = (heatmapData[key] || 0) + 1;
        });
        return heatmapData;
    }
}

class MousePredictionSystem {
    constructor() {
        this.mouseHistory = [];
        this.predictionWindow = 10; // frames to look ahead
        this.velocitySmoothing = 0.8;
        this.currentVelocity = { x: 0, y: 0 };
        this.predictedPosition = { x: 0, y: 0 };
    }

    initialize() {
        document.addEventListener('mousemove', (e) => {
            this.updateMouseHistory(e.clientX, e.clientY);
            this.calculatePrediction();
        });
    }

    updateMouseHistory(x, y) {
        const timestamp = Date.now();
        this.mouseHistory.push({ x, y, timestamp });
        
        // Keep only recent history
        if (this.mouseHistory.length > 20) {
            this.mouseHistory.shift();
        }
    }

    calculatePrediction() {
        if (this.mouseHistory.length < 2) return;

        const recent = this.mouseHistory.slice(-5);
        const velocities = [];

        for (let i = 1; i < recent.length; i++) {
            const dt = (recent[i].timestamp - recent[i-1].timestamp) / 1000;
            if (dt > 0) {
                velocities.push({
                    x: (recent[i].x - recent[i-1].x) / dt,
                    y: (recent[i].y - recent[i-1].y) / dt
                });
            }
        }

        if (velocities.length > 0) {
            // Average velocity
            const avgVel = velocities.reduce((acc, vel) => ({
                x: acc.x + vel.x / velocities.length,
                y: acc.y + vel.y / velocities.length
            }), { x: 0, y: 0 });

            // Smooth velocity
            this.currentVelocity.x = this.currentVelocity.x * this.velocitySmoothing + 
                                    avgVel.x * (1 - this.velocitySmoothing);
            this.currentVelocity.y = this.currentVelocity.y * this.velocitySmoothing + 
                                    avgVel.y * (1 - this.velocitySmoothing);

            // Predict future position
            const currentPos = this.mouseHistory[this.mouseHistory.length - 1];
            const predictionTime = this.predictionWindow / 60; // assuming 60fps
            
            this.predictedPosition = {
                x: currentPos.x + this.currentVelocity.x * predictionTime,
                y: currentPos.y + this.currentVelocity.y * predictionTime
            };

            this.triggerPredictiveEffects();
        }
    }

    triggerPredictiveEffects() {
        // Find elements that might be hovered soon
        const elements = document.elementsFromPoint(
            this.predictedPosition.x, 
            this.predictedPosition.y
        );

        elements.forEach(element => {
            if (element.classList.contains('predictive-hover')) {
                this.preloadHoverEffect(element);
            }
        });
    }

    preloadHoverEffect(element) {
        // Subtle pre-hover effect
        element.style.transition = 'all 0.1s ease';
        element.style.opacity = '0.9';
        
        setTimeout(() => {
            if (!element.matches(':hover')) {
                element.style.opacity = '';
            }
        }, 200);
    }
}

class EmotionColorSystem {
    constructor() {
        this.emotions = {
            joy: { h: 45, s: 80, l: 60 },      // Warm yellow
            trust: { h: 210, s: 70, l: 50 },   // Blue
            anticipation: { h: 30, s: 90, l: 55 }, // Orange
            surprise: { h: 300, s: 80, l: 70 }, // Magenta
            sadness: { h: 240, s: 60, l: 40 },  // Dark blue
            disgust: { h: 120, s: 40, l: 30 },  // Dark green
            anger: { h: 0, s: 80, l: 50 },      // Red
            fear: { h: 270, s: 50, l: 25 }      // Dark purple
        };
        
        this.currentEmotion = 'trust';
        this.transitionSpeed = 0.02;
        this.faceAPI = null;
    }

    async initialize() {
        try {
            // Initialize face-api.js for emotion detection
            await this.loadFaceAPI();
            this.startEmotionDetection();
        } catch (error) {
            console.error('Emotion detection initialization failed:', error);
            this.fallbackToInteractionBasedEmotion();
        }
    }

    async loadFaceAPI() {
        // Load face-api.js models (would need to be included via CDN)
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        this.faceAPI = faceapi;
    }

    startEmotionDetection() {
        const video = document.createElement('video');
        video.style.display = 'none';
        document.body.appendChild(video);

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.play();
                
                setInterval(() => {
                    this.detectEmotion(video);
                }, 1000); // Check every second
            })
            .catch(() => {
                this.fallbackToInteractionBasedEmotion();
            });
    }

    async detectEmotion(video) {
        try {
            const detections = await this.faceAPI
                .detectAllFaces(video, new this.faceAPI.TinyFaceDetectorOptions())
                .withFaceExpressions();

            if (detections.length > 0) {
                const expressions = detections[0].expressions;
                const dominantEmotion = Object.keys(expressions)
                    .reduce((a, b) => expressions[a] > expressions[b] ? a : b);
                
                this.updateEmotion(dominantEmotion);
            }
        } catch (error) {
            console.error('Emotion detection error:', error);
        }
    }

    fallbackToInteractionBasedEmotion() {
        // Use interaction patterns to infer emotion
        let scrollSpeed = 0;
        let clickCount = 0;
        
        document.addEventListener('scroll', () => {
            scrollSpeed = Math.abs(window.scrollY - (scrollSpeed || 0));
            
            if (scrollSpeed > 100) {
                this.updateEmotion('anticipation');
            } else if (scrollSpeed < 20) {
                this.updateEmotion('trust');
            }
        });

        document.addEventListener('click', () => {
            clickCount++;
            if (clickCount > 3) {
                this.updateEmotion('joy');
                setTimeout(() => clickCount = 0, 5000);
            }
        });
    }

    updateEmotion(emotion) {
        if (this.emotions[emotion] && emotion !== this.currentEmotion) {
            this.currentEmotion = emotion;
            this.applyEmotionalColorScheme();
        }
    }

    applyEmotionalColorScheme() {
        const color = this.emotions[this.currentEmotion];
        const rootStyle = document.documentElement.style;
        
        // Update CSS custom properties for emotional theming
        rootStyle.setProperty('--emotion-hue', color.h);
        rootStyle.setProperty('--emotion-saturation', color.s + '%');
        rootStyle.setProperty('--emotion-lightness', color.l + '%');
        
        // Apply gradual color transition
        rootStyle.setProperty('--primary-color', 
            `hsl(${color.h}, ${color.s}%, ${color.l}%)`);
        rootStyle.setProperty('--secondary-color', 
            `hsl(${(color.h + 30) % 360}, ${color.s * 0.8}%, ${color.l * 1.2}%)`);
        rootStyle.setProperty('--accent-color', 
            `hsl(${(color.h + 60) % 360}, ${color.s * 0.6}%, ${color.l * 0.8}%)`);
        
        // Trigger emotional particle effects
        this.triggerEmotionalParticles();
    }

    triggerEmotionalParticles() {
        const color = this.emotions[this.currentEmotion];
        const event = new CustomEvent('emotionChange', {
            detail: { 
                emotion: this.currentEmotion,
                color: `hsl(${color.h}, ${color.s}%, ${color.l}%)`
            }
        });
        document.dispatchEvent(event);
    }
}

class QuantumParticleSystem {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.mousePos = { x: 0, y: 0 };
        this.quantumField = [];
        this.waveFunction = 0;
        this.entangledPairs = [];
    }

    initialize() {
        this.createCanvas();
        this.initializeQuantumField();
        this.startPhysicsLoop();
        this.bindEvents();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'quantum-particles';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            mix-blend-mode: screen;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        document.body.appendChild(this.canvas);
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initializeQuantumField() {
        // Create quantum field grid
        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            for (let y = 0; y < this.canvas.height; y += gridSize) {
                this.quantumField.push({
                    x, y,
                    energy: Math.random() * 0.5,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }

        // Create initial particles
        for (let i = 0; i < 200; i++) {
            this.createParticle();
        }

        // Create entangled pairs
        this.createEntangledPairs();
    }

    createParticle() {
        const particle = {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            mass: 1 + Math.random() * 3,
            charge: Math.random() > 0.5 ? 1 : -1,
            spin: Math.random() * Math.PI * 2,
            wave: Math.random() * Math.PI * 2,
            energy: Math.random() * 100,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            size: 2 + Math.random() * 4,
            uncertainty: Math.random() * 10
        };

        this.particles.push(particle);
        return particle;
    }

    createEntangledPairs() {
        for (let i = 0; i < this.particles.length; i += 2) {
            if (i + 1 < this.particles.length) {
                this.entangledPairs.push({
                    particle1: this.particles[i],
                    particle2: this.particles[i + 1],
                    entanglementStrength: Math.random() * 0.5
                });
            }
        }
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mousePos = { x: e.clientX, y: e.clientY };
        });

        // Listen for emotional changes
        document.addEventListener('emotionChange', (e) => {
            this.updateParticleColors(e.detail.color);
        });
    }

    updateParticleColors(emotionColor) {
        this.particles.forEach(particle => {
            particle.color = emotionColor;
        });
    }

    startPhysicsLoop() {
        const animate = () => {
            this.updatePhysics();
            this.render();
            requestAnimationFrame(animate);
        };
        animate();
    }

    updatePhysics() {
        this.waveFunction += 0.02;
        
        this.particles.forEach((particle, index) => {
            // Quantum uncertainty principle
            particle.x += particle.vx + (Math.random() - 0.5) * particle.uncertainty;
            particle.y += particle.vy + (Math.random() - 0.5) * particle.uncertainty;
            
            // Wave function collapse near mouse
            const mouseDistance = Math.sqrt(
                Math.pow(particle.x - this.mousePos.x, 2) + 
                Math.pow(particle.y - this.mousePos.y, 2)
            );
            
            if (mouseDistance < 100) {
                // Particle becomes more defined near observation point
                particle.uncertainty = Math.max(1, particle.uncertainty * 0.9);
                
                // Gravitational-like attraction
                const force = 50 / (mouseDistance + 1);
                const angle = Math.atan2(
                    this.mousePos.y - particle.y,
                    this.mousePos.x - particle.x
                );
                
                particle.vx += Math.cos(angle) * force * 0.01;
                particle.vy += Math.sin(angle) * force * 0.01;
            } else {
                // Restore quantum uncertainty
                particle.uncertainty = Math.min(10, particle.uncertainty * 1.01);
            }
            
            // Apply quantum field influence
            this.applyQuantumFieldForce(particle);
            
            // Handle entanglement
            this.processEntanglement(particle, index);
            
            // Boundary conditions (quantum tunneling effect)
            this.handleBoundaries(particle);
            
            // Update wave properties
            particle.wave += 0.1;
            particle.spin += 0.05;
            
            // Damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }

    applyQuantumFieldForce(particle) {
        // Find nearest field points
        const nearbyFields = this.quantumField.filter(field => {
            const distance = Math.sqrt(
                Math.pow(field.x - particle.x, 2) + 
                Math.pow(field.y - particle.y, 2)
            );
            return distance < 100;
        });

        nearbyFields.forEach(field => {
            const distance = Math.sqrt(
                Math.pow(field.x - particle.x, 2) + 
                Math.pow(field.y - particle.y, 2)
            );
            
            if (distance > 0) {
                const force = field.energy * Math.sin(field.phase + this.waveFunction) / distance;
                const angle = Math.atan2(field.y - particle.y, field.x - particle.x);
                
                particle.vx += Math.cos(angle) * force * 0.1;
                particle.vy += Math.sin(angle) * force * 0.1;
            }
        });
    }

    processEntanglement(particle, index) {
        const entanglements = this.entangledPairs.filter(pair => 
            pair.particle1 === particle || pair.particle2 === particle
        );

        entanglements.forEach(entanglement => {
            const partner = entanglement.particle1 === particle ? 
                           entanglement.particle2 : entanglement.particle1;
            
            // Correlated behavior
            if (Math.random() < entanglement.entanglementStrength) {
                partner.spin = -particle.spin; // Opposite spins
                partner.color = particle.color; // Synchronized colors
            }
        });
    }

    handleBoundaries(particle) {
        // Quantum tunneling - small probability of passing through boundaries
        const tunnelingProbability = 0.01;
        
        if (particle.x < 0) {
            if (Math.random() < tunnelingProbability) {
                particle.x = this.canvas.width;
            } else {
                particle.x = 0;
                particle.vx = Math.abs(particle.vx);
            }
        }
        
        if (particle.x > this.canvas.width) {
            if (Math.random() < tunnelingProbability) {
                particle.x = 0;
            } else {
                particle.x = this.canvas.width;
                particle.vx = -Math.abs(particle.vx);
            }
        }
        
        if (particle.y < 0) {
            if (Math.random() < tunnelingProbability) {
                particle.y = this.canvas.height;
            } else {
                particle.y = 0;
                particle.vy = Math.abs(particle.vy);
            }
        }
        
        if (particle.y > this.canvas.height) {
            if (Math.random() < tunnelingProbability) {
                particle.y = 0;
            } else {
                particle.y = this.canvas.height;
                particle.vy = -Math.abs(particle.vy);
            }
        }
    }

    render() {
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render quantum field
        this.renderQuantumField();
        
        // Render particles
        this.particles.forEach(particle => {
            this.renderParticle(particle);
        });
        
        // Render entanglement connections
        this.renderEntanglements();
    }

    renderQuantumField() {
        this.quantumField.forEach(field => {
            field.phase += 0.01;
            const intensity = Math.sin(field.phase) * field.energy;
            
            if (intensity > 0.3) {
                this.ctx.beginPath();
                this.ctx.arc(field.x, field.y, intensity * 5, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(100, 200, 255, ${intensity * 0.1})`;
                this.ctx.fill();
            }
        });
    }

    renderParticle(particle) {
        this.ctx.save();
        
        // Quantum uncertainty visualization
        const uncertainty = particle.uncertainty;
        const waveOffset = Math.sin(particle.wave) * uncertainty;
        
        this.ctx.translate(particle.x + waveOffset, particle.y + waveOffset);
        this.ctx.rotate(particle.spin);
        
        // Particle core
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
        
        // Probability cloud
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size + uncertainty, 0, Math.PI * 2);
        this.ctx.strokeStyle = particle.color;
        this.ctx.globalAlpha = 0.3;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    renderEntanglements() {
        this.entangledPairs.forEach(pair => {
            if (Math.random() < 0.1) { // Intermittent visualization
                this.ctx.beginPath();
                this.ctx.moveTo(pair.particle1.x, pair.particle1.y);
                this.ctx.lineTo(pair.particle2.x, pair.particle2.y);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${pair.entanglementStrength * 0.5})`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        });
    }
}

// Enhanced Interaction Manager
class EnhancedInteractionManager {
    constructor() {
        this.eyeTracking = new EyeTrackingSystem();
        this.mousePrediction = new MousePredictionSystem();
        this.emotionColor = new EmotionColorSystem();
        this.quantumParticles = new QuantumParticleSystem();
        this.performanceMonitor = new PerformanceMonitor();
    }

    async initialize() {
        console.log('Initializing Enhanced Interaction System...');
        
        try {
            // Initialize all systems
            await this.eyeTracking.initialize();
            this.mousePrediction.initialize();
            await this.emotionColor.initialize();
            this.quantumParticles.initialize();
            this.performanceMonitor.start();
            
            // Add interactive classes to relevant elements
            this.markInteractiveElements();
            
            console.log('Enhanced Interaction System initialized successfully');
            
        } catch (error) {
            console.error('Enhanced Interaction System initialization failed:', error);
        }
    }

    markInteractiveElements() {
        // Add classes for different interaction types
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(btn => {
            btn.classList.add('gaze-interactive', 'predictive-hover');
        });

        const links = document.querySelectorAll('a');
        links.forEach(link => {
            link.classList.add('gaze-interactive', 'predictive-hover');
        });

        const cards = document.querySelectorAll('.card, .feature, .service');
        cards.forEach(card => {
            card.classList.add('gaze-interactive');
        });
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.startTime = Date.now();
        this.memoryUsage = 0;
    }

    start() {
        this.monitorFPS();
        this.monitorMemory();
    }

    monitorFPS() {
        const measureFPS = () => {
            this.frameCount++;
            const elapsed = Date.now() - this.startTime;
            
            if (elapsed >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / elapsed);
                this.frameCount = 0;
                this.startTime = Date.now();
                
                // Adjust quality based on performance
                if (this.fps < 30) {
                    this.degradePerformance();
                } else if (this.fps > 50) {
                    this.enhancePerformance();
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        measureFPS();
    }

    monitorMemory() {
        if (performance.memory) {
            setInterval(() => {
                this.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
                
                if (this.memoryUsage > 100) { // 100MB threshold
                    this.cleanupMemory();
                }
            }, 5000);
        }
    }

    degradePerformance() {
        // Reduce particle count
        document.dispatchEvent(new CustomEvent('reduceQuality'));
    }

    enhancePerformance() {
        // Increase particle count or effects
        document.dispatchEvent(new CustomEvent('enhanceQuality'));
    }

    cleanupMemory() {
        // Force garbage collection hints
        document.dispatchEvent(new CustomEvent('cleanupMemory'));
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const enhancedInteractions = new EnhancedInteractionManager();
    enhancedInteractions.initialize();
});

// Export for integration with Worker1's base
window.EnhancedInteractionSystem = {
    EyeTrackingSystem,
    MousePredictionSystem,
    EmotionColorSystem,
    QuantumParticleSystem,
    EnhancedInteractionManager
};