// High-Performance Service Worker with AI-driven caching
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const AI_CACHE = `ai-models-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Cache strategies configuration
const CACHE_STRATEGIES = {
  static: {
    maxAge: 86400000, // 24 hours
    maxItems: 100
  },
  dynamic: {
    maxAge: 3600000, // 1 hour
    maxItems: 50
  },
  aiModels: {
    maxAge: 604800000, // 1 week
    maxItems: 10
  },
  images: {
    maxAge: 259200000, // 3 days
    maxItems: 200
  }
};

// TensorFlow.js model for user behavior prediction
let tfModel = null;
let userBehaviorData = [];

class PerformanceServiceWorker {
  constructor() {
    this.cacheHitRate = new Map();
    this.performanceMetrics = new Map();
    this.userBehaviorPredictor = null;
  }

  async initialize() {
    await this.setupCaches();
    await this.loadAIModel();
    this.setupMessageHandlers();
    this.startPerformanceMonitoring();
  }

  async setupCaches() {
    // Pre-cache critical resources
    const criticalResources = [
      '/',
      '/manifest.json',
      '/css/critical.css',
      '/js/core.js',
      '/implementations/quantum-image-optimizer.js',
      '/implementations/zero-latency-interaction.js'
    ];

    const staticCache = await caches.open(STATIC_CACHE);
    await staticCache.addAll(criticalResources);
  }

  async loadAIModel() {
    try {
      // Load lightweight behavior prediction model
      importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.0.0/dist/tf.min.js');
      
      // Create simple neural network for behavior prediction
      tfModel = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [5], units: 16, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 4, activation: 'softmax' }) // 4 behavior categories
        ]
      });

      // Compile with lightweight optimizer
      tfModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      console.log('AI model loaded successfully in Service Worker');
    } catch (error) {
      console.warn('AI model loading failed, falling back to heuristics:', error);
    }
  }

  setupMessageHandlers() {
    self.addEventListener('message', async (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'TRACK_BEHAVIOR':
          await this.trackUserBehavior(data);
          break;
        case 'PREDICT_RESOURCES':
          const predictions = await this.predictResourceNeeds(data);
          event.ports[0].postMessage({ predictions });
          break;
        case 'PERFORMANCE_METRICS':
          event.ports[0].postMessage({ 
            metrics: Object.fromEntries(this.performanceMetrics) 
          });
          break;
      }
    });
  }

  async trackUserBehavior(behaviorData) {
    userBehaviorData.push({
      ...behaviorData,
      timestamp: Date.now()
    });

    // Keep only recent data (last 100 interactions)
    if (userBehaviorData.length > 100) {
      userBehaviorData.shift();
    }

    // Trigger resource prediction
    if (userBehaviorData.length >= 10) {
      await this.predictAndPrefetch();
    }
  }

  async predictAndPrefetch() {
    if (!tfModel || userBehaviorData.length < 10) return;

    try {
      // Prepare features from recent behavior
      const features = this.extractBehaviorFeatures(userBehaviorData.slice(-10));
      const prediction = await tfModel.predict(tf.tensor2d([features])).data();
      
      // Get most likely next actions
      const actionProbabilities = Array.from(prediction);
      const topActions = actionProbabilities
        .map((prob, index) => ({ action: index, probability: prob }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 2);

      // Prefetch resources for predicted actions
      for (const action of topActions) {
        if (action.probability > 0.6) {
          await this.prefetchForAction(action.action);
        }
      }
    } catch (error) {
      console.warn('AI prediction failed, using fallback heuristics:', error);
      await this.fallbackPrefetch();
    }
  }

  extractBehaviorFeatures(data) {
    const recent = data.slice(-5);
    
    // Extract normalized features
    const scrollVelocity = this.calculateScrollVelocity(recent);
    const clickFrequency = this.calculateClickFrequency(recent);
    const mouseMovement = this.calculateMouseMovement(recent);
    const timeOnPage = (Date.now() - recent[0].timestamp) / 1000;
    const interactionDiversity = this.calculateInteractionDiversity(recent);

    return [
      Math.min(scrollVelocity / 1000, 1),
      Math.min(clickFrequency / 10, 1),
      Math.min(mouseMovement / 10000, 1),
      Math.min(timeOnPage / 60, 1),
      Math.min(interactionDiversity / 5, 1)
    ];
  }

  calculateScrollVelocity(data) {
    const scrollEvents = data.filter(d => d.type === 'scroll');
    if (scrollEvents.length < 2) return 0;
    
    const totalDistance = scrollEvents.reduce((sum, event, index) => {
      if (index === 0) return 0;
      return sum + Math.abs(event.scrollY - scrollEvents[index - 1].scrollY);
    }, 0);
    
    const totalTime = scrollEvents[scrollEvents.length - 1].timestamp - scrollEvents[0].timestamp;
    return totalTime > 0 ? totalDistance / totalTime * 1000 : 0;
  }

  calculateClickFrequency(data) {
    const clicks = data.filter(d => d.type === 'click');
    const timeSpan = data[data.length - 1].timestamp - data[0].timestamp;
    return timeSpan > 0 ? clicks.length / timeSpan * 1000 : 0;
  }

  calculateMouseMovement(data) {
    const mouseEvents = data.filter(d => d.coordinates);
    if (mouseEvents.length < 2) return 0;
    
    return mouseEvents.reduce((sum, event, index) => {
      if (index === 0) return 0;
      const prev = mouseEvents[index - 1];
      return sum + Math.sqrt(
        Math.pow(event.coordinates.x - prev.coordinates.x, 2) +
        Math.pow(event.coordinates.y - prev.coordinates.y, 2)
      );
    }, 0);
  }

  calculateInteractionDiversity(data) {
    const types = new Set(data.map(d => d.type));
    return types.size;
  }

  async prefetchForAction(actionType) {
    const resourceMap = {
      0: ['/api/content', '/images/hero-2.webp'], // Navigation
      1: ['/api/search', '/js/search.js'], // Search
      2: ['/api/details', '/css/modal.css'], // Details view
      3: ['/api/contact', '/js/form-validation.js'] // Contact
    };

    const resources = resourceMap[actionType] || [];
    
    for (const resource of resources) {
      await this.smartPrefetch(resource);
    }
  }

  async fallbackPrefetch() {
    // Simple heuristic-based prefetching
    const commonResources = [
      '/api/popular-content',
      '/images/common-hero.webp',
      '/js/lazy-modules.js'
    ];

    for (const resource of commonResources) {
      await this.smartPrefetch(resource);
    }
  }

  async smartPrefetch(url) {
    try {
      const cache = await caches.open(DYNAMIC_CACHE);
      const cached = await cache.match(url);
      
      if (!cached) {
        const response = await fetch(url, {
          priority: 'low',
          mode: 'cors'
        });
        
        if (response.ok) {
          await cache.put(url, response.clone());
          this.updateCacheHitRate(url, false);
        }
      } else {
        this.updateCacheHitRate(url, true);
      }
    } catch (error) {
      console.warn(`Failed to prefetch ${url}:`, error);
    }
  }

  updateCacheHitRate(url, hit) {
    const current = this.cacheHitRate.get(url) || { hits: 0, total: 0 };
    current.total++;
    if (hit) current.hits++;
    this.cacheHitRate.set(url, current);
  }

  startPerformanceMonitoring() {
    setInterval(() => {
      // Calculate cache efficiency
      let totalHits = 0;
      let totalRequests = 0;
      
      this.cacheHitRate.forEach(({ hits, total }) => {
        totalHits += hits;
        totalRequests += total;
      });
      
      const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
      this.performanceMetrics.set('cacheHitRate', hitRate);
      
      // Cleanup old cache entries
      this.cleanupCaches();
    }, 30000); // Every 30 seconds
  }

  async cleanupCaches() {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      if (cacheName.includes('v') && !cacheName.includes(CACHE_VERSION)) {
        await caches.delete(cacheName);
      }
    }
    
    // Cleanup oversized caches
    await this.cleanupCache(DYNAMIC_CACHE, CACHE_STRATEGIES.dynamic);
    await this.cleanupCache(IMAGE_CACHE, CACHE_STRATEGIES.images);
  }

  async cleanupCache(cacheName, strategy) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > strategy.maxItems) {
      // Remove oldest entries
      const sortedKeys = keys.sort((a, b) => {
        // Use URL timestamp if available, otherwise use insertion order
        return new URL(a.url).searchParams.get('t') - new URL(b.url).searchParams.get('t');
      });
      
      const toDelete = sortedKeys.slice(0, keys.length - strategy.maxItems);
      await Promise.all(toDelete.map(key => cache.delete(key)));
    }
  }
}

// Fetch event handler with intelligent caching
self.addEventListener('fetch', async (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) return;
  
  event.respondWith(handleFetchRequest(request));
});

async function handleFetchRequest(request) {
  const url = new URL(request.url);
  const startTime = performance.now();
  
  try {
    // Different strategies for different resource types
    if (url.pathname.startsWith('/api/')) {
      return await handleAPIRequest(request);
    } else if (url.pathname.match(/\.(png|jpg|jpeg|webp|avif)$/)) {
      return await handleImageRequest(request);
    } else if (url.pathname.match(/\.(js|css)$/)) {
      return await handleStaticAsset(request);
    } else {
      return await handleDocumentRequest(request);
    }
  } catch (error) {
    console.error('Fetch failed:', error);
    return new Response('Service Unavailable', { status: 503 });
  } finally {
    const duration = performance.now() - startTime;
    serviceWorker.performanceMetrics.set(`request_${url.pathname}`, duration);
  }
}

async function handleAPIRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  // For API requests, use stale-while-revalidate
  if (cached) {
    // Return cached version immediately
    const response = cached.clone();
    
    // Update in background
    fetch(request).then(async (freshResponse) => {
      if (freshResponse.ok) {
        await cache.put(request, freshResponse.clone());
      }
    }).catch(() => {
      // Ignore background update failures
    });
    
    return response;
  }
  
  // No cache, fetch fresh
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  
  return response;
}

async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  // Fetch and optimize image
  const response = await fetch(request);
  if (response.ok) {
    // Apply quantum optimization if available
    const optimizedResponse = await optimizeImageResponse(response);
    await cache.put(request, optimizedResponse.clone());
    return optimizedResponse;
  }
  
  return response;
}

async function optimizeImageResponse(response) {
  // Check if quantum optimizer is available
  if (self.quantumOptimizer) {
    try {
      const blob = await response.blob();
      const optimized = await self.quantumOptimizer.processBlob(blob);
      return new Response(optimized, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=259200'
        }
      });
    } catch (error) {
      console.warn('Image optimization failed, returning original:', error);
    }
  }
  
  return response;
}

async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  // Cache-first for static assets
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  
  return response;
}

async function handleDocumentRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Network-first for documents
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fallback to cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Ultimate fallback
    return new Response('Offline - Page not available', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Install and activate handlers
self.addEventListener('install', (event) => {
  event.waitUntil(
    serviceWorker.initialize().then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      return serviceWorker.cleanupCaches();
    })
  );
});

// Initialize the service worker
const serviceWorker = new PerformanceServiceWorker();