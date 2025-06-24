/**
 * Integration Bridge for Worker1 and Worker2 Systems
 * Seamlessly connects base functionality with enhanced interactions
 */

class IntegrationBridge {
    constructor() {
        this.worker1Base = null;
        this.worker2Enhanced = null;
        this.isIntegrated = false;
        this.compatibilityMode = 'auto';
    }

    async initialize() {
        console.log('🔗 Initializing Integration Bridge...');
        
        try {
            // Check if Worker1's base system exists
            await this.detectWorker1Base();
            
            // Initialize Worker2's enhanced system
            await this.initializeWorker2Enhanced();
            
            // Create seamless integration
            this.createIntegration();
            
            this.isIntegrated = true;
            console.log('✅ Integration Bridge initialized successfully');
            
        } catch (error) {
            console.error('❌ Integration Bridge initialization failed:', error);
            this.fallbackMode();
        }
    }

    async detectWorker1Base() {
        // Check for Worker1's base HTML structure
        const baseElements = {
            loadingScreen: document.querySelector('.loading-screen'),
            neuralBackground: document.querySelector('#neural-background'),
            particleCanvas: document.querySelector('#particle-canvas'),
            threeCanvas: document.querySelector('canvas'),
            gsapElements: document.querySelectorAll('[data-gsap]')
        };

        // Analyze existing structure
        const hasWorker1Base = baseElements.loadingScreen || 
                              baseElements.neuralBackground || 
                              baseElements.threeCanvas;

        if (hasWorker1Base) {
            console.log('🔍 Worker1 base system detected');
            this.worker1Base = {
                elements: baseElements,
                threejs: window.THREE,
                gsap: window.gsap,
                tensorflow: window.tf
            };
        } else {
            console.log('⚠️ Worker1 base system not found - creating compatibility layer');
            await this.createCompatibilityLayer();
        }
    }

    async createCompatibilityLayer() {
        // Create basic structure for Worker2 to integrate with
        const compatibilityHTML = `
            <div id="worker1-compat" style="display: none;">
                <canvas id="base-canvas"></canvas>
                <div id="neural-background"></div>
                <div id="particle-canvas"></div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', compatibilityHTML);
        
        // Mock Worker1 functionality
        this.worker1Base = {
            elements: {
                neuralBackground: document.getElementById('neural-background'),
                particleCanvas: document.getElementById('particle-canvas'),
                threeCanvas: document.getElementById('base-canvas')
            },
            threejs: window.THREE,
            gsap: window.gsap,
            tensorflow: window.tf
        };
    }

    async initializeWorker2Enhanced() {
        console.log('🚀 Initializing Worker2 Enhanced System...');
        
        // Import Worker2's enhanced system
        if (window.EnhancedInteractionSystem) {
            this.worker2Enhanced = new window.EnhancedInteractionSystem.EnhancedInteractionManager();
            await this.worker2Enhanced.initialize();
        } else {
            throw new Error('Worker2 Enhanced System not available');
        }
    }

    createIntegration() {
        console.log('🔧 Creating seamless integration...');
        
        // Integrate Eye Tracking with existing elements
        this.integrateEyeTracking();
        
        // Enhance existing animations with mouse prediction
        this.integrateMousePrediction();
        
        // Apply emotional theming to existing elements
        this.integrateEmotionalTheming();
        
        // Add quantum particles to existing particle systems
        this.integrateQuantumParticles();
        
        // Sync performance monitoring
        this.integratePerformanceSync();
    }

    integrateEyeTracking() {
        if (this.worker2Enhanced.eyeTracking) {
            // Add gaze-interactive class to existing interactive elements
            const existingInteractives = document.querySelectorAll('button, a, .interactive, .clickable');
            existingInteractives.forEach(element => {
                element.classList.add('gaze-interactive');
            });

            // Integrate with existing navigation
            const navElements = document.querySelectorAll('nav a, .nav-item');
            navElements.forEach(element => {
                element.classList.add('gaze-interactive');
            });

            console.log('👁️ Eye tracking integrated with existing elements');
        }
    }

    integrateMousePrediction() {
        if (this.worker2Enhanced.mousePrediction) {
            // Add predictive-hover class to hoverable elements
            const hoverElements = document.querySelectorAll('button, a, .card, .feature');
            hoverElements.forEach(element => {
                element.classList.add('predictive-hover');
            });

            // Enhance existing GSAP animations with prediction
            if (window.gsap) {
                const gsapElements = document.querySelectorAll('[data-gsap]');
                gsapElements.forEach(element => {
                    element.classList.add('predictive-hover');
                });
            }

            console.log('🎯 Mouse prediction integrated with existing hover effects');
        }
    }

    integrateEmotionalTheming() {
        if (this.worker2Enhanced.emotionColor) {
            // Apply emotional theming to existing color schemes
            const themeableElements = document.querySelectorAll('.hero, .feature, .section');
            themeableElements.forEach(element => {
                element.classList.add('emotional-element');
            });

            // Integrate with existing CSS custom properties
            this.syncExistingColors();

            console.log('🎨 Emotional theming integrated with existing design');
        }
    }

    integrateQuantumParticles() {
        if (this.worker2Enhanced.quantumParticles) {
            // Check if Worker1 already has particle systems
            const existingCanvas = this.worker1Base.elements.particleCanvas || 
                                 this.worker1Base.elements.threeCanvas;

            if (existingCanvas) {
                // Enhance existing particle system
                this.enhanceExistingParticles(existingCanvas);
            }

            // Add quantum field to background
            document.body.classList.add('quantum-field');

            console.log('⚛️ Quantum particles integrated with existing particle systems');
        }
    }

    enhanceExistingParticles(canvas) {
        // Add quantum behaviors to existing particles
        const quantumEnhancer = {
            addUncertainty: (particles) => {
                particles.forEach(particle => {
                    particle.uncertainty = Math.random() * 5;
                    particle.quantumState = Math.random() > 0.5 ? 'up' : 'down';
                });
            },
            
            addEntanglement: (particles) => {
                for (let i = 0; i < particles.length; i += 2) {
                    if (i + 1 < particles.length) {
                        particles[i].entangledWith = particles[i + 1];
                        particles[i + 1].entangledWith = particles[i];
                    }
                }
            }
        };

        // Apply quantum enhancements
        canvas.quantumEnhancer = quantumEnhancer;
    }

    integratePerformanceSync() {
        // Sync performance monitoring between systems
        const performanceSync = {
            fps: 0,
            memory: 0,
            quality: 'auto'
        };

        // Listen for performance events from both systems
        document.addEventListener('performanceUpdate', (e) => {
            performanceSync.fps = e.detail.fps;
            performanceSync.memory = e.detail.memory;
            
            // Adjust quality based on performance
            this.adjustIntegratedQuality(performanceSync);
        });

        console.log('📊 Performance monitoring synchronized');
    }

    syncExistingColors() {
        // Map existing CSS custom properties to emotional colors
        const existingProps = [
            '--primary-color',
            '--accent-color',
            '--background-color',
            '--text-color'
        ];

        // Create mapping function
        const colorMapper = (emotion) => {
            const emotionColors = {
                joy: { primary: '#FFD700', accent: '#FFA500' },
                trust: { primary: '#4169E1', accent: '#1E90FF' },
                anticipation: { primary: '#FF4500', accent: '#FF6347' },
                surprise: { primary: '#DA70D6', accent: '#BA55D3' }
            };

            return emotionColors[emotion] || emotionColors.trust;
        };

        // Listen for emotion changes
        document.addEventListener('emotionChange', (e) => {
            const colors = colorMapper(e.detail.emotion);
            const root = document.documentElement.style;
            
            existingProps.forEach(prop => {
                if (prop.includes('primary')) {
                    root.setProperty(prop, colors.primary);
                } else if (prop.includes('accent')) {
                    root.setProperty(prop, colors.accent);
                }
            });
        });
    }

    adjustIntegratedQuality(performance) {
        if (performance.fps < 30 || performance.memory > 100) {
            // Reduce quality on both systems
            document.dispatchEvent(new CustomEvent('reduceQuality', {
                detail: { 
                    particleCount: 50, 
                    animationSpeed: 0.5,
                    effects: 'minimal'
                }
            }));
        } else if (performance.fps > 50 && performance.memory < 50) {
            // Increase quality on both systems
            document.dispatchEvent(new CustomEvent('enhanceQuality', {
                detail: { 
                    particleCount: 300, 
                    animationSpeed: 1.5,
                    effects: 'full'
                }
            }));
        }
    }

    fallbackMode() {
        console.log('🔄 Entering fallback compatibility mode...');
        
        // Provide basic functionality without full integration
        this.compatibilityMode = 'fallback';
        
        // Initialize Worker2 systems independently
        if (window.EnhancedInteractionSystem) {
            this.worker2Enhanced = new window.EnhancedInteractionSystem.EnhancedInteractionManager();
            this.worker2Enhanced.initialize().catch(error => {
                console.error('Fallback initialization failed:', error);
            });
        }
    }

    // Public API for external control
    getIntegrationStatus() {
        return {
            isIntegrated: this.isIntegrated,
            worker1Detected: !!this.worker1Base,
            worker2Active: !!this.worker2Enhanced,
            compatibilityMode: this.compatibilityMode
        };
    }

    toggleSystem(systemName, enabled) {
        switch (systemName) {
            case 'eyeTracking':
                if (this.worker2Enhanced.eyeTracking) {
                    // Toggle eye tracking
                    enabled ? this.worker2Enhanced.eyeTracking.initialize() : 
                             this.worker2Enhanced.eyeTracking.disable();
                }
                break;
                
            case 'mousePrediction':
                if (this.worker2Enhanced.mousePrediction) {
                    // Toggle mouse prediction
                    enabled ? this.worker2Enhanced.mousePrediction.initialize() : 
                             this.worker2Enhanced.mousePrediction.disable();
                }
                break;
                
            case 'emotionColor':
                if (this.worker2Enhanced.emotionColor) {
                    // Toggle emotion detection
                    enabled ? this.worker2Enhanced.emotionColor.initialize() : 
                             this.worker2Enhanced.emotionColor.disable();
                }
                break;
                
            case 'quantumParticles':
                if (this.worker2Enhanced.quantumParticles) {
                    // Toggle quantum particles
                    const canvas = document.getElementById('quantum-particles');
                    if (canvas) {
                        canvas.style.display = enabled ? 'block' : 'none';
                    }
                }
                break;
        }
    }

    updateConfiguration(config) {
        // Update system configuration
        if (config.performance) {
            this.adjustIntegratedQuality({ 
                fps: config.performance.targetFPS || 60,
                memory: config.performance.maxMemory || 100
            });
        }

        if (config.features) {
            Object.entries(config.features).forEach(([feature, enabled]) => {
                this.toggleSystem(feature, enabled);
            });
        }
    }
}

// Auto-initialize integration bridge
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for both systems to be available
    const waitForSystems = () => {
        return new Promise((resolve) => {
            const checkSystems = () => {
                if (window.EnhancedInteractionSystem) {
                    resolve();
                } else {
                    setTimeout(checkSystems, 100);
                }
            };
            checkSystems();
        });
    };

    await waitForSystems();
    
    // Initialize integration bridge
    window.integrationBridge = new IntegrationBridge();
    await window.integrationBridge.initialize();
    
    // Expose integration status for debugging
    if (window.location.hash === '#debug') {
        console.log('🔍 Integration Status:', window.integrationBridge.getIntegrationStatus());
    }
});

// Export for manual control
window.IntegrationBridge = IntegrationBridge;