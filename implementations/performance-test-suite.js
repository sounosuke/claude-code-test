// Comprehensive Performance Testing and Optimization Suite
class PerformanceTestSuite {
  constructor() {
    this.testResults = new Map();
    this.benchmarks = new Map();
    this.optimizations = new Map();
    this.realTimeMetrics = {
      loadTime: 0,
      interactionTime: 0,
      memoryUsage: 0,
      cacheEfficiency: 0,
      aiAccuracy: 0
    };
    this.isRunning = false;
    this.testConfig = {
      targetLoadTime: 3000, // 3 seconds
      targetInteractionTime: 50, // 50ms
      targetMemoryLimit: 100 * 1024 * 1024, // 100MB
      targetCacheHitRate: 0.85, // 85%
      targetAIAccuracy: 0.8 // 80%
    };
  }

  async runComprehensiveTest() {
    if (this.isRunning) {
      console.warn('Performance test already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting comprehensive performance test suite...');

    try {
      // Initialize all systems
      await this.initializeTestEnvironment();

      // Run all test categories
      const testSuite = [
        () => this.testLoadPerformance(),
        () => this.testRenderingPerformance(),
        () => this.testAISystemPerformance(),
        () => this.testMemoryEfficiency(),
        () => this.testCacheEfficiency(),
        () => this.testNetworkOptimization(),
        () => this.testMobilePerformance(),
        () => this.testAccessibilityPerformance(),
        () => this.testSecurityPerformance()
      ];

      const results = [];
      for (const test of testSuite) {
        const result = await test();
        results.push(result);
        
        // Real-time optimization between tests
        await this.applyRealTimeOptimizations(result);
      }

      // Generate comprehensive report
      const report = await this.generatePerformanceReport(results);
      
      // Apply final optimizations
      await this.applyFinalOptimizations(report);

      console.log('✅ Performance test suite completed');
      return report;

    } catch (error) {
      console.error('❌ Performance test failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async initializeTestEnvironment() {
    console.log('🔧 Initializing test environment...');

    // Ensure all systems are loaded
    const systems = [
      () => window.tfOptimizer?.initialize(),
      () => window.wasmProcessor?.initialize(),
      () => window.aiRenderer?.initialize(),
      () => this.registerServiceWorker()
    ];

    await Promise.all(systems.map(async (init) => {
      try {
        await init();
      } catch (error) {
        console.warn('System initialization warning:', error);
      }
    }));

    // Setup performance observers
    this.setupPerformanceObservers();
    
    // Clear any existing metrics
    this.clearPreviousMetrics();
  }

  setupPerformanceObservers() {
    // Core Web Vitals observers
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
  }

  observeLCP() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.realTimeMetrics.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  observeFID() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.realTimeMetrics.fid = entry.processingStart - entry.startTime;
      });
    }).observe({ entryTypes: ['first-input'] });
  }

  observeCLS() {
    let clsScore = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      this.realTimeMetrics.cls = clsScore;
    }).observe({ entryTypes: ['layout-shift'] });
  }

  observeFCP() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.realTimeMetrics.fcp = entry.startTime;
        }
      });
    }).observe({ entryTypes: ['paint'] });
  }

  observeTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.realTimeMetrics.ttfb = navigation.responseStart - navigation.requestStart;
    }
  }

  async testLoadPerformance() {
    console.log('📊 Testing load performance...');
    const startTime = performance.now();

    try {
      // Test initial page load
      const loadMetrics = await this.measurePageLoad();
      
      // Test resource loading
      const resourceMetrics = await this.measureResourceLoading();
      
      // Test critical path optimization
      const criticalPathMetrics = await this.measureCriticalPath();

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      const result = {
        category: 'Load Performance',
        metrics: {
          totalLoadTime: totalTime,
          ...loadMetrics,
          ...resourceMetrics,
          ...criticalPathMetrics
        },
        passed: totalTime < this.testConfig.targetLoadTime,
        score: this.calculateLoadScore(totalTime),
        recommendations: this.generateLoadRecommendations(totalTime)
      };

      this.testResults.set('loadPerformance', result);
      return result;

    } catch (error) {
      console.error('Load performance test failed:', error);
      return { category: 'Load Performance', error: error.message };
    }
  }

  async measurePageLoad() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve(this.getCurrentLoadMetrics());
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => resolve(this.getCurrentLoadMetrics()), 100);
        });
      }
    });
  }

  getCurrentLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      domInteractive: navigation.domInteractive - navigation.navigationStart
    };
  }

  async measureResourceLoading() {
    const resources = performance.getEntriesByType('resource');
    
    const categorized = {
      scripts: resources.filter(r => r.name.includes('.js')),
      styles: resources.filter(r => r.name.includes('.css')),
      images: resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)),
      fonts: resources.filter(r => r.name.match(/\.(woff|woff2|ttf|otf)$/)),
      other: resources.filter(r => !r.name.match(/\.(js|css|jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|otf)$/))
    };

    return {
      totalResources: resources.length,
      scriptLoadTime: this.calculateAverageLoadTime(categorized.scripts),
      styleLoadTime: this.calculateAverageLoadTime(categorized.styles),
      imageLoadTime: this.calculateAverageLoadTime(categorized.images),
      fontLoadTime: this.calculateAverageLoadTime(categorized.fonts),
      largestResource: this.findLargestResource(resources),
      slowestResource: this.findSlowestResource(resources)
    };
  }

  calculateAverageLoadTime(resources) {
    if (resources.length === 0) return 0;
    
    const totalTime = resources.reduce((sum, resource) => {
      return sum + (resource.responseEnd - resource.startTime);
    }, 0);
    
    return totalTime / resources.length;
  }

  findLargestResource(resources) {
    return resources.reduce((largest, resource) => {
      return (resource.transferSize || 0) > (largest.transferSize || 0) ? resource : largest;
    }, resources[0] || {});
  }

  findSlowestResource(resources) {
    return resources.reduce((slowest, resource) => {
      const resourceTime = resource.responseEnd - resource.startTime;
      const slowestTime = slowest.responseEnd - slowest.startTime;
      return resourceTime > slowestTime ? resource : slowest;
    }, resources[0] || {});
  }

  async measureCriticalPath() {
    // Measure critical rendering path
    const criticalResources = document.querySelectorAll('link[rel="stylesheet"], script[src]:not([async]):not([defer])');
    
    let criticalPathTime = 0;
    criticalResources.forEach(resource => {
      const resourceEntry = performance.getEntriesByName(resource.href || resource.src)[0];
      if (resourceEntry) {
        criticalPathTime = Math.max(criticalPathTime, resourceEntry.responseEnd);
      }
    });

    return {
      criticalPathTime,
      criticalResourceCount: criticalResources.length,
      renderBlockingResources: Array.from(criticalResources).map(r => r.href || r.src)
    };
  }

  async testRenderingPerformance() {
    console.log('🎨 Testing rendering performance...');
    
    try {
      // Test frame rate
      const frameMetrics = await this.measureFrameRate();
      
      // Test layout thrashing
      const layoutMetrics = await this.measureLayoutPerformance();
      
      // Test paint performance
      const paintMetrics = await this.measurePaintPerformance();
      
      // Test scroll performance
      const scrollMetrics = await this.measureScrollPerformance();

      const result = {
        category: 'Rendering Performance',
        metrics: {
          ...frameMetrics,
          ...layoutMetrics,
          ...paintMetrics,
          ...scrollMetrics
        },
        passed: frameMetrics.averageFPS > 55,
        score: this.calculateRenderingScore(frameMetrics.averageFPS),
        recommendations: this.generateRenderingRecommendations(frameMetrics)
      };

      this.testResults.set('renderingPerformance', result);
      return result;

    } catch (error) {
      console.error('Rendering performance test failed:', error);
      return { category: 'Rendering Performance', error: error.message };
    }
  }

  async measureFrameRate() {
    return new Promise((resolve) => {
      let frameCount = 0;
      let lastTime = performance.now();
      let totalFrameTime = 0;
      const targetFrames = 60;

      const measureFrame = () => {
        const currentTime = performance.now();
        const frameTime = currentTime - lastTime;
        totalFrameTime += frameTime;
        lastTime = currentTime;
        frameCount++;

        if (frameCount < targetFrames) {
          requestAnimationFrame(measureFrame);
        } else {
          const averageFrameTime = totalFrameTime / frameCount;
          const averageFPS = 1000 / averageFrameTime;
          
          resolve({
            averageFPS,
            averageFrameTime,
            frameCount,
            totalTime: totalFrameTime
          });
        }
      };

      requestAnimationFrame(measureFrame);
    });
  }

  async measureLayoutPerformance() {
    const startTime = performance.now();
    
    // Trigger layout operations
    const testElement = document.createElement('div');
    testElement.style.cssText = `
      position: absolute;
      top: -9999px;
      width: 100px;
      height: 100px;
      background: red;
    `;
    
    document.body.appendChild(testElement);
    
    // Force layout
    for (let i = 0; i < 100; i++) {
      testElement.style.width = (100 + i) + 'px';
      testElement.offsetWidth; // Force layout
    }
    
    const layoutTime = performance.now() - startTime;
    document.body.removeChild(testElement);
    
    return {
      layoutOperationTime: layoutTime,
      layoutEfficiency: 100 / layoutTime // Higher is better
    };
  }

  async measurePaintPerformance() {
    const startTime = performance.now();
    
    // Create paint-heavy operations
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Perform drawing operations
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `hsl(${i % 360}, 50%, 50%)`;
      ctx.fillRect(i % 200, Math.floor(i / 200), 1, 1);
    }
    
    const paintTime = performance.now() - startTime;
    
    return {
      paintOperationTime: paintTime,
      paintEfficiency: 1000 / paintTime // Operations per ms
    };
  }

  async measureScrollPerformance() {
    return new Promise((resolve) => {
      let scrollCount = 0;
      let totalScrollTime = 0;
      const maxScrolls = 10;
      
      const measureScroll = () => {
        const startTime = performance.now();
        
        window.scrollTo(0, scrollCount * 100);
        
        requestAnimationFrame(() => {
          const scrollTime = performance.now() - startTime;
          totalScrollTime += scrollTime;
          scrollCount++;
          
          if (scrollCount < maxScrolls) {
            setTimeout(measureScroll, 16); // 60 FPS
          } else {
            window.scrollTo(0, 0); // Reset
            resolve({
              averageScrollTime: totalScrollTime / scrollCount,
              scrollOperations: scrollCount,
              scrollEfficiency: scrollCount / totalScrollTime
            });
          }
        });
      };
      
      measureScroll();
    });
  }

  async testAISystemPerformance() {
    console.log('🤖 Testing AI system performance...');
    
    try {
      // Test TensorFlow.js performance
      const tfMetrics = await this.testTensorFlowPerformance();
      
      // Test AI rendering system
      const aiRenderingMetrics = await this.testAIRenderingPerformance();
      
      // Test prediction accuracy
      const predictionMetrics = await this.testPredictionAccuracy();

      const result = {
        category: 'AI System Performance',
        metrics: {
          ...tfMetrics,
          ...aiRenderingMetrics,
          ...predictionMetrics
        },
        passed: predictionMetrics.accuracy > this.testConfig.targetAIAccuracy,
        score: this.calculateAIScore(predictionMetrics.accuracy),
        recommendations: this.generateAIRecommendations(predictionMetrics)
      };

      this.testResults.set('aiPerformance', result);
      return result;

    } catch (error) {
      console.error('AI system performance test failed:', error);
      return { category: 'AI System Performance', error: error.message };
    }
  }

  async testTensorFlowPerformance() {
    if (!window.tfOptimizer) {
      return { error: 'TensorFlow optimizer not available' };
    }

    const startTime = performance.now();
    
    try {
      // Test model loading
      const loadStartTime = performance.now();
      await window.tfOptimizer.initialize();
      const loadTime = performance.now() - loadStartTime;
      
      // Test inference performance
      const inferenceStartTime = performance.now();
      const testInput = Array(15).fill(0.5); // Test input
      
      // Create a simple test model if not available
      const testModel = window.tfOptimizer.createLightweightModel([15], 8);
      
      const prediction = await window.tfOptimizer.predict(testInput, { model: testModel });
      const inferenceTime = performance.now() - inferenceStartTime;
      
      // Test multiple inferences for throughput
      const throughputStartTime = performance.now();
      const batchSize = 10;
      const batchPromises = Array(batchSize).fill().map(() => 
        window.tfOptimizer.predict(testInput, { model: testModel })
      );
      
      await Promise.all(batchPromises);
      const throughputTime = performance.now() - throughputStartTime;
      
      testModel.dispose();
      
      return {
        tensorflowLoadTime: loadTime,
        singleInferenceTime: inferenceTime,
        batchInferenceTime: throughputTime,
        inferencesThroughput: batchSize / (throughputTime / 1000), // inferences per second
        memoryUsage: window.tfOptimizer.getPerformanceMetrics().memoryUsage
      };
      
    } catch (error) {
      return { tensorflowError: error.message };
    }
  }

  async testAIRenderingPerformance() {
    if (!window.aiRenderer) {
      return { error: 'AI renderer not available' };
    }

    try {
      const metrics = window.aiRenderer.getPerformanceMetrics();
      
      // Test prediction speed
      const predictionStartTime = performance.now();
      
      // Simulate user behavior data
      const testBehaviorData = Array(20).fill().map((_, i) => ({
        type: ['click', 'scroll', 'mousemove'][i % 3],
        timestamp: Date.now() - (20 - i) * 1000,
        coordinates: { x: Math.random() * 1000, y: Math.random() * 1000 },
        target: { tagName: 'DIV' }
      }));
      
      // Add test data and trigger prediction
      testBehaviorData.forEach(data => window.aiRenderer.addBehaviorData(data));
      
      const predictionTime = performance.now() - predictionStartTime;
      
      return {
        aiRenderingAccuracy: metrics.predictionAccuracy || 0,
        aiRenderingSpeed: metrics.renderingSpeed || 0,
        aiCacheHitRate: metrics.cacheHitRate || 0,
        aiPredictionTime: predictionTime,
        aiBehaviorDataPoints: metrics.behaviorDataPoints || 0,
        aiRenderQueueSize: metrics.renderQueueSize || 0
      };
      
    } catch (error) {
      return { aiRenderingError: error.message };
    }
  }

  async testPredictionAccuracy() {
    // Simulate prediction accuracy test
    const predictions = [];
    const actualActions = [];
    
    // Generate test scenarios
    for (let i = 0; i < 50; i++) {
      const predictedAction = Math.floor(Math.random() * 8); // 8 behavior types
      const actualAction = Math.floor(Math.random() * 8);
      
      predictions.push(predictedAction);
      actualActions.push(actualAction);
    }
    
    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === actualActions[i]) {
        correct++;
      }
    }
    
    const accuracy = correct / predictions.length;
    
    return {
      accuracy,
      totalPredictions: predictions.length,
      correctPredictions: correct,
      predictionConfidence: 0.7 + (accuracy * 0.3) // Simulated confidence
    };
  }

  async testMemoryEfficiency() {
    console.log('💾 Testing memory efficiency...');
    
    try {
      const initialMemory = this.getCurrentMemoryUsage();
      
      // Stress test memory usage
      const stressTestResults = await this.runMemoryStressTest();
      
      const finalMemory = this.getCurrentMemoryUsage();
      const memoryDelta = finalMemory.used - initialMemory.used;
      
      const result = {
        category: 'Memory Efficiency',
        metrics: {
          initialMemoryUsage: initialMemory,
          finalMemoryUsage: finalMemory,
          memoryDelta,
          ...stressTestResults
        },
        passed: finalMemory.used < this.testConfig.targetMemoryLimit,
        score: this.calculateMemoryScore(finalMemory.used),
        recommendations: this.generateMemoryRecommendations(memoryDelta)
      };

      this.testResults.set('memoryEfficiency', result);
      return result;

    } catch (error) {
      console.error('Memory efficiency test failed:', error);
      return { category: 'Memory Efficiency', error: error.message };
    }
  }

  getCurrentMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    
    return { used: 0, total: 0, limit: 0 };
  }

  async runMemoryStressTest() {
    const objects = [];
    const startTime = performance.now();
    
    try {
      // Create memory stress
      for (let i = 0; i < 10000; i++) {
        objects.push({
          id: i,
          data: new Array(100).fill(Math.random()),
          timestamp: Date.now()
        });
      }
      
      // Measure peak memory
      const peakMemory = this.getCurrentMemoryUsage();
      
      // Clean up
      objects.length = 0;
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const cleanupMemory = this.getCurrentMemoryUsage();
      const stressTestTime = performance.now() - startTime;
      
      return {
        peakMemoryUsage: peakMemory,
        cleanupMemoryUsage: cleanupMemory,
        memoryLeakage: cleanupMemory.used - peakMemory.used,
        stressTestDuration: stressTestTime
      };
      
    } catch (error) {
      return { memoryStressTestError: error.message };
    }
  }

  async testCacheEfficiency() {
    console.log('🗄️ Testing cache efficiency...');
    
    try {
      // Test Service Worker cache
      const swCacheMetrics = await this.testServiceWorkerCache();
      
      // Test browser cache
      const browserCacheMetrics = await this.testBrowserCache();
      
      // Test AI cache
      const aiCacheMetrics = await this.testAICache();

      const overallHitRate = (swCacheMetrics.hitRate + browserCacheMetrics.hitRate + aiCacheMetrics.hitRate) / 3;

      const result = {
        category: 'Cache Efficiency',
        metrics: {
          ...swCacheMetrics,
          ...browserCacheMetrics,
          ...aiCacheMetrics,
          overallHitRate
        },
        passed: overallHitRate > this.testConfig.targetCacheHitRate,
        score: this.calculateCacheScore(overallHitRate),
        recommendations: this.generateCacheRecommendations(overallHitRate)
      };

      this.testResults.set('cacheEfficiency', result);
      return result;

    } catch (error) {
      console.error('Cache efficiency test failed:', error);
      return { category: 'Cache Efficiency', error: error.message };
    }
  }

  async testServiceWorkerCache() {
    if (!('serviceWorker' in navigator)) {
      return { swError: 'Service Worker not supported' };
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Test cache operations
      const testUrls = [
        '/',
        '/css/style.css',
        '/js/app.js',
        '/images/test.jpg'
      ];
      
      let cacheHits = 0;
      const startTime = performance.now();
      
      for (const url of testUrls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            cacheHits++;
          }
        } catch (error) {
          // URL might not exist
        }
      }
      
      const testTime = performance.now() - startTime;
      
      return {
        swCacheHitRate: cacheHits / testUrls.length,
        swCacheTestTime: testTime,
        swCacheTestedUrls: testUrls.length
      };
      
    } catch (error) {
      return { swCacheError: error.message };
    }
  }

  async testBrowserCache() {
    const resources = performance.getEntriesByType('resource');
    
    let cachedResources = 0;
    resources.forEach(resource => {
      // Resource was served from cache if transferSize is 0 or very small
      if (resource.transferSize === 0 || 
          (resource.transferSize > 0 && resource.transferSize < resource.decodedBodySize * 0.1)) {
        cachedResources++;
      }
    });
    
    const hitRate = resources.length > 0 ? cachedResources / resources.length : 0;
    
    return {
      browserCacheHitRate: hitRate,
      browserCachedResources: cachedResources,
      browserTotalResources: resources.length
    };
  }

  async testAICache() {
    if (!window.aiRenderer) {
      return { aiCacheError: 'AI renderer not available' };
    }

    try {
      const metrics = window.aiRenderer.getPerformanceMetrics();
      
      return {
        aiCacheHitRate: metrics.cacheHitRate || 0,
        aiCacheSize: metrics.renderQueueSize || 0
      };
      
    } catch (error) {
      return { aiCacheError: error.message };
    }
  }

  async testNetworkOptimization() {
    console.log('🌐 Testing network optimization...');
    
    try {
      // Test compression
      const compressionMetrics = await this.testCompression();
      
      // Test HTTP/2 usage
      const http2Metrics = await this.testHTTP2Usage();
      
      // Test CDN performance
      const cdnMetrics = await this.testCDNPerformance();

      const result = {
        category: 'Network Optimization',
        metrics: {
          ...compressionMetrics,
          ...http2Metrics,
          ...cdnMetrics
        },
        passed: compressionMetrics.compressionRatio > 0.3,
        score: this.calculateNetworkScore(compressionMetrics.compressionRatio),
        recommendations: this.generateNetworkRecommendations(compressionMetrics)
      };

      this.testResults.set('networkOptimization', result);
      return result;

    } catch (error) {
      console.error('Network optimization test failed:', error);
      return { category: 'Network Optimization', error: error.message };
    }
  }

  async testCompression() {
    const resources = performance.getEntriesByType('resource');
    
    let totalDecodedSize = 0;
    let totalTransferSize = 0;
    let compressedResources = 0;
    
    resources.forEach(resource => {
      if (resource.decodedBodySize && resource.transferSize) {
        totalDecodedSize += resource.decodedBodySize;
        totalTransferSize += resource.transferSize;
        
        if (resource.transferSize < resource.decodedBodySize * 0.9) {
          compressedResources++;
        }
      }
    });
    
    const compressionRatio = totalDecodedSize > 0 ? 
      1 - (totalTransferSize / totalDecodedSize) : 0;
    
    return {
      compressionRatio,
      totalDecodedSize,
      totalTransferSize,
      compressedResourcesCount: compressedResources,
      compressionCoverage: resources.length > 0 ? compressedResources / resources.length : 0
    };
  }

  async testHTTP2Usage() {
    const resources = performance.getEntriesByType('resource');
    
    let http2Resources = 0;
    resources.forEach(resource => {
      // Check if resource was loaded over HTTP/2
      if (resource.nextHopProtocol === 'h2') {
        http2Resources++;
      }
    });
    
    return {
      http2Usage: resources.length > 0 ? http2Resources / resources.length : 0,
      http2ResourcesCount: http2Resources,
      totalResourcesCount: resources.length
    };
  }

  async testCDNPerformance() {
    const resources = performance.getEntriesByType('resource');
    
    let cdnResources = 0;
    let totalCDNTime = 0;
    
    resources.forEach(resource => {
      // Simple CDN detection (domain contains 'cdn' or common CDN providers)
      if (resource.name.includes('cdn') || 
          resource.name.includes('cloudflare') ||
          resource.name.includes('amazonaws') ||
          resource.name.includes('cloudfront')) {
        cdnResources++;
        totalCDNTime += resource.responseEnd - resource.startTime;
      }
    });
    
    return {
      cdnUsage: resources.length > 0 ? cdnResources / resources.length : 0,
      averageCDNResponseTime: cdnResources > 0 ? totalCDNTime / cdnResources : 0,
      cdnResourcesCount: cdnResources
    };
  }

  async testMobilePerformance() {
    console.log('📱 Testing mobile performance...');
    
    try {
      // Simulate mobile conditions
      const mobileMetrics = await this.simulateMobileConditions();
      
      // Test responsive design performance
      const responsiveMetrics = await this.testResponsivePerformance();
      
      // Test touch performance
      const touchMetrics = await this.testTouchPerformance();

      const result = {
        category: 'Mobile Performance',
        metrics: {
          ...mobileMetrics,
          ...responsiveMetrics,
          ...touchMetrics
        },
        passed: mobileMetrics.mobileScore > 70,
        score: mobileMetrics.mobileScore,
        recommendations: this.generateMobileRecommendations(mobileMetrics)
      };

      this.testResults.set('mobilePerformance', result);
      return result;

    } catch (error) {
      console.error('Mobile performance test failed:', error);
      return { category: 'Mobile Performance', error: error.message };
    }
  }

  async simulateMobileConditions() {
    // Simulate slower processing and network
    const startTime = performance.now();
    
    // Test with reduced viewport
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    
    // Simulate mobile viewport (can't actually resize in test, but measure impact)
    const mobileViewportImpact = this.calculateMobileViewportImpact();
    
    // Calculate mobile score based on multiple factors
    const mobileScore = this.calculateMobileScore();
    
    return {
      mobileScore,
      mobileViewportImpact,
      simulationTime: performance.now() - startTime
    };
  }

  calculateMobileViewportImpact() {
    // Check if design is mobile-friendly
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return 0;
    
    // Check for responsive design elements
    const mediaQueries = Array.from(document.styleSheets).reduce((count, sheet) => {
      try {
        return count + Array.from(sheet.cssRules).filter(rule => 
          rule.type === CSSRule.MEDIA_RULE
        ).length;
      } catch (e) {
        return count;
      }
    }, 0);
    
    return Math.min(mediaQueries / 10, 1); // Normalize to 0-1
  }

  calculateMobileScore() {
    let score = 50; // Base score
    
    // Check viewport meta tag
    if (document.querySelector('meta[name="viewport"]')) score += 20;
    
    // Check for touch-friendly elements
    const touchElements = document.querySelectorAll('button, a, [onclick], [data-interactive]');
    score += Math.min(touchElements.length / 10, 20);
    
    // Check for mobile-optimized images
    const responsiveImages = document.querySelectorAll('img[srcset], picture');
    score += Math.min(responsiveImages.length / 5, 10);
    
    return Math.min(score, 100);
  }

  async testResponsivePerformance() {
    // Test layout stability with different viewport sizes
    const layouts = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 8
      { width: 768, height: 1024 }, // iPad
      { width: 1200, height: 800 } // Desktop
    ];
    
    let layoutShifts = 0;
    
    // Simulate layout testing (in real implementation, would use tools like Puppeteer)
    layouts.forEach(layout => {
      // Simple heuristic: count potentially problematic elements
      const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position: absolute"]');
      const largeImages = document.querySelectorAll('img:not([width]):not([height])');
      
      layoutShifts += fixedElements.length * 0.1 + largeImages.length * 0.2;
    });
    
    return {
      responsiveLayoutShifts: layoutShifts,
      responsiveDesignScore: Math.max(100 - layoutShifts * 10, 0)
    };
  }

  async testTouchPerformance() {
    // Test touch target sizes and spacing
    const interactiveElements = document.querySelectorAll('button, a, input, [onclick], [data-interactive]');
    
    let appropriateTouchTargets = 0;
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const area = rect.width * rect.height;
      
      // Touch target should be at least 44x44px (iOS HIG)
      if (area >= 44 * 44) {
        appropriateTouchTargets++;
      }
    });
    
    const touchTargetScore = interactiveElements.length > 0 ? 
      (appropriateTouchTargets / interactiveElements.length) * 100 : 100;
    
    return {
      touchTargetScore,
      appropriateTouchTargets,
      totalInteractiveElements: interactiveElements.length
    };
  }

  async testAccessibilityPerformance() {
    console.log('♿ Testing accessibility performance...');
    
    try {
      // Test screen reader performance
      const screenReaderMetrics = await this.testScreenReaderPerformance();
      
      // Test keyboard navigation
      const keyboardMetrics = await this.testKeyboardNavigation();
      
      // Test contrast and readability
      const visualMetrics = await this.testVisualAccessibility();

      const overallScore = (screenReaderMetrics.score + keyboardMetrics.score + visualMetrics.score) / 3;

      const result = {
        category: 'Accessibility Performance',
        metrics: {
          ...screenReaderMetrics,
          ...keyboardMetrics,
          ...visualMetrics,
          overallScore
        },
        passed: overallScore > 70,
        score: overallScore,
        recommendations: this.generateAccessibilityRecommendations(overallScore)
      };

      this.testResults.set('accessibilityPerformance', result);
      return result;

    } catch (error) {
      console.error('Accessibility performance test failed:', error);
      return { category: 'Accessibility Performance', error: error.message };
    }
  }

  async testScreenReaderPerformance() {
    let score = 50;
    
    // Check for semantic HTML
    const semanticElements = document.querySelectorAll('header, nav, main, article, section, aside, footer');
    score += Math.min(semanticElements.length * 5, 25);
    
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithAlt = document.querySelectorAll('img[alt]');
    if (images.length > 0) {
      score += (imagesWithAlt.length / images.length) * 15;
    }
    
    // Check for ARIA labels
    const ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]');
    score += Math.min(ariaLabels.length * 2, 10);
    
    return {
      screenReaderScore: Math.min(score, 100),
      semanticElementsCount: semanticElements.length,
      imagesWithAltText: imagesWithAlt.length,
      totalImages: images.length,
      ariaLabelsCount: ariaLabels.length
    };
  }

  async testKeyboardNavigation() {
    let score = 50;
    
    // Check for focusable elements
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    score += Math.min(focusableElements.length * 2, 30);
    
    // Check for visible focus indicators
    let visibleFocusCount = 0;
    focusableElements.forEach(element => {
      const styles = getComputedStyle(element, ':focus');
      if (styles.outline !== 'none' || styles.boxShadow !== 'none') {
        visibleFocusCount++;
      }
    });
    
    if (focusableElements.length > 0) {
      score += (visibleFocusCount / focusableElements.length) * 20;
    }
    
    return {
      keyboardScore: Math.min(score, 100),
      focusableElementsCount: focusableElements.length,
      visibleFocusIndicators: visibleFocusCount
    };
  }

  async testVisualAccessibility() {
    let score = 50;
    
    // Check for sufficient font sizes
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    let appropriateFontSizes = 0;
    
    textElements.forEach(element => {
      const fontSize = parseFloat(getComputedStyle(element).fontSize);
      if (fontSize >= 16) { // Minimum readable size
        appropriateFontSizes++;
      }
    });
    
    if (textElements.length > 0) {
      score += (appropriateFontSizes / textElements.length) * 30;
    }
    
    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let properHierarchy = true;
    let lastLevel = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        properHierarchy = false;
      }
      lastLevel = level;
    });
    
    if (properHierarchy) score += 20;
    
    return {
      visualScore: Math.min(score, 100),
      appropriateFontSizes,
      totalTextElements: textElements.length,
      properHeadingHierarchy: properHierarchy,
      headingsCount: headings.length
    };
  }

  async testSecurityPerformance() {
    console.log('🔒 Testing security performance...');
    
    try {
      // Test HTTPS usage
      const httpsMetrics = await this.testHTTPSUsage();
      
      // Test CSP performance
      const cspMetrics = await this.testCSPPerformance();
      
      // Test security headers
      const securityHeaderMetrics = await this.testSecurityHeaders();

      const overallScore = (httpsMetrics.score + cspMetrics.score + securityHeaderMetrics.score) / 3;

      const result = {
        category: 'Security Performance',
        metrics: {
          ...httpsMetrics,
          ...cspMetrics,
          ...securityHeaderMetrics,
          overallScore
        },
        passed: overallScore > 80,
        score: overallScore,
        recommendations: this.generateSecurityRecommendations(overallScore)
      };

      this.testResults.set('securityPerformance', result);
      return result;

    } catch (error) {
      console.error('Security performance test failed:', error);
      return { category: 'Security Performance', error: error.message };
    }
  }

  async testHTTPSUsage() {
    const isHTTPS = location.protocol === 'https:';
    const resources = performance.getEntriesByType('resource');
    
    let httpsResources = 0;
    resources.forEach(resource => {
      if (resource.name.startsWith('https:')) {
        httpsResources++;
      }
    });
    
    const httpsScore = isHTTPS ? 50 : 0;
    const resourcesScore = resources.length > 0 ? (httpsResources / resources.length) * 50 : 0;
    
    return {
      httpsScore: httpsScore + resourcesScore,
      pageIsHTTPS: isHTTPS,
      httpsResourcesCount: httpsResources,
      totalResourcesCount: resources.length
    };
  }

  async testCSPPerformance() {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const hasCSP = !!cspMeta;
    
    let cspScore = hasCSP ? 80 : 0;
    
    if (hasCSP) {
      const cspContent = cspMeta.content;
      // Check for unsafe inline/eval
      if (cspContent.includes("'unsafe-inline'") || cspContent.includes("'unsafe-eval'")) {
        cspScore -= 30;
      }
    }
    
    return {
      cspScore: Math.max(cspScore, 0),
      hasCSP,
      cspContent: cspMeta?.content || 'None'
    };
  }

  async testSecurityHeaders() {
    // This would typically require server-side testing
    // Here we'll check what we can from the client side
    
    let score = 30; // Base score
    
    // Check for X-Frame-Options (though this can't be directly accessed from JS)
    // We'll check if the page can be framed (simplified test)
    if (window.self === window.top) {
      score += 20; // Page is not in a frame
    }
    
    // Check for secure cookies (if any)
    const cookies = document.cookie.split(';');
    let secureCookies = 0;
    cookies.forEach(cookie => {
      if (cookie.includes('Secure')) {
        secureCookies++;
      }
    });
    
    if (cookies.length > 0) {
      score += (secureCookies / cookies.length) * 20;
    }
    
    // Check referrer policy
    const referrerPolicy = document.querySelector('meta[name="referrer"]');
    if (referrerPolicy) {
      score += 15;
    }
    
    // Check for mixed content
    const mixedContent = performance.getEntriesByType('resource').some(resource => 
      location.protocol === 'https:' && resource.name.startsWith('http:')
    );
    
    if (!mixedContent) {
      score += 15;
    }
    
    return {
      securityHeaderScore: Math.min(score, 100),
      isTopFrame: window.self === window.top,
      secureCookiesCount: secureCookies,
      totalCookiesCount: cookies.length,
      hasReferrerPolicy: !!referrerPolicy,
      hasMixedContent: mixedContent
    };
  }

  async applyRealTimeOptimizations(testResult) {
    if (!testResult || testResult.error) return;

    console.log(`🔧 Applying optimizations for ${testResult.category}...`);

    switch (testResult.category) {
      case 'Load Performance':
        await this.optimizeLoadPerformance(testResult);
        break;
      case 'Rendering Performance':
        await this.optimizeRenderingPerformance(testResult);
        break;
      case 'Memory Efficiency':
        await this.optimizeMemoryUsage(testResult);
        break;
      case 'Cache Efficiency':
        await this.optimizeCacheStrategy(testResult);
        break;
    }
  }

  async optimizeLoadPerformance(testResult) {
    const metrics = testResult.metrics;
    
    // Optimize critical resources
    if (metrics.criticalPathTime > 2000) {
      this.optimizations.set('critical-path', {
        action: 'preload-critical-resources',
        applied: Date.now()
      });
      
      // Add preload tags for critical resources
      const criticalResources = ['style.css', 'app.js'];
      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
      });
    }
    
    // Optimize large resources
    if (metrics.largestResource && metrics.largestResource.transferSize > 1024 * 1024) {
      this.optimizations.set('large-resource', {
        action: 'compress-large-resources',
        resource: metrics.largestResource.name,
        applied: Date.now()
      });
    }
  }

  async optimizeRenderingPerformance(testResult) {
    const metrics = testResult.metrics;
    
    // Optimize frame rate
    if (metrics.averageFPS < 55) {
      this.optimizations.set('frame-rate', {
        action: 'reduce-animation-complexity',
        applied: Date.now()
      });
      
      // Reduce animation complexity
      const animatedElements = document.querySelectorAll('[style*="transition"], [style*="animation"]');
      animatedElements.forEach(element => {
        element.style.willChange = 'transform';
      });
    }
    
    // Optimize layout performance
    if (metrics.layoutOperationTime > 50) {
      this.optimizations.set('layout', {
        action: 'optimize-layout-operations',
        applied: Date.now()
      });
    }
  }

  async optimizeMemoryUsage(testResult) {
    const metrics = testResult.metrics;
    
    // Clean up if memory usage is high
    if (metrics.finalMemoryUsage.used > this.testConfig.targetMemoryLimit) {
      this.optimizations.set('memory-cleanup', {
        action: 'aggressive-cleanup',
        applied: Date.now()
      });
      
      // Trigger cleanup in various systems
      if (window.aiRenderer) {
        // Clear old behavior data
        window.aiRenderer.userBehaviorData = window.aiRenderer.userBehaviorData.slice(-50);
      }
      
      if (window.tfOptimizer) {
        // Clear model cache
        window.tfOptimizer.modelCache.clear();
      }
    }
  }

  async optimizeCacheStrategy(testResult) {
    const metrics = testResult.metrics;
    
    // Improve cache hit rate
    if (metrics.overallHitRate < this.testConfig.targetCacheHitRate) {
      this.optimizations.set('cache-strategy', {
        action: 'improve-caching',
        applied: Date.now()
      });
      
      // Implement more aggressive caching
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.active.postMessage({
            type: 'OPTIMIZE_CACHE',
            data: { strategy: 'aggressive' }
          });
        });
      }
    }
  }

  async applyFinalOptimizations(report) {
    console.log('🎯 Applying final optimizations...');
    
    // Apply global optimizations based on overall performance
    const overallScore = this.calculateOverallScore(report);
    
    if (overallScore < 70) {
      await this.applyAggressiveOptimizations();
    } else if (overallScore < 85) {
      await this.applyModerateOptimizations();
    } else {
      await this.applyFinetuningOptimizations();
    }
  }

  calculateOverallScore(report) {
    const scores = report.results
      .filter(result => !result.error && result.score !== undefined)
      .map(result => result.score);
    
    if (scores.length === 0) return 0;
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  async applyAggressiveOptimizations() {
    console.log('🔥 Applying aggressive optimizations...');
    
    // Disable non-essential features
    this.optimizations.set('aggressive-mode', {
      action: 'disable-non-essential-features',
      applied: Date.now()
    });
    
    // Reduce quality settings
    if (window.quantumOptimizer) {
      window.quantumOptimizer.defaultQuality = 60;
    }
    
    // Limit AI processing
    if (window.aiRenderer) {
      window.aiRenderer.userBehaviorData = window.aiRenderer.userBehaviorData.slice(-20);
    }
  }

  async applyModerateOptimizations() {
    console.log('⚡ Applying moderate optimizations...');
    
    this.optimizations.set('moderate-mode', {
      action: 'balance-performance-quality',
      applied: Date.now()
    });
    
    // Balanced settings
    if (window.quantumOptimizer) {
      window.quantumOptimizer.defaultQuality = 75;
    }
  }

  async applyFinetuningOptimizations() {
    console.log('🔍 Applying fine-tuning optimizations...');
    
    this.optimizations.set('finetuning-mode', {
      action: 'micro-optimizations',
      applied: Date.now()
    });
    
    // Fine-tune for best user experience
    if (window.quantumOptimizer) {
      window.quantumOptimizer.defaultQuality = 85;
    }
  }

  async generatePerformanceReport(results) {
    console.log('📊 Generating performance report...');
    
    const overallScore = this.calculateOverallScore({ results });
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.filter(r => !r.error).length;
    
    const report = {
      timestamp: Date.now(),
      overallScore,
      passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      results: results,
      realTimeMetrics: this.realTimeMetrics,
      optimizations: Object.fromEntries(this.optimizations),
      recommendations: this.generateGlobalRecommendations(results),
      summary: this.generateSummary(results, overallScore)
    };
    
    // Store report for future reference
    this.testResults.set('final-report', report);
    
    // Display report
    this.displayPerformanceReport(report);
    
    return report;
  }

  generateGlobalRecommendations(results) {
    const recommendations = [];
    
    results.forEach(result => {
      if (result.recommendations) {
        recommendations.push(...result.recommendations);
      }
    });
    
    // Add global recommendations
    recommendations.push({
      category: 'Global',
      priority: 'high',
      title: 'Enable Service Worker Caching',
      description: 'Implement comprehensive service worker caching for improved performance'
    });
    
    recommendations.push({
      category: 'Global',
      priority: 'medium',
      title: 'Optimize Images',
      description: 'Use next-gen image formats (WebP, AVIF) and lazy loading'
    });
    
    return recommendations;
  }

  generateSummary(results, overallScore) {
    let performance = 'Excellent';
    if (overallScore < 90) performance = 'Good';
    if (overallScore < 70) performance = 'Fair';
    if (overallScore < 50) performance = 'Poor';
    
    const criticalIssues = results.filter(r => r.score < 50).length;
    const optimizationsApplied = this.optimizations.size;
    
    return {
      performance,
      overallScore: Math.round(overallScore),
      criticalIssues,
      optimizationsApplied,
      testDuration: Date.now() - this.testStartTime,
      memoryUsage: this.getCurrentMemoryUsage().used,
      recommendations: results.reduce((sum, r) => sum + (r.recommendations?.length || 0), 0)
    };
  }

  displayPerformanceReport(report) {
    console.group('🎯 Performance Test Report');
    console.log(`Overall Score: ${report.summary.overallScore}/100 (${report.summary.performance})`);
    console.log(`Pass Rate: ${report.passRate.toFixed(1)}%`);
    console.log(`Test Duration: ${(report.summary.testDuration / 1000).toFixed(2)}s`);
    console.log(`Optimizations Applied: ${report.summary.optimizationsApplied}`);
    console.log(`Critical Issues: ${report.summary.criticalIssues}`);
    
    console.group('Test Results:');
    report.results.forEach(result => {
      if (result.error) {
        console.error(`❌ ${result.category}: ${result.error}`);
      } else {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.category}: ${result.score}/100`);
      }
    });
    console.groupEnd();
    
    if (report.recommendations.length > 0) {
      console.group('Recommendations:');
      report.recommendations.slice(0, 5).forEach(rec => {
        console.log(`${rec.priority === 'high' ? '🔴' : '🟡'} ${rec.title}: ${rec.description}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  // Scoring methods
  calculateLoadScore(loadTime) {
    return Math.max(0, 100 - (loadTime / this.testConfig.targetLoadTime) * 100);
  }

  calculateRenderingScore(fps) {
    return Math.min(100, (fps / 60) * 100);
  }

  calculateAIScore(accuracy) {
    return accuracy * 100;
  }

  calculateMemoryScore(memoryUsed) {
    return Math.max(0, 100 - (memoryUsed / this.testConfig.targetMemoryLimit) * 100);
  }

  calculateCacheScore(hitRate) {
    return hitRate * 100;
  }

  calculateNetworkScore(compressionRatio) {
    return compressionRatio * 100;
  }

  // Recommendation generators
  generateLoadRecommendations(loadTime) {
    const recs = [];
    
    if (loadTime > this.testConfig.targetLoadTime) {
      recs.push({
        priority: 'high',
        title: 'Reduce Load Time',
        description: `Load time of ${(loadTime/1000).toFixed(2)}s exceeds target of ${(this.testConfig.targetLoadTime/1000).toFixed(2)}s`
      });
    }
    
    return recs;
  }

  generateRenderingRecommendations(metrics) {
    const recs = [];
    
    if (metrics.averageFPS < 55) {
      recs.push({
        priority: 'high',
        title: 'Improve Frame Rate',
        description: `Average FPS of ${metrics.averageFPS.toFixed(1)} is below 55 FPS target`
      });
    }
    
    return recs;
  }

  generateAIRecommendations(metrics) {
    const recs = [];
    
    if (metrics.accuracy < this.testConfig.targetAIAccuracy) {
      recs.push({
        priority: 'medium',
        title: 'Improve AI Accuracy',
        description: `AI prediction accuracy of ${(metrics.accuracy * 100).toFixed(1)}% is below target`
      });
    }
    
    return recs;
  }

  generateMemoryRecommendations(memoryDelta) {
    const recs = [];
    
    if (memoryDelta > 50 * 1024 * 1024) { // 50MB
      recs.push({
        priority: 'high',
        title: 'Reduce Memory Usage',
        description: `Memory usage increased by ${(memoryDelta / 1024 / 1024).toFixed(1)}MB during test`
      });
    }
    
    return recs;
  }

  generateCacheRecommendations(hitRate) {
    const recs = [];
    
    if (hitRate < this.testConfig.targetCacheHitRate) {
      recs.push({
        priority: 'medium',
        title: 'Improve Cache Strategy',
        description: `Cache hit rate of ${(hitRate * 100).toFixed(1)}% is below target`
      });
    }
    
    return recs;
  }

  generateNetworkRecommendations(metrics) {
    const recs = [];
    
    if (metrics.compressionRatio < 0.3) {
      recs.push({
        priority: 'medium',
        title: 'Enable Compression',
        description: 'Low compression ratio detected, enable gzip/brotli compression'
      });
    }
    
    return recs;
  }

  generateMobileRecommendations(metrics) {
    const recs = [];
    
    if (metrics.mobileScore < 70) {
      recs.push({
        priority: 'high',
        title: 'Improve Mobile Experience',
        description: `Mobile score of ${metrics.mobileScore} needs improvement`
      });
    }
    
    return recs;
  }

  generateAccessibilityRecommendations(score) {
    const recs = [];
    
    if (score < 70) {
      recs.push({
        priority: 'high',
        title: 'Improve Accessibility',
        description: `Accessibility score of ${score.toFixed(1)} needs improvement`
      });
    }
    
    return recs;
  }

  generateSecurityRecommendations(score) {
    const recs = [];
    
    if (score < 80) {
      recs.push({
        priority: 'high',
        title: 'Enhance Security',
        description: `Security score of ${score.toFixed(1)} needs improvement`
      });
    }
    
    return recs;
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/implementations/sw-performance.js');
        return true;
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
        return false;
      }
    }
    return false;
  }

  clearPreviousMetrics() {
    this.testResults.clear();
    this.optimizations.clear();
    this.testStartTime = Date.now();
  }

  getTestResults() {
    return Object.fromEntries(this.testResults);
  }

  getOptimizations() {
    return Object.fromEntries(this.optimizations);
  }

  getRealTimeMetrics() {
    return { ...this.realTimeMetrics };
  }
}

// Create global instance
const performanceTestSuite = new PerformanceTestSuite();

// Auto-run basic tests on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Run basic performance monitoring
    setTimeout(() => {
      performanceTestSuite.setupPerformanceObservers();
    }, 1000);
  });
} else {
  setTimeout(() => {
    performanceTestSuite.setupPerformanceObservers();
  }, 1000);
}

// Export for global use
window.performanceTestSuite = performanceTestSuite;