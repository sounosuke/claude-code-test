// Complete AI-Driven Progressive Rendering System
class AIProgressiveRenderer {
  constructor() {
    this.model = null;
    this.userBehaviorData = [];
    this.renderQueue = new Map();
    this.renderingState = new Map();
    this.performanceMetrics = {
      predictionAccuracy: 0,
      renderingSpeed: 0,
      cacheHitRate: 0,
      userSatisfaction: 0
    };
    this.isInitialized = false;
    this.worker = null;
    this.intersectionObserver = null;
    this.mutationObserver = null;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize AI model
      await this.initializeAIModel();
      
      // Setup rendering infrastructure
      await this.setupRenderingInfrastructure();
      
      // Initialize user behavior tracking
      this.initializeBehaviorTracking();
      
      // Setup performance monitoring
      this.initializePerformanceMonitoring();
      
      // Initialize service worker integration
      await this.initializeServiceWorkerIntegration();
      
      this.isInitialized = true;
      console.log('AI Progressive Renderer initialized successfully');
      
    } catch (error) {
      console.error('AI Progressive Renderer initialization failed:', error);
      throw error;
    }
  }

  async initializeAIModel() {
    // Wait for TensorFlow optimizer to be ready
    if (window.tfOptimizer && !window.tfOptimizer.isLoaded) {
      await window.tfOptimizer.initialize();
    }

    // Create lightweight behavior prediction model
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [15], // Extended feature set
          units: 32,
          activation: 'relu',
          kernelInitializer: 'heNormal',
          useBias: true
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 8,
          activation: 'softmax' // 8 different behavior categories
        })
      ]
    });

    // Compile with optimized settings
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    console.log('AI behavior prediction model created');
  }

  async setupRenderingInfrastructure() {
    // Create dedicated rendering worker
    const workerCode = `
      class RenderingWorker {
        constructor() {
          this.renderQueue = [];
          this.cache = new Map();
        }
        
        async processRenderTask(task) {
          const startTime = performance.now();
          
          try {
            switch (task.type) {
              case 'prerender-component':
                return await this.prerenderComponent(task);
              case 'preload-assets':
                return await this.preloadAssets(task);
              case 'optimize-images':
                return await this.optimizeImages(task);
              default:
                throw new Error('Unknown task type: ' + task.type);
            }
          } catch (error) {
            return { error: error.message, taskId: task.id };
          } finally {
            const duration = performance.now() - startTime;
            self.postMessage({
              type: 'performance-metric',
              data: { taskId: task.id, duration }
            });
          }
        }
        
        async prerenderComponent(task) {
          // Simulate component pre-rendering
          const { component, props, priority } = task.data;
          
          // Create virtual DOM structure
          const vdom = this.createVirtualDOM(component, props);
          
          // Cache the result
          this.cache.set(task.id, {
            vdom,
            timestamp: Date.now(),
            priority
          });
          
          return { success: true, taskId: task.id, cached: true };
        }
        
        async preloadAssets(task) {
          const { assets } = task.data;
          const results = [];
          
          for (const asset of assets) {
            try {
              const response = await fetch(asset.url, {
                priority: asset.priority || 'low',
                mode: 'cors'
              });
              
              if (response.ok) {
                const blob = await response.blob();
                this.cache.set(asset.url, {
                  data: blob,
                  timestamp: Date.now(),
                  type: asset.type
                });
                results.push({ url: asset.url, success: true });
              }
            } catch (error) {
              results.push({ url: asset.url, success: false, error: error.message });
            }
          }
          
          return { results, taskId: task.id };
        }
        
        createVirtualDOM(component, props) {
          // Simplified VDOM creation
          return {
            type: component,
            props: props || {},
            children: [],
            key: Math.random().toString(36)
          };
        }
      }
      
      const worker = new RenderingWorker();
      
      self.onmessage = async function(e) {
        const { type, data } = e.data;
        
        switch (type) {
          case 'render-task':
            const result = await worker.processRenderTask(data);
            self.postMessage({ type: 'task-result', data: result });
            break;
          case 'get-cache':
            const cached = worker.cache.get(data.key);
            self.postMessage({ type: 'cache-result', data: cached || null });
            break;
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
    
    this.worker.onmessage = (e) => this.handleWorkerMessage(e);
  }

  handleWorkerMessage(event) {
    const { type, data } = event.data;
    
    switch (type) {
      case 'task-result':
        this.handleTaskResult(data);
        break;
      case 'performance-metric':
        this.updatePerformanceMetrics(data);
        break;
      case 'cache-result':
        this.handleCacheResult(data);
        break;
    }
  }

  initializeBehaviorTracking() {
    // Enhanced user behavior tracking
    const trackingEvents = [
      'click', 'mousemove', 'scroll', 'keydown', 'focus', 'blur',
      'touchstart', 'touchmove', 'touchend', 'resize'
    ];

    trackingEvents.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        this.trackUserBehavior(e);
      }, { passive: true, capture: true });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackBehaviorEvent('visibility', {
        hidden: document.hidden,
        timestamp: Date.now()
      });
    });

    // Track network status
    window.addEventListener('online', () => {
      this.trackBehaviorEvent('network', { status: 'online' });
    });

    window.addEventListener('offline', () => {
      this.trackBehaviorEvent('network', { status: 'offline' });
    });

    // Setup intersection observer for element visibility
    this.intersectionObserver = new IntersectionObserver(
      (entries) => this.handleIntersectionChanges(entries),
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '50px'
      }
    );

    // Observe all interactive elements
    document.querySelectorAll('a, button, [data-interactive], [data-component]')
      .forEach(el => this.intersectionObserver.observe(el));

    // Setup mutation observer for dynamic content
    this.mutationObserver = new MutationObserver(
      (mutations) => this.handleDOMMutations(mutations)
    );

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-component', 'data-interactive']
    });
  }

  trackUserBehavior(event) {
    const behaviorData = {
      type: event.type,
      timestamp: Date.now(),
      target: {
        tagName: event.target.tagName,
        id: event.target.id,
        className: event.target.className,
        dataset: { ...event.target.dataset }
      },
      coordinates: event.clientX !== undefined ? {
        x: event.clientX,
        y: event.clientY
      } : null,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      },
      device: {
        pixelRatio: window.devicePixelRatio,
        orientation: screen.orientation?.angle || 0,
        touchPoints: event.touches?.length || 0
      },
      performance: {
        memory: performance.memory ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize
        } : null,
        timing: performance.now()
      }
    };

    this.addBehaviorData(behaviorData);
  }

  trackBehaviorEvent(type, data) {
    this.addBehaviorData({
      type,
      timestamp: Date.now(),
      data,
      source: 'system'
    });
  }

  addBehaviorData(data) {
    this.userBehaviorData.push(data);
    
    // Keep only recent data (last 200 interactions)
    if (this.userBehaviorData.length > 200) {
      this.userBehaviorData.shift();
    }

    // Trigger prediction if we have enough data
    if (this.userBehaviorData.length >= 20) {
      this.scheduleNextPrediction();
    }
  }

  scheduleNextPrediction() {
    // Debounce predictions
    if (this.predictionTimeout) {
      clearTimeout(this.predictionTimeout);
    }

    this.predictionTimeout = setTimeout(() => {
      this.predictNextBehavior();
    }, 100);
  }

  async predictNextBehavior() {
    if (!this.model || this.userBehaviorData.length < 20) return;

    try {
      const features = this.extractAdvancedFeatures(this.userBehaviorData.slice(-20));
      const prediction = await this.model.predict(tf.tensor2d([features])).data();
      
      // Get top predictions
      const predictions = Array.from(prediction)
        .map((prob, index) => ({ behavior: index, probability: prob }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 3);

      // Execute prerendering based on predictions
      await this.executePredictiveRendering(predictions);
      
      // Update accuracy metrics
      this.updatePredictionAccuracy(predictions);

    } catch (error) {
      console.warn('Behavior prediction failed:', error);
    }
  }

  extractAdvancedFeatures(data) {
    const recent = data.slice(-10);
    const timeWindow = 5000; // 5 seconds
    const currentTime = Date.now();
    
    // Basic interaction features
    const scrollVelocity = this.calculateScrollVelocity(recent);
    const clickFrequency = this.calculateClickFrequency(recent, timeWindow);
    const mouseMovement = this.calculateMouseMovement(recent);
    const dwellTime = this.calculateDwellTime(recent);
    const interactionDiversity = this.calculateInteractionDiversity(recent);
    
    // Advanced behavioral features
    const engagementScore = this.calculateEngagementScore(recent);
    const navigationPattern = this.calculateNavigationPattern(recent);
    const attentionSpan = this.calculateAttentionSpan(data);
    const deviceUsagePattern = this.calculateDeviceUsage(recent);
    const timeOfDay = this.normalizeTimeOfDay();
    
    // Performance context features
    const performanceContext = this.getPerformanceContext();
    const networkCondition = this.estimateNetworkCondition();
    const deviceCapability = this.estimateDeviceCapability();
    
    // Normalize all features to [0, 1]
    return [
      Math.min(scrollVelocity / 2000, 1),
      Math.min(clickFrequency / 5, 1),
      Math.min(mouseMovement / 50000, 1),
      Math.min(dwellTime / 10000, 1),
      Math.min(interactionDiversity / 10, 1),
      Math.min(engagementScore, 1),
      Math.min(navigationPattern, 1),
      Math.min(attentionSpan / 30000, 1),
      Math.min(deviceUsagePattern, 1),
      timeOfDay,
      Math.min(performanceContext / 100, 1),
      Math.min(networkCondition, 1),
      Math.min(deviceCapability, 1),
      Math.random(), // Random factor for exploration
      Math.min(this.getSeasonalityFactor(), 1)
    ];
  }

  calculateScrollVelocity(data) {
    const scrollEvents = data.filter(d => d.type === 'scroll');
    if (scrollEvents.length < 2) return 0;
    
    let totalVelocity = 0;
    for (let i = 1; i < scrollEvents.length; i++) {
      const prev = scrollEvents[i - 1];
      const curr = scrollEvents[i];
      const timeDiff = curr.timestamp - prev.timestamp;
      const scrollDiff = Math.abs(curr.viewport.scrollY - prev.viewport.scrollY);
      
      if (timeDiff > 0) {
        totalVelocity += scrollDiff / timeDiff * 1000; // pixels per second
      }
    }
    
    return scrollEvents.length > 1 ? totalVelocity / (scrollEvents.length - 1) : 0;
  }

  calculateClickFrequency(data, timeWindow) {
    const currentTime = Date.now();
    const recentClicks = data.filter(d => 
      d.type === 'click' && (currentTime - d.timestamp) <= timeWindow
    );
    
    return recentClicks.length / (timeWindow / 1000); // clicks per second
  }

  calculateMouseMovement(data) {
    const mouseEvents = data.filter(d => d.coordinates && d.type === 'mousemove');
    if (mouseEvents.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < mouseEvents.length; i++) {
      const prev = mouseEvents[i - 1];
      const curr = mouseEvents[i];
      
      const distance = Math.sqrt(
        Math.pow(curr.coordinates.x - prev.coordinates.x, 2) +
        Math.pow(curr.coordinates.y - prev.coordinates.y, 2)
      );
      
      totalDistance += distance;
    }
    
    const timeSpan = mouseEvents[mouseEvents.length - 1].timestamp - mouseEvents[0].timestamp;
    return timeSpan > 0 ? totalDistance / timeSpan * 1000 : 0; // pixels per second
  }

  calculateDwellTime(data) {
    // Calculate average time spent on each element
    const elementTimes = new Map();
    let currentElement = null;
    let startTime = null;
    
    for (const event of data) {
      const elementKey = `${event.target.tagName}:${event.target.id}:${event.target.className}`;
      
      if (event.type === 'focus' || event.type === 'mouseover') {
        currentElement = elementKey;
        startTime = event.timestamp;
      } else if (event.type === 'blur' || event.type === 'mouseout') {
        if (currentElement === elementKey && startTime) {
          const dwellTime = event.timestamp - startTime;
          elementTimes.set(currentElement, (elementTimes.get(currentElement) || 0) + dwellTime);
        }
        currentElement = null;
        startTime = null;
      }
    }
    
    const times = Array.from(elementTimes.values());
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  calculateInteractionDiversity(data) {
    const interactionTypes = new Set();
    const targetTypes = new Set();
    
    data.forEach(event => {
      interactionTypes.add(event.type);
      targetTypes.add(event.target.tagName);
    });
    
    return interactionTypes.size + targetTypes.size;
  }

  calculateEngagementScore(data) {
    let score = 0;
    const weights = {
      click: 1.0,
      scroll: 0.3,
      mousemove: 0.1,
      keydown: 0.8,
      focus: 0.6,
      touchstart: 0.9
    };
    
    data.forEach(event => {
      score += weights[event.type] || 0;
    });
    
    return Math.min(score / data.length, 1);
  }

  calculateNavigationPattern(data) {
    // Analyze navigation sequence to predict next likely page
    const navigationEvents = data.filter(d => 
      d.type === 'click' && d.target.tagName === 'A'
    );
    
    if (navigationEvents.length < 2) return 0;
    
    // Simple pattern recognition based on URL patterns
    const patterns = navigationEvents.map(event => {
      const href = event.target.dataset.href || '';
      return href.split('/').filter(part => part.length > 0);
    });
    
    // Calculate pattern similarity
    let similarity = 0;
    for (let i = 1; i < patterns.length; i++) {
      const prev = patterns[i - 1];
      const curr = patterns[i];
      const commonParts = prev.filter(part => curr.includes(part));
      similarity += commonParts.length / Math.max(prev.length, curr.length);
    }
    
    return patterns.length > 1 ? similarity / (patterns.length - 1) : 0;
  }

  calculateAttentionSpan(data) {
    // Calculate how long user stays focused on the page
    const visibilityEvents = data.filter(d => d.type === 'visibility');
    if (visibilityEvents.length === 0) return data.length > 0 ? 
      Date.now() - data[0].timestamp : 0;
    
    let totalVisibleTime = 0;
    let lastVisibleTime = null;
    
    visibilityEvents.forEach(event => {
      if (event.data.hidden === false) {
        lastVisibleTime = event.timestamp;
      } else if (lastVisibleTime) {
        totalVisibleTime += event.timestamp - lastVisibleTime;
        lastVisibleTime = null;
      }
    });
    
    // Add current session if still visible
    if (!document.hidden && lastVisibleTime) {
      totalVisibleTime += Date.now() - lastVisibleTime;
    }
    
    return totalVisibleTime;
  }

  calculateDeviceUsage(data) {
    const touchEvents = data.filter(d => d.device.touchPoints > 0);
    const mouseEvents = data.filter(d => d.coordinates && d.device.touchPoints === 0);
    
    if (touchEvents.length + mouseEvents.length === 0) return 0.5;
    
    // Return ratio of touch to total interactions
    return touchEvents.length / (touchEvents.length + mouseEvents.length);
  }

  normalizeTimeOfDay() {
    const hour = new Date().getHours();
    return hour / 24; // Normalize to [0, 1]
  }

  getPerformanceContext() {
    if (!performance.memory) return 50; // Default score
    
    const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
    return (1 - memoryUsage) * 100; // Higher score for better performance
  }

  estimateNetworkCondition() {
    if (navigator.connection) {
      const connection = navigator.connection;
      const effectiveType = connection.effectiveType;
      
      const typeScores = {
        'slow-2g': 0.1,
        '2g': 0.25,
        '3g': 0.5,
        '4g': 1.0
      };
      
      return typeScores[effectiveType] || 0.5;
    }
    
    return 0.7; // Assume good connection by default
  }

  estimateDeviceCapability() {
    const cores = navigator.hardwareConcurrency || 4;
    const pixelRatio = window.devicePixelRatio || 1;
    const memoryGB = navigator.deviceMemory || 4;
    
    // Normalize based on typical device ranges
    const coreScore = Math.min(cores / 8, 1);
    const pixelScore = Math.min(pixelRatio / 3, 1);
    const memoryScore = Math.min(memoryGB / 8, 1);
    
    return (coreScore + pixelScore + memoryScore) / 3;
  }

  getSeasonalityFactor() {
    // Simple seasonality based on hour and day of week
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Peak hours adjustment
    let factor = 0.5;
    if (hour >= 9 && hour <= 17) factor += 0.3; // Business hours
    if (hour >= 19 && hour <= 22) factor += 0.2; // Evening
    if (dayOfWeek >= 1 && dayOfWeek <= 5) factor += 0.1; // Weekdays
    
    return Math.min(factor, 1);
  }

  async executePredictiveRendering(predictions) {
    for (const prediction of predictions) {
      if (prediction.probability > 0.6) {
        await this.prerenderForBehavior(prediction.behavior, prediction.probability);
      }
    }
  }

  async prerenderForBehavior(behaviorType, confidence) {
    const behaviorActions = {
      0: () => this.prerenderNavigation(confidence),
      1: () => this.prerenderSearch(confidence),
      2: () => this.prerenderDetails(confidence),
      3: () => this.prerenderContact(confidence),
      4: () => this.prerenderMedia(confidence),
      5: () => this.prerenderForm(confidence),
      6: () => this.prerenderSocial(confidence),
      7: () => this.prerenderExit(confidence)
    };

    const action = behaviorActions[behaviorType];
    if (action) {
      await action();
    }
  }

  async prerenderNavigation(confidence) {
    // Prerender likely navigation targets
    const navLinks = document.querySelectorAll('nav a, .menu a, [data-nav]');
    const highPriorityLinks = Array.from(navLinks)
      .filter(link => this.calculateLinkPriority(link) > 0.7)
      .slice(0, 3);

    for (const link of highPriorityLinks) {
      await this.prerenderPage(link.href, 'navigation', confidence);
    }
  }

  async prerenderSearch(confidence) {
    // Preload search functionality
    const searchElements = document.querySelectorAll('[data-search], .search-input, #search');
    
    if (searchElements.length > 0) {
      await this.preloadAssets([
        { url: '/js/search.js', type: 'script', priority: 'high' },
        { url: '/api/search/suggestions', type: 'data', priority: 'medium' }
      ], confidence);
    }
  }

  async prerenderDetails(confidence) {
    // Prerender detail views for visible items
    const items = document.querySelectorAll('[data-detail-url], .item-card');
    const visibleItems = Array.from(items).filter(item => this.isElementVisible(item));
    
    for (const item of visibleItems.slice(0, 2)) {
      const detailUrl = item.dataset.detailUrl;
      if (detailUrl) {
        await this.prerenderPage(detailUrl, 'detail', confidence);
      }
    }
  }

  async prerenderContact(confidence) {
    // Preload contact form and validation
    await this.preloadAssets([
      { url: '/js/form-validation.js', type: 'script', priority: 'medium' },
      { url: '/css/forms.css', type: 'style', priority: 'low' }
    ], confidence);
  }

  async prerenderMedia(confidence) {
    // Preload media content
    const mediaElements = document.querySelectorAll('img[data-src], video[data-src]');
    const priorityMedia = Array.from(mediaElements)
      .filter(el => this.isElementNearViewport(el))
      .slice(0, 5);

    for (const media of priorityMedia) {
      await this.preloadMediaAsset(media, confidence);
    }
  }

  async prerenderForm(confidence) {
    // Preload form dependencies
    const forms = document.querySelectorAll('form[data-async]');
    
    for (const form of forms) {
      if (this.isElementNearViewport(form)) {
        await this.preloadFormAssets(form, confidence);
      }
    }
  }

  async prerenderSocial(confidence) {
    // Preload social sharing functionality
    await this.preloadAssets([
      { url: '/js/social-share.js', type: 'script', priority: 'low' },
      { url: '/api/social/counts', type: 'data', priority: 'low' }
    ], confidence);
  }

  async prerenderExit(confidence) {
    // Prepare exit intent handling
    await this.preloadAssets([
      { url: '/js/exit-intent.js', type: 'script', priority: 'medium' },
      { url: '/api/exit-offers', type: 'data', priority: 'medium' }
    ], confidence);
  }

  calculateLinkPriority(link) {
    let priority = 0.5;
    
    // Check if link is in main navigation
    if (link.closest('nav, .main-menu')) priority += 0.3;
    
    // Check if link is prominent (large, centered, etc.)
    const rect = link.getBoundingClientRect();
    if (rect.width > 100 && rect.height > 30) priority += 0.2;
    
    // Check if link has been hovered recently
    if (link.dataset.recentHover) priority += 0.2;
    
    // Check URL pattern
    const href = link.href || '';
    if (href.includes('/about') || href.includes('/contact')) priority += 0.1;
    if (href.includes('/products') || href.includes('/services')) priority += 0.2;
    
    return Math.min(priority, 1);
  }

  async prerenderPage(url, type, confidence) {
    if (this.renderQueue.has(url)) return;
    
    this.renderQueue.set(url, {
      type,
      confidence,
      timestamp: Date.now(),
      status: 'queued'
    });

    try {
      // Use Speculation Rules API if available
      if ('HTMLScriptElement' in window && document.querySelector('script[type="speculationrules"]')) {
        this.addSpeculationRule(url, confidence);
      } else {
        // Fallback to prefetch
        await this.prefetchResource(url, 'document');
      }
      
      this.renderQueue.get(url).status = 'completed';
      
    } catch (error) {
      console.warn(`Failed to prerender ${url}:`, error);
      this.renderQueue.get(url).status = 'failed';
    }
  }

  addSpeculationRule(url, confidence) {
    const eagerness = confidence > 0.8 ? 'eager' : 
                      confidence > 0.6 ? 'moderate' : 'conservative';
    
    const rule = {
      prerender: [{
        source: 'list',
        urls: [url],
        eagerness: eagerness
      }]
    };

    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify(rule);
    document.head.appendChild(script);
    
    // Remove script after a timeout to avoid accumulation
    setTimeout(() => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }, 30000);
  }

  async preloadAssets(assets, confidence) {
    const taskId = Math.random().toString(36);
    
    this.worker.postMessage({
      type: 'render-task',
      data: {
        id: taskId,
        type: 'preload-assets',
        data: { assets },
        confidence
      }
    });
  }

  async preloadMediaAsset(mediaElement, confidence) {
    const src = mediaElement.dataset.src || mediaElement.src;
    if (!src) return;

    // Use quantum image optimizer if available
    if (window.quantumOptimizer && mediaElement.tagName === 'IMG') {
      try {
        const optimizedUrl = await window.quantumOptimizer.processImage(src);
        mediaElement.dataset.optimizedSrc = optimizedUrl;
      } catch (error) {
        console.warn('Image optimization failed:', error);
      }
    }

    await this.prefetchResource(src, mediaElement.tagName.toLowerCase());
  }

  async preloadFormAssets(form, confidence) {
    const assets = [];
    
    // Add form validation script
    if (form.dataset.validation) {
      assets.push({
        url: '/js/form-validation.js',
        type: 'script',
        priority: 'medium'
      });
    }
    
    // Add form submission handler
    if (form.dataset.async) {
      assets.push({
        url: '/js/async-form.js',
        type: 'script',
        priority: 'medium'
      });
    }
    
    if (assets.length > 0) {
      await this.preloadAssets(assets, confidence);
    }
  }

  async prefetchResource(url, type) {
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = type === 'script' ? 'script' :
                type === 'style' ? 'style' :
                type === 'img' ? 'image' : 'document';
      
      document.head.appendChild(link);
      
      // Remove link after timeout
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }, 60000);
      
    } catch (error) {
      console.warn(`Failed to prefetch ${url}:`, error);
    }
  }

  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0 &&
           rect.left < window.innerWidth && rect.right > 0;
  }

  isElementNearViewport(element, margin = 200) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight + margin && 
           rect.bottom > -margin &&
           rect.left < window.innerWidth + margin && 
           rect.right > -margin;
  }

  handleIntersectionChanges(entries) {
    entries.forEach(entry => {
      const element = entry.target;
      const intersectionRatio = entry.intersectionRatio;
      
      if (intersectionRatio > 0.5) {
        // Element is significantly visible
        this.trackBehaviorEvent('element-visible', {
          element: {
            tagName: element.tagName,
            id: element.id,
            className: element.className
          },
          intersectionRatio
        });
        
        // Trigger preloading for associated content
        this.triggerElementPreloading(element);
      }
    });
  }

  triggerElementPreloading(element) {
    // Preload associated content based on element type
    if (element.dataset.component) {
      this.preloadComponent(element.dataset.component);
    }
    
    if (element.dataset.api) {
      this.prefetchResource(element.dataset.api, 'fetch');
    }
    
    // Preload linked resources
    const links = element.querySelectorAll('a[href]');
    links.forEach(link => {
      if (this.calculateLinkPriority(link) > 0.7) {
        this.prefetchResource(link.href, 'document');
      }
    });
  }

  async preloadComponent(componentName) {
    const taskId = Math.random().toString(36);
    
    this.worker.postMessage({
      type: 'render-task',
      data: {
        id: taskId,
        type: 'prerender-component',
        data: {
          component: componentName,
          props: {},
          priority: 'medium'
        }
      }
    });
  }

  handleDOMMutations(mutations) {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Observe new interactive elements
            if (node.matches('a, button, [data-interactive], [data-component]')) {
              this.intersectionObserver.observe(node);
            }
            
            // Find interactive children
            const interactiveChildren = node.querySelectorAll(
              'a, button, [data-interactive], [data-component]'
            );
            interactiveChildren.forEach(child => {
              this.intersectionObserver.observe(child);
            });
          }
        });
      }
    });
  }

  initializeServiceWorkerIntegration() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        // Send behavior data to service worker
        const channel = new MessageChannel();
        
        channel.port1.onmessage = (event) => {
          if (event.data.type === 'predictions') {
            // Use service worker predictions
            this.handleServiceWorkerPredictions(event.data.predictions);
          }
        };
        
        registration.active.postMessage({
          type: 'TRACK_BEHAVIOR',
          data: this.userBehaviorData.slice(-10)
        }, [channel.port2]);
      });
    }
  }

  handleServiceWorkerPredictions(predictions) {
    // Integrate service worker predictions with local predictions
    predictions.forEach(prediction => {
      if (prediction.confidence > 0.7) {
        this.prefetchResource(prediction.url, prediction.type);
      }
    });
  }

  initializePerformanceMonitoring() {
    // Monitor Core Web Vitals
    this.observeWebVitals();
    
    // Monitor rendering performance
    this.observeRenderingPerformance();
    
    // Monitor prediction accuracy
    this.observePredictionAccuracy();
    
    // Report metrics periodically
    setInterval(() => {
      this.reportPerformanceMetrics();
    }, 30000);
  }

  observeWebVitals() {
    // First Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.performanceMetrics.fcp = entry.startTime;
        }
      });
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.performanceMetrics.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    let clsScore = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      this.performanceMetrics.cls = clsScore;
    }).observe({ entryTypes: ['layout-shift'] });
  }

  observeRenderingPerformance() {
    // Monitor frame rate
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fpsSum = 0;

    const measureFrameRate = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastFrameTime;
      const fps = 1000 / deltaTime;
      
      fpsSum += fps;
      frameCount++;
      
      if (frameCount >= 60) { // Average over 60 frames
        this.performanceMetrics.averageFPS = fpsSum / frameCount;
        frameCount = 0;
        fpsSum = 0;
      }
      
      lastFrameTime = currentTime;
      requestAnimationFrame(measureFrameRate);
    };
    
    requestAnimationFrame(measureFrameRate);
  }

  observePredictionAccuracy() {
    // Track how often predictions lead to actual user actions
    let predictions = 0;
    let accurateImplicitly = 0;
    
    this.userBehaviorData.forEach((behavior, index) => {
      if (index > 0) {
        const prevBehavior = this.userBehaviorData[index - 1];
        // Simple heuristic: if prediction was made and similar action followed
        if (prevBehavior.prediction && 
            this.isSimilarBehavior(prevBehavior.prediction, behavior)) {
          accurateImplicitly++;
        }
        if (prevBehavior.prediction) predictions++;
      }
    });
    
    if (predictions > 0) {
      this.performanceMetrics.predictionAccuracy = accurateImplicitly / predictions;
    }
  }

  isSimilarBehavior(prediction, actualBehavior) {
    // Simple similarity check - in practice, this would be more sophisticated
    return prediction.type === actualBehavior.type ||
           prediction.target?.tagName === actualBehavior.target?.tagName;
  }

  updatePredictionAccuracy(predictions) {
    // Update accuracy based on recent user actions
    const recentActions = this.userBehaviorData.slice(-5);
    let matches = 0;
    
    predictions.forEach(prediction => {
      const hasMatch = recentActions.some(action => 
        this.predictedActionMatches(prediction, action)
      );
      if (hasMatch) matches++;
    });
    
    const accuracy = predictions.length > 0 ? matches / predictions.length : 0;
    this.performanceMetrics.predictionAccuracy = 
      (this.performanceMetrics.predictionAccuracy * 0.9) + (accuracy * 0.1);
  }

  predictedActionMatches(prediction, action) {
    // Check if prediction matches actual user action
    const behaviorMap = {
      0: ['click'], // Navigation
      1: ['focus', 'keydown'], // Search
      2: ['click'], // Details
      3: ['click'], // Contact
      4: ['click'], // Media
      5: ['focus', 'keydown'], // Form
      6: ['click'], // Social
      7: ['mousemove'] // Exit
    };
    
    const expectedActions = behaviorMap[prediction.behavior] || [];
    return expectedActions.includes(action.type);
  }

  handleTaskResult(result) {
    if (result.error) {
      console.warn('Rendering task failed:', result.error);
      return;
    }
    
    // Update metrics based on task completion
    if (result.cached) {
      this.performanceMetrics.cacheHitRate = 
        (this.performanceMetrics.cacheHitRate * 0.9) + 0.1;
    }
  }

  updatePerformanceMetrics(data) {
    if (data.duration) {
      this.performanceMetrics.renderingSpeed = 
        (this.performanceMetrics.renderingSpeed * 0.9) + (data.duration * 0.1);
    }
  }

  handleCacheResult(data) {
    if (data) {
      console.log('Cache hit for prerendered content:', data);
    }
  }

  reportPerformanceMetrics() {
    const metrics = {
      ...this.performanceMetrics,
      timestamp: Date.now(),
      behaviorDataPoints: this.userBehaviorData.length,
      renderQueueSize: this.renderQueue.size
    };
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'ai_rendering_performance', {
        custom_parameter: JSON.stringify(metrics)
      });
    }
    
    console.log('AI Rendering Performance:', metrics);
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      isInitialized: this.isInitialized,
      behaviorDataPoints: this.userBehaviorData.length,
      renderQueueSize: this.renderQueue.size,
      renderingState: Object.fromEntries(this.renderingState)
    };
  }

  dispose() {
    // Clean up resources
    if (this.worker) {
      this.worker.terminate();
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    if (this.model) {
      this.model.dispose();
    }
    
    if (this.predictionTimeout) {
      clearTimeout(this.predictionTimeout);
    }
    
    this.userBehaviorData = [];
    this.renderQueue.clear();
    this.renderingState.clear();
  }
}

// Initialize AI Progressive Renderer
const aiRenderer = new AIProgressiveRenderer();

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    aiRenderer.initialize();
  });
} else {
  aiRenderer.initialize();
}

// Export for global use
window.aiRenderer = aiRenderer;