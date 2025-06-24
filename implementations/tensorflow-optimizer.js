// Lightweight TensorFlow.js Dynamic Loader and Optimizer
class TensorFlowOptimizer {
  constructor() {
    this.modelCache = new Map();
    this.loadingPromises = new Map();
    this.isLoaded = false;
    this.modelWorker = null;
    this.performanceMetrics = {
      loadTime: 0,
      inferenceTime: 0,
      memoryUsage: 0
    };
  }

  async initialize(options = {}) {
    const startTime = performance.now();
    
    try {
      // Progressive loading strategy
      await this.loadTensorFlowCore();
      
      // Load backend based on device capabilities
      await this.loadOptimalBackend();
      
      // Initialize model worker for background processing
      await this.initializeModelWorker();
      
      this.performanceMetrics.loadTime = performance.now() - startTime;
      this.isLoaded = true;
      
      console.log(`TensorFlow.js loaded in ${this.performanceMetrics.loadTime.toFixed(2)}ms`);
      
      // Warm up with a dummy inference
      await this.warmUp();
      
    } catch (error) {
      console.error('TensorFlow.js initialization failed:', error);
      throw error;
    }
  }

  async loadTensorFlowCore() {
    // Check if already loaded
    if (typeof tf !== 'undefined') {
      return;
    }

    // Dynamic import with version optimization
    const tfVersion = this.selectOptimalTFVersion();
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@${tfVersion}/dist/tf.min.js`;
      script.async = true;
      script.onload = () => {
        console.log(`TensorFlow.js ${tfVersion} core loaded`);
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load TensorFlow.js core'));
      };
      document.head.appendChild(script);
    });
  }

  selectOptimalTFVersion() {
    // Select version based on browser capabilities
    const hasWebGL = this.checkWebGLSupport();
    const hasWebGPU = this.checkWebGPUSupport();
    const isModernBrowser = this.checkModernBrowserFeatures();
    
    if (hasWebGPU && isModernBrowser) {
      return '4.15.0'; // Latest with WebGPU support
    } else if (hasWebGL && isModernBrowser) {
      return '4.10.0'; // Stable with WebGL optimization
    } else {
      return '3.21.0'; // Lightweight version for older browsers
    }
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  checkWebGPUSupport() {
    return 'gpu' in navigator && navigator.gpu !== undefined;
  }

  checkModernBrowserFeatures() {
    return 'IntersectionObserver' in window &&
           'requestIdleCallback' in window &&
           'OffscreenCanvas' in window;
  }

  async loadOptimalBackend() {
    const backends = await this.detectOptimalBackends();
    
    for (const backend of backends) {
      try {
        await this.loadBackend(backend);
        await tf.setBackend(backend);
        console.log(`Using TensorFlow.js backend: ${backend}`);
        break;
      } catch (error) {
        console.warn(`Failed to load backend ${backend}:`, error);
        continue;
      }
    }
  }

  async detectOptimalBackends() {
    const deviceCapabilities = await this.analyzeDeviceCapabilities();
    
    if (deviceCapabilities.webgpu) {
      return ['webgpu', 'webgl', 'cpu'];
    } else if (deviceCapabilities.webgl && deviceCapabilities.gpuTier >= 2) {
      return ['webgl', 'cpu'];
    } else if (deviceCapabilities.webgl) {
      return ['webgl', 'cpu'];
    } else {
      return ['cpu'];
    }
  }

  async analyzeDeviceCapabilities() {
    const capabilities = {
      webgpu: false,
      webgl: false,
      gpuTier: 0,
      memoryMB: 0,
      cpuCores: navigator.hardwareConcurrency || 4
    };

    // Check WebGPU
    if ('gpu' in navigator) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        capabilities.webgpu = !!adapter;
      } catch (e) {
        capabilities.webgpu = false;
      }
    }

    // Check WebGL and estimate GPU tier
    capabilities.webgl = this.checkWebGLSupport();
    if (capabilities.webgl) {
      capabilities.gpuTier = await this.estimateGPUTier();
    }

    // Estimate memory
    if ('memory' in performance) {
      capabilities.memoryMB = Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024));
    } else {
      capabilities.memoryMB = 2048; // Conservative estimate
    }

    return capabilities;
  }

  async estimateGPUTier() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      
      if (!gl) return 0;
      
      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      
      // Simple GPU tier estimation
      if (renderer.includes('NVIDIA') || renderer.includes('AMD')) {
        return renderer.includes('RTX') || renderer.includes('RX') ? 3 : 2;
      } else if (renderer.includes('Intel')) {
        return renderer.includes('Iris') ? 2 : 1;
      } else {
        return 1; // Mobile or integrated GPU
      }
    } catch (e) {
      return 0;
    }
  }

  async loadBackend(backend) {
    const backendUrls = {
      webgpu: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgpu@4.15.0/dist/tf-backend-webgpu.min.js',
      webgl: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.15.0/dist/tf-backend-webgl.min.js',
      cpu: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-cpu@4.15.0/dist/tf-backend-cpu.min.js'
    };

    if (!backendUrls[backend]) {
      throw new Error(`Unknown backend: ${backend}`);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = backendUrls[backend];
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${backend} backend`));
      document.head.appendChild(script);
    });
  }

  async initializeModelWorker() {
    // Create dedicated worker for model operations
    const workerCode = `
      let tf;
      let model;
      
      importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0/dist/tf.min.js');
      
      self.onmessage = async function(e) {
        const { type, data } = e.data;
        
        try {
          switch (type) {
            case 'LOAD_MODEL':
              model = await tf.loadLayersModel(data.modelUrl);
              self.postMessage({ type: 'MODEL_LOADED', success: true });
              break;
              
            case 'PREDICT':
              if (!model) {
                throw new Error('Model not loaded');
              }
              const tensor = tf.tensor(data.input);
              const prediction = await model.predict(tensor).data();
              tensor.dispose();
              self.postMessage({ 
                type: 'PREDICTION_RESULT', 
                result: Array.from(prediction) 
              });
              break;
              
            case 'DISPOSE':
              if (model) {
                model.dispose();
                model = null;
              }
              break;
          }
        } catch (error) {
          self.postMessage({ 
            type: 'ERROR', 
            error: error.message 
          });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.modelWorker = new Worker(URL.createObjectURL(blob));
    
    return new Promise((resolve) => {
      this.modelWorker.onmessage = (e) => {
        if (e.data.type === 'MODEL_LOADED') {
          resolve();
        }
      };
    });
  }

  async warmUp() {
    if (!this.isLoaded) return;
    
    const startTime = performance.now();
    
    try {
      // Create a simple warm-up computation
      const warmupTensor = tf.randomNormal([1, 10]);
      const result = tf.matMul(warmupTensor, tf.transpose(warmupTensor));
      await result.data();
      
      // Cleanup
      warmupTensor.dispose();
      result.dispose();
      
      console.log(`TensorFlow.js warm-up completed in ${(performance.now() - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.warn('Warm-up failed:', error);
    }
  }

  async loadModel(modelUrl, options = {}) {
    if (this.modelCache.has(modelUrl)) {
      return this.modelCache.get(modelUrl);
    }

    if (this.loadingPromises.has(modelUrl)) {
      return this.loadingPromises.get(modelUrl);
    }

    const loadPromise = this.loadModelInternal(modelUrl, options);
    this.loadingPromises.set(modelUrl, loadPromise);
    
    try {
      const model = await loadPromise;
      this.modelCache.set(modelUrl, model);
      this.loadingPromises.delete(modelUrl);
      return model;
    } catch (error) {
      this.loadingPromises.delete(modelUrl);
      throw error;
    }
  }

  async loadModelInternal(modelUrl, options) {
    const startTime = performance.now();
    
    try {
      // Load model with optimizations
      const model = await tf.loadLayersModel(modelUrl, {
        ...options,
        onProgress: (fraction) => {
          if (options.onProgress) {
            options.onProgress(fraction);
          }
        }
      });

      // Optimize model for inference
      if (options.optimize !== false) {
        await this.optimizeModel(model);
      }

      const loadTime = performance.now() - startTime;
      console.log(`Model loaded in ${loadTime.toFixed(2)}ms`);
      
      return model;
    } catch (error) {
      console.error('Model loading failed:', error);
      throw error;
    }
  }

  async optimizeModel(model) {
    try {
      // Quantize weights if supported
      if (tf.quantization && model.quantizeWeights) {
        await model.quantizeWeights();
      }

      // Prune small weights
      if (tf.prune && model.prune) {
        await model.prune(0.1); // Remove weights < 0.1
      }
      
      console.log('Model optimization completed');
    } catch (error) {
      console.warn('Model optimization failed:', error);
    }
  }

  async predict(input, options = {}) {
    if (!this.isLoaded) {
      throw new Error('TensorFlow.js not loaded');
    }

    const startTime = performance.now();
    
    try {
      let result;
      
      if (options.useWorker && this.modelWorker) {
        result = await this.predictWithWorker(input);
      } else {
        result = await this.predictDirect(input, options);
      }
      
      this.performanceMetrics.inferenceTime = performance.now() - startTime;
      
      return result;
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    }
  }

  async predictWithWorker(input) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker prediction timeout'));
      }, 5000);

      const handler = (e) => {
        clearTimeout(timeout);
        this.modelWorker.removeEventListener('message', handler);
        
        if (e.data.type === 'PREDICTION_RESULT') {
          resolve(e.data.result);
        } else if (e.data.type === 'ERROR') {
          reject(new Error(e.data.error));
        }
      };

      this.modelWorker.addEventListener('message', handler);
      this.modelWorker.postMessage({
        type: 'PREDICT',
        data: { input }
      });
    });
  }

  async predictDirect(input, options) {
    const tensor = tf.tensor(input);
    
    try {
      const prediction = await options.model.predict(tensor);
      const result = await prediction.data();
      prediction.dispose();
      return Array.from(result);
    } finally {
      tensor.dispose();
    }
  }

  createLightweightModel(inputShape, outputSize) {
    // Create optimized model for user behavior prediction
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: inputShape,
          units: Math.min(32, inputShape[0] * 2),
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: Math.min(16, outputSize * 2),
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dense({
          units: outputSize,
          activation: 'softmax'
        })
      ]
    });

    // Use lightweight optimizer
    model.compile({
      optimizer: tf.train.rmsprop(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async trainOnUserData(trainingData, options = {}) {
    if (!this.isLoaded) {
      throw new Error('TensorFlow.js not loaded');
    }

    const { inputs, labels } = trainingData;
    const model = options.model || this.createLightweightModel([inputs[0].length], labels[0].length);

    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(labels);

    try {
      const history = await model.fit(xs, ys, {
        epochs: options.epochs || 10,
        batchSize: options.batchSize || 32,
        validationSplit: options.validationSplit || 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (options.onProgress) {
              options.onProgress(epoch, logs);
            }
          }
        }
      });

      return { model, history };
    } finally {
      xs.dispose();
      ys.dispose();
    }
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      memoryUsage: tf.memory().numBytes,
      backend: tf.getBackend(),
      modelsCached: this.modelCache.size
    };
  }

  dispose() {
    // Clean up models
    this.modelCache.forEach(model => model.dispose());
    this.modelCache.clear();
    
    // Terminate worker
    if (this.modelWorker) {
      this.modelWorker.terminate();
      this.modelWorker = null;
    }
    
    // Clean up TensorFlow.js
    if (typeof tf !== 'undefined') {
      tf.disposeVariables();
    }
  }
}

// Singleton instance
const tfOptimizer = new TensorFlowOptimizer();

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    tfOptimizer.initialize();
  });
} else {
  tfOptimizer.initialize();
}

// Export for global use
window.tfOptimizer = tfOptimizer;