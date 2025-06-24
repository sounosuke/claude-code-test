// Zero Latency Interaction System
class ZeroLatencyInteraction {
  constructor() {
    this.eyeTracker = null;
    this.mousePredictor = null;
    this.interactionQueue = [];
    this.preloadedActions = new Map();
    this.kalmanFilter = null;
  }

  async initialize() {
    // Initialize eye tracking
    await this.initializeEyeTracking();
    
    // Initialize mouse trajectory prediction
    this.initializeMousePrediction();
    
    // Setup speculation rules
    this.setupSpeculationRules();
    
    // Initialize Web Workers pool
    this.initializeWorkerPool();
  }

  async initializeEyeTracking() {
    // Initialize WebGazer for eye tracking
    if (typeof webgazer !== 'undefined') {
      this.eyeTracker = await webgazer
        .setRegression('ridge')
        .setGazeListener((data, timestamp) => {
          if (data) {
            this.processGazeData(data, timestamp);
          }
        })
        .begin();
      
      // Improve accuracy with calibration
      webgazer.showPredictionPoints(false);
    }
  }

  initializeMousePrediction() {
    // Kalman filter for mouse trajectory prediction
    this.kalmanFilter = new KalmanFilter({
      observation: 2,
      state: 4, // x, y, vx, vy
      transition: [
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ],
      observation_model: [
        [1, 0, 0, 0],
        [0, 1, 0, 0]
      ],
      noise: {
        process: 0.01,
        measurement: 0.1
      }
    });
    
    this.mouseHistory = [];
    this.setupMouseTracking();
  }

  setupMouseTracking() {
    let lastTime = Date.now();
    
    document.addEventListener('mousemove', (e) => {
      const currentTime = Date.now();
      const dt = (currentTime - lastTime) / 1000;
      
      this.mouseHistory.push({
        x: e.clientX,
        y: e.clientY,
        time: currentTime,
        dt: dt
      });
      
      // Keep only last 50 points
      if (this.mouseHistory.length > 50) {
        this.mouseHistory.shift();
      }
      
      // Predict future position
      this.predictMouseTarget();
      
      lastTime = currentTime;
    }, { passive: true });
  }

  predictMouseTarget() {
    if (this.mouseHistory.length < 5) return;
    
    const recent = this.mouseHistory.slice(-5);
    const currentPos = recent[recent.length - 1];
    
    // Calculate velocity
    const velocity = {
      x: (recent[4].x - recent[0].x) / (recent[4].time - recent[0].time) * 1000,
      y: (recent[4].y - recent[0].y) / (recent[4].time - recent[0].time) * 1000
    };
    
    // Update Kalman filter
    this.kalmanFilter.update([currentPos.x, currentPos.y]);
    
    // Predict 200ms into future
    const prediction = this.kalmanFilter.predict();
    const futureX = prediction[0] + velocity.x * 0.2;
    const futureY = prediction[1] + velocity.y * 0.2;
    
    // Find potential targets
    const potentialTargets = this.findInteractableElements(futureX, futureY);
    
    // Preload actions for likely targets
    potentialTargets.forEach(target => {
      this.preloadAction(target);
    });
  }

  processGazeData(gazeData, timestamp) {
    // Combine gaze data with mouse prediction
    const gazePoint = {
      x: gazeData.x,
      y: gazeData.y,
      confidence: this.calculateGazeConfidence(gazeData)
    };
    
    // Find elements user is looking at
    const gazedElements = this.findInteractableElements(gazePoint.x, gazePoint.y);
    
    // Increase preload priority for gazed elements
    gazedElements.forEach(element => {
      if (gazePoint.confidence > 0.7) {
        this.preloadAction(element, 'high');
      }
    });
  }

  findInteractableElements(x, y, radius = 100) {
    const elements = [];
    const interactables = document.querySelectorAll('a, button, [data-interactive]');
    
    interactables.forEach(element => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      if (distance < radius) {
        elements.push({
          element,
          distance,
          probability: 1 - (distance / radius)
        });
      }
    });
    
    return elements
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);
  }

  async preloadAction(target, priority = 'medium') {
    const element = target.element;
    const actionId = this.getElementActionId(element);
    
    if (this.preloadedActions.has(actionId)) {
      return;
    }
    
    // Mark as being preloaded
    this.preloadedActions.set(actionId, { status: 'loading' });
    
    // Different preload strategies based on element type
    if (element.tagName === 'A' && element.href) {
      await this.preloadLink(element, priority);
    } else if (element.dataset.api) {
      await this.preloadAPICall(element, priority);
    } else if (element.dataset.component) {
      await this.preloadComponent(element, priority);
    }
  }

  async preloadLink(link, priority) {
    // Use Speculation Rules API for instant navigation
    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify({
      prerender: [{
        source: 'list',
        urls: [link.href],
        eagerness: priority === 'high' ? 'eager' : 'moderate'
      }]
    });
    document.head.appendChild(script);
    
    // Also prefetch resources
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = link.href;
    prefetchLink.as = 'document';
    document.head.appendChild(prefetchLink);
  }

  async preloadAPICall(element, priority) {
    const apiUrl = element.dataset.api;
    const method = element.dataset.method || 'GET';
    
    // Execute API call in Web Worker
    const worker = this.getWorkerFromPool();
    
    worker.postMessage({
      type: 'prefetch-api',
      url: apiUrl,
      method: method,
      priority: priority
    });
    
    // Store promise for later use
    const responsePromise = new Promise((resolve) => {
      worker.onmessage = (e) => {
        if (e.data.type === 'api-response' && e.data.url === apiUrl) {
          resolve(e.data.response);
        }
      };
    });
    
    this.preloadedActions.set(this.getElementActionId(element), {
      status: 'ready',
      data: responsePromise
    });
  }

  async preloadComponent(element, priority) {
    const componentName = element.dataset.component;
    
    // Dynamic import with high priority
    if (priority === 'high') {
      const module = await import(`/components/${componentName}.js`);
      
      // Pre-instantiate component
      const instance = new module.default();
      
      this.preloadedActions.set(this.getElementActionId(element), {
        status: 'ready',
        component: instance
      });
    } else {
      // Low priority: just prefetch
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = `/components/${componentName}.js`;
      document.head.appendChild(link);
    }
  }

  setupSpeculationRules() {
    // Global speculation rules for common patterns
    const rules = {
      prefetch: [
        {
          source: 'document',
          where: {
            selector_matches: 'a[href^="/"]',
            not: {
              selector_matches: 'a[data-no-prefetch]'
            }
          },
          eagerness: 'moderate'
        }
      ],
      prerender: [
        {
          source: 'document',
          where: {
            selector_matches: 'a[data-instant]'
          },
          eagerness: 'eager'
        }
      ]
    };
    
    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify(rules);
    document.head.appendChild(script);
  }

  initializeWorkerPool() {
    this.workerPool = [];
    const poolSize = navigator.hardwareConcurrency || 4;
    
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker('/workers/prefetch-worker.js');
      this.workerPool.push({
        worker,
        busy: false
      });
    }
  }

  getWorkerFromPool() {
    // Find available worker or use round-robin
    let worker = this.workerPool.find(w => !w.busy);
    
    if (!worker) {
      worker = this.workerPool[Math.floor(Math.random() * this.workerPool.length)];
    }
    
    return worker.worker;
  }

  getElementActionId(element) {
    return element.dataset.actionId || 
           element.id || 
           `${element.tagName}-${element.className}-${element.textContent.slice(0, 20)}`;
  }

  calculateGazeConfidence(gazeData) {
    // Simple confidence calculation based on gaze stability
    if (!this.gazeHistory) this.gazeHistory = [];
    
    this.gazeHistory.push(gazeData);
    if (this.gazeHistory.length > 10) {
      this.gazeHistory.shift();
    }
    
    if (this.gazeHistory.length < 5) return 0;
    
    // Calculate variance
    const avgX = this.gazeHistory.reduce((sum, g) => sum + g.x, 0) / this.gazeHistory.length;
    const avgY = this.gazeHistory.reduce((sum, g) => sum + g.y, 0) / this.gazeHistory.length;
    
    const variance = this.gazeHistory.reduce((sum, g) => {
      return sum + Math.pow(g.x - avgX, 2) + Math.pow(g.y - avgY, 2);
    }, 0) / this.gazeHistory.length;
    
    // Lower variance = higher confidence
    return Math.max(0, Math.min(1, 1 - (variance / 1000)));
  }

  // Handle actual clicks with zero latency
  attachClickHandlers() {
    document.addEventListener('click', async (e) => {
      const target = e.target.closest('a, button, [data-interactive]');
      if (!target) return;
      
      const actionId = this.getElementActionId(target);
      const preloaded = this.preloadedActions.get(actionId);
      
      if (preloaded && preloaded.status === 'ready') {
        e.preventDefault();
        
        // Use preloaded data immediately
        if (preloaded.data) {
          // API response ready
          const response = await preloaded.data;
          this.handleInstantResponse(response, target);
        } else if (preloaded.component) {
          // Component ready
          preloaded.component.mount(target);
        }
      }
    }, true);
  }

  handleInstantResponse(response, element) {
    // Instant UI update with preloaded data
    const event = new CustomEvent('instant-response', {
      detail: { response, element }
    });
    document.dispatchEvent(event);
  }
}

// Kalman Filter implementation
class KalmanFilter {
  constructor(options) {
    this.state_dim = options.state;
    this.obs_dim = options.observation;
    
    this.F = math.matrix(options.transition); // State transition
    this.H = math.matrix(options.observation_model); // Observation model
    this.Q = math.multiply(options.noise.process, math.identity(this.state_dim)); // Process noise
    this.R = math.multiply(options.noise.measurement, math.identity(this.obs_dim)); // Measurement noise
    
    // Initialize state
    this.x = math.zeros(this.state_dim);
    this.P = math.identity(this.state_dim);
  }

  predict() {
    // Predict next state
    this.x = math.multiply(this.F, this.x);
    this.P = math.add(
      math.multiply(math.multiply(this.F, this.P), math.transpose(this.F)),
      this.Q
    );
    
    return this.x.toArray();
  }

  update(measurement) {
    const z = math.matrix(measurement);
    
    // Innovation
    const y = math.subtract(z, math.multiply(this.H, this.x));
    
    // Innovation covariance
    const S = math.add(
      math.multiply(math.multiply(this.H, this.P), math.transpose(this.H)),
      this.R
    );
    
    // Kalman gain
    const K = math.multiply(
      math.multiply(this.P, math.transpose(this.H)),
      math.inv(S)
    );
    
    // Update state
    this.x = math.add(this.x, math.multiply(K, y));
    
    // Update covariance
    const I = math.identity(this.state_dim);
    this.P = math.multiply(
      math.subtract(I, math.multiply(K, this.H)),
      this.P
    );
  }
}

// Initialize zero latency system
const zeroLatency = new ZeroLatencyInteraction();
zeroLatency.initialize();
zeroLatency.attachClickHandlers();