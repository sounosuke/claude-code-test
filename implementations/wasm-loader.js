// WebAssembly Module Loader and Optimizer
class WASMImageProcessor {
  constructor() {
    this.module = null;
    this.processor = null;
    this.isLoaded = false;
    this.loadingPromise = null;
    this.performanceMetrics = {
      loadTime: 0,
      processingTime: 0,
      compressionRatio: 0
    };
  }

  async initialize(options = {}) {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadWASMModule(options);
    return this.loadingPromise;
  }

  async loadWASMModule(options) {
    const startTime = performance.now();
    
    try {
      // Progressive loading - check for cached version first
      const cachedModule = await this.loadFromCache();
      if (cachedModule) {
        this.module = cachedModule;
      } else {
        // Load from network with optimization
        this.module = await this.loadFromNetwork(options);
        await this.saveToCache(this.module);
      }

      // Initialize processor instance
      this.processor = new this.module.ImageProcessor();
      
      this.performanceMetrics.loadTime = performance.now() - startTime;
      this.isLoaded = true;
      
      console.log(`WASM module loaded in ${this.performanceMetrics.loadTime.toFixed(2)}ms`);
      
      // Warm up the module
      await this.warmUp();
      
      return true;
    } catch (error) {
      console.error('WASM module loading failed:', error);
      this.loadingPromise = null;
      throw error;
    }
  }

  async loadFromCache() {
    try {
      const cache = await caches.open('wasm-modules-v1');
      const response = await cache.match('/wasm/image-processor.wasm');
      
      if (response) {
        const wasmBytes = await response.arrayBuffer();
        const module = await WebAssembly.instantiate(wasmBytes);
        console.log('WASM module loaded from cache');
        return module;
      }
    } catch (error) {
      console.warn('Cache loading failed:', error);
    }
    
    return null;
  }

  async loadFromNetwork(options) {
    // Determine optimal WASM file based on device capabilities
    const wasmUrl = this.selectOptimalWASMFile();
    
    const response = await fetch(wasmUrl, {
      mode: 'cors',
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM: ${response.status}`);
    }

    const wasmBytes = await response.arrayBuffer();
    
    // Instantiate with optimized imports
    const importObject = this.createImportObject(options);
    const module = await WebAssembly.instantiate(wasmBytes, importObject);
    
    console.log('WASM module loaded from network');
    return module;
  }

  selectOptimalWASMFile() {
    // Select WASM file based on browser capabilities
    const features = this.detectWASMFeatures();
    
    if (features.simd && features.threads) {
      return '/wasm/image-processor-simd-threads.wasm';
    } else if (features.simd) {
      return '/wasm/image-processor-simd.wasm';
    } else if (features.threads) {
      return '/wasm/image-processor-threads.wasm';
    } else {
      return '/wasm/image-processor.wasm';
    }
  }

  detectWASMFeatures() {
    const features = {
      simd: false,
      threads: false,
      bulkMemory: false,
      multiValue: false
    };

    try {
      // Check SIMD support
      WebAssembly.validate(new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
        0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b,
        0x03, 0x02, 0x01, 0x00,
        0x0a, 0x0a, 0x01, 0x08, 0x00, 0x41, 0x00, 0xfd, 0x0f, 0x0b
      ]));
      features.simd = true;
    } catch (e) {
      features.simd = false;
    }

    // Check threads support
    features.threads = typeof SharedArrayBuffer !== 'undefined' && 
                      typeof Worker !== 'undefined';

    // Check bulk memory operations
    try {
      WebAssembly.validate(new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
        0x01, 0x04, 0x01, 0x60, 0x00, 0x00,
        0x03, 0x02, 0x01, 0x00,
        0x0a, 0x07, 0x01, 0x05, 0x00, 0xfc, 0x08, 0x00, 0x00, 0x0b
      ]));
      features.bulkMemory = true;
    } catch (e) {
      features.bulkMemory = false;
    }

    return features;
  }

  createImportObject(options) {
    return {
      env: {
        memory: new WebAssembly.Memory({ 
          initial: options.initialMemory || 256,
          maximum: options.maxMemory || 2048,
          shared: this.detectWASMFeatures().threads
        }),
        
        // Math functions
        sin: Math.sin,
        cos: Math.cos,
        exp: Math.exp,
        log: Math.log,
        sqrt: Math.sqrt,
        pow: Math.pow,
        
        // Performance monitoring
        performance_now: () => performance.now(),
        
        // Console logging for debugging
        console_log: (ptr, len) => {
          const memory = new Uint8Array(this.module.instance.exports.memory.buffer);
          const message = new TextDecoder().decode(memory.slice(ptr, ptr + len));
          console.log('[WASM]', message);
        },
        
        // Error reporting
        report_error: (code, ptr, len) => {
          const memory = new Uint8Array(this.module.instance.exports.memory.buffer);
          const message = new TextDecoder().decode(memory.slice(ptr, ptr + len));
          console.error(`[WASM Error ${code}]`, message);
        }
      },
      
      wasi_snapshot_preview1: {
        // WASI stub functions
        proc_exit: () => {},
        fd_write: () => 0,
        fd_close: () => 0,
        environ_sizes_get: () => 0,
        environ_get: () => 0
      }
    };
  }

  async saveToCache(module) {
    try {
      const cache = await caches.open('wasm-modules-v1');
      const wasmUrl = this.selectOptimalWASMFile();
      const response = await fetch(wasmUrl);
      await cache.put('/wasm/image-processor.wasm', response);
    } catch (error) {
      console.warn('Failed to cache WASM module:', error);
    }
  }

  async warmUp() {
    if (!this.isLoaded) return;

    try {
      // Create a small test image
      const testData = new Uint8Array(64 * 64 * 4).fill(128);
      const dataPtr = this.allocateMemory(testData.length);
      
      // Copy test data to WASM memory
      const memory = new Uint8Array(this.module.instance.exports.memory.buffer);
      memory.set(testData, dataPtr);
      
      // Load and process test image
      this.processor.loadImage(dataPtr, testData.length, 64, 64, 4);
      const result = this.processor.encodeWebP(80);
      
      // Clean up
      this.deallocateMemory(dataPtr);
      
      console.log('WASM module warmed up successfully');
    } catch (error) {
      console.warn('WASM warm-up failed:', error);
    }
  }

  async processImage(imageData, options = {}) {
    if (!this.isLoaded) {
      await this.initialize();
    }

    const startTime = performance.now();
    
    try {
      const {
        format = 'auto',
        quality = 80,
        resize = null,
        networkSpeed = 10,
        devicePixelRatio = window.devicePixelRatio || 1,
        batteryLevel = 100,
        preferQuality = false
      } = options;

      // Analyze image
      const { width, height, channels } = this.analyzeImageData(imageData);
      
      // Allocate WASM memory
      const dataPtr = this.allocateMemory(imageData.length);
      const memory = new Uint8Array(this.module.instance.exports.memory.buffer);
      memory.set(new Uint8Array(imageData), dataPtr);
      
      // Load image into processor
      this.processor.loadImage(dataPtr, imageData.length, width, height, channels);
      
      // Resize if needed
      let processedData;
      if (resize) {
        const resizeAlgorithm = this.selectResizeAlgorithm(resize.width, resize.height, options);
        processedData = this.processor.resize(resize.width, resize.height, resizeAlgorithm);
      }
      
      // Select optimal format
      const selectedFormat = format === 'auto' 
        ? this.processor.selectOptimalFormat(networkSpeed, devicePixelRatio, batteryLevel, preferQuality)
        : format;
      
      // Encode image
      let result;
      switch (selectedFormat) {
        case 'webp':
          result = this.processor.encodeWebP(quality, options.lossless || false);
          break;
        case 'avif':
          result = this.processor.encodeAVIF(quality);
          break;
        case 'jpegxl':
          result = this.processor.encodeJPEGXL(quality);
          break;
        default:
          result = this.processor.encodeWebP(quality);
      }
      
      // Clean up memory
      this.deallocateMemory(dataPtr);
      
      // Calculate metrics
      const processingTime = performance.now() - startTime;
      const compressionRatio = imageData.length / result.length;
      
      this.performanceMetrics = {
        ...this.performanceMetrics,
        processingTime,
        compressionRatio
      };
      
      console.log(`Image processed in ${processingTime.toFixed(2)}ms, compression: ${compressionRatio.toFixed(2)}x`);
      
      return {
        data: result,
        format: selectedFormat,
        originalSize: imageData.length,
        compressedSize: result.length,
        compressionRatio,
        processingTime
      };
      
    } catch (error) {
      console.error('Image processing failed:', error);
      throw error;
    }
  }

  analyzeImageData(imageData) {
    // Simple image analysis - in real scenario, use proper image headers
    const dataLength = imageData.length;
    
    // Estimate dimensions (assumes square RGBA for simplicity)
    const pixelCount = dataLength / 4;
    const dimension = Math.sqrt(pixelCount);
    
    return {
      width: Math.floor(dimension),
      height: Math.floor(dimension),
      channels: 4
    };
  }

  selectResizeAlgorithm(targetWidth, targetHeight, options) {
    const { quality = 'high', speed = 'medium' } = options;
    
    // Select algorithm based on requirements
    if (quality === 'high' && speed !== 'fast') {
      return 'lanczos';
    } else if (quality === 'medium') {
      return 'bicubic';
    } else {
      return 'bilinear';
    }
  }

  allocateMemory(size) {
    if (!this.module || !this.module.instance.exports.malloc) {
      throw new Error('WASM module not loaded or malloc not available');
    }
    
    return this.module.instance.exports.malloc(size);
  }

  deallocateMemory(ptr) {
    if (this.module && this.module.instance.exports.free) {
      this.module.instance.exports.free(ptr);
    }
  }

  // Batch processing for multiple images
  async processBatch(images, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 4;
    
    // Process in batches to avoid memory issues
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const batchPromises = batch.map(imageData => 
        this.processImage(imageData, { ...options, useCache: true })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Allow other tasks to run
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return results;
  }

  // Performance monitoring
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      isLoaded: this.isLoaded,
      memoryUsage: this.getMemoryUsage(),
      features: this.detectWASMFeatures()
    };
  }

  getMemoryUsage() {
    if (!this.module || !this.module.instance.exports.memory) {
      return 0;
    }
    
    return this.module.instance.exports.memory.buffer.byteLength;
  }

  // Clean up resources
  dispose() {
    if (this.processor) {
      // Call destructor if available
      if (this.processor.destructor) {
        this.processor.destructor();
      }
      this.processor = null;
    }
    
    this.module = null;
    this.isLoaded = false;
    this.loadingPromise = null;
  }
}

// Create singleton instance
const wasmProcessor = new WASMImageProcessor();

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    wasmProcessor.initialize();
  });
} else if (document.readyState === 'interactive') {
  // Initialize with idle callback to avoid blocking
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => wasmProcessor.initialize());
  } else {
    setTimeout(() => wasmProcessor.initialize(), 100);
  }
}

// Export for global use
window.wasmProcessor = wasmProcessor;