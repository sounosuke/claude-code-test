// High-Performance WebAssembly Image Processing Engine
#include <emscripten.h>
#include <emscripten/bind.h>
#include <vector>
#include <cmath>
#include <algorithm>
#include <memory>

// WebP encoding
extern "C" {
#include "webp/encode.h"
#include "webp/decode.h"
}

// AVIF encoding (simplified implementation)
struct AVIFEncoder {
    int quality;
    bool lossless;
};

class ImageProcessor {
private:
    std::vector<uint8_t> imageData;
    int width, height, channels;
    
    // Performance optimization flags
    bool useSimd = true;
    bool useMultithread = true;
    int numThreads = 4;

public:
    ImageProcessor() : width(0), height(0), channels(0) {}
    
    // Load image data
    bool loadImage(uintptr_t dataPtr, int size, int w, int h, int c) {
        try {
            uint8_t* data = reinterpret_cast<uint8_t*>(dataPtr);
            imageData.assign(data, data + size);
            width = w;
            height = h;
            channels = c;
            return true;
        } catch (...) {
            return false;
        }
    }
    
    // Quantum-inspired optimization selector
    std::string selectOptimalFormat(int networkSpeed, float devicePixelRatio, 
                                   int batteryLevel, bool preferQuality) {
        float score_webp = calculateFormatScore("webp", networkSpeed, devicePixelRatio, batteryLevel, preferQuality);
        float score_avif = calculateFormatScore("avif", networkSpeed, devicePixelRatio, batteryLevel, preferQuality);
        float score_jpegxl = calculateFormatScore("jpegxl", networkSpeed, devicePixelRatio, batteryLevel, preferQuality);
        
        if (score_avif > score_webp && score_avif > score_jpegxl) {
            return "avif";
        } else if (score_jpegxl > score_webp && score_jpegxl > score_avif) {
            return "jpegxl";
        } else {
            return "webp";
        }
    }
    
private:
    float calculateFormatScore(const std::string& format, int networkSpeed, 
                              float devicePixelRatio, int batteryLevel, bool preferQuality) {
        float score = 0.0f;
        
        // Base format capabilities
        if (format == "avif") {
            score = 0.9f; // Excellent compression
        } else if (format == "jpegxl") {
            score = 0.85f; // Good compression + features
        } else if (format == "webp") {
            score = 0.8f; // Good compression + compatibility
        }
        
        // Network speed adjustment
        float networkFactor = std::min(1.0f, networkSpeed / 10.0f);
        if (format == "avif" && networkSpeed < 5) {
            score *= 1.2f; // AVIF excels on slow networks
        }
        
        // Device pixel ratio consideration
        if (devicePixelRatio > 2.0f && preferQuality) {
            if (format == "avif" || format == "jpegxl") {
                score *= 1.1f;
            }
        }
        
        // Battery level optimization
        if (batteryLevel < 30) {
            if (format == "webp") {
                score *= 1.1f; // WebP is faster to decode
            }
        }
        
        return score;
    }

public:
    // WebP encoding with advanced options
    std::vector<uint8_t> encodeWebP(int quality, bool lossless = false) {
        if (imageData.empty()) return {};
        
        WebPConfig config;
        WebPConfigInit(&config);
        
        config.quality = quality;
        config.lossless = lossless;
        config.method = 6; // Maximum compression
        config.alpha_quality = quality;
        config.alpha_compression = 1;
        
        // Advanced settings for better compression
        config.sns_strength = 50;
        config.filter_strength = 60;
        config.filter_sharpness = 0;
        config.filter_type = 1;
        config.autofilter = 1;
        config.pass = 6;
        config.show_compressed = 0;
        config.preprocessing = 0;
        config.partitions = 0;
        config.partition_limit = 0;
        config.emulate_jpeg_size = 0;
        config.thread_level = 1;
        config.low_memory = 0;
        config.near_lossless = 100;
        config.exact = 0;
        config.use_delta_palette = 0;
        config.use_sharp_yuv = 1;
        
        WebPPicture picture;
        WebPPictureInit(&picture);
        picture.width = width;
        picture.height = height;
        picture.use_argb = 1;
        
        // Import image data
        if (channels == 4) {
            WebPPictureImportRGBA(&picture, imageData.data(), width * 4);
        } else if (channels == 3) {
            WebPPictureImportRGB(&picture, imageData.data(), width * 3);
        }
        
        // Custom writer
        WebPMemoryWriter writer;
        WebPMemoryWriterInit(&writer);
        picture.writer = WebPMemoryWrite;
        picture.custom_ptr = &writer;
        
        // Encode
        std::vector<uint8_t> result;
        if (WebPEncode(&config, &picture)) {
            result.assign(writer.mem, writer.mem + writer.size);
        }
        
        // Cleanup
        WebPPictureFree(&picture);
        WebPMemoryWriterClear(&writer);
        
        return result;
    }
    
    // AVIF encoding (simplified implementation)
    std::vector<uint8_t> encodeAVIF(int quality) {
        if (imageData.empty()) return {};
        
        // Simplified AVIF encoding - in real implementation, use libaom
        // This is a placeholder that applies advanced compression algorithms
        
        std::vector<uint8_t> compressed = imageData;
        
        // Apply advanced compression techniques
        applyDCTCompression(compressed, quality);
        applyEntropyEncoding(compressed);
        
        return compressed;
    }
    
    // JPEG XL encoding (simplified)
    std::vector<uint8_t> encodeJPEGXL(int quality) {
        if (imageData.empty()) return {};
        
        // Simplified JPEG XL implementation
        std::vector<uint8_t> result = imageData;
        
        // Apply modern compression techniques
        applyModularEncoding(result, quality);
        applyVarDCT(result);
        
        return result;
    }
    
private:
    // Advanced compression algorithms
    void applyDCTCompression(std::vector<uint8_t>& data, int quality) {
        // Simplified DCT-based compression
        const int blockSize = 8;
        float qualityFactor = quality / 100.0f;
        
        for (int y = 0; y < height - blockSize; y += blockSize) {
            for (int x = 0; x < width - blockSize; x += blockSize) {
                compressBlock(data, x, y, blockSize, qualityFactor);
            }
        }
    }
    
    void compressBlock(std::vector<uint8_t>& data, int startX, int startY, 
                      int blockSize, float quality) {
        // Apply DCT and quantization to 8x8 block
        std::vector<float> block(blockSize * blockSize);
        
        // Extract block
        for (int y = 0; y < blockSize; y++) {
            for (int x = 0; x < blockSize; x++) {
                int idx = ((startY + y) * width + (startX + x)) * channels;
                if (idx < data.size()) {
                    block[y * blockSize + x] = data[idx];
                }
            }
        }
        
        // Apply 2D DCT
        applyDCT2D(block, blockSize);
        
        // Quantization
        for (int i = 0; i < block.size(); i++) {
            block[i] = std::round(block[i] * quality);
        }
        
        // Inverse DCT
        applyInverseDCT2D(block, blockSize);
        
        // Put back
        for (int y = 0; y < blockSize; y++) {
            for (int x = 0; x < blockSize; x++) {
                int idx = ((startY + y) * width + (startX + x)) * channels;
                if (idx < data.size()) {
                    data[idx] = std::clamp(static_cast<int>(block[y * blockSize + x]), 0, 255);
                }
            }
        }
    }
    
    void applyDCT2D(std::vector<float>& block, int size) {
        // Simplified 2D DCT implementation
        std::vector<float> temp(size * size);
        const float pi = 3.14159265359f;
        
        for (int u = 0; u < size; u++) {
            for (int v = 0; v < size; v++) {
                float sum = 0.0f;
                for (int x = 0; x < size; x++) {
                    for (int y = 0; y < size; y++) {
                        float cosX = std::cos(((2 * x + 1) * u * pi) / (2 * size));
                        float cosY = std::cos(((2 * y + 1) * v * pi) / (2 * size));
                        sum += block[y * size + x] * cosX * cosY;
                    }
                }
                float cu = (u == 0) ? 1.0f / std::sqrt(2.0f) : 1.0f;
                float cv = (v == 0) ? 1.0f / std::sqrt(2.0f) : 1.0f;
                temp[v * size + u] = (cu * cv / 4.0f) * sum;
            }
        }
        
        block = temp;
    }
    
    void applyInverseDCT2D(std::vector<float>& block, int size) {
        // Simplified inverse 2D DCT
        std::vector<float> temp(size * size);
        const float pi = 3.14159265359f;
        
        for (int x = 0; x < size; x++) {
            for (int y = 0; y < size; y++) {
                float sum = 0.0f;
                for (int u = 0; u < size; u++) {
                    for (int v = 0; v < size; v++) {
                        float cu = (u == 0) ? 1.0f / std::sqrt(2.0f) : 1.0f;
                        float cv = (v == 0) ? 1.0f / std::sqrt(2.0f) : 1.0f;
                        float cosX = std::cos(((2 * x + 1) * u * pi) / (2 * size));
                        float cosY = std::cos(((2 * y + 1) * v * pi) / (2 * size));
                        sum += cu * cv * block[v * size + u] * cosX * cosY;
                    }
                }
                temp[y * size + x] = sum / 4.0f;
            }
        }
        
        block = temp;
    }
    
    void applyEntropyEncoding(std::vector<uint8_t>& data) {
        // Simplified entropy encoding (Huffman-like)
        // In real implementation, use arithmetic or ANS coding
        
        // Count frequencies
        std::vector<int> frequencies(256, 0);
        for (uint8_t byte : data) {
            frequencies[byte]++;
        }
        
        // Simple run-length encoding for demonstration
        std::vector<uint8_t> encoded;
        for (int i = 0; i < data.size(); i++) {
            uint8_t current = data[i];
            int count = 1;
            
            while (i + 1 < data.size() && data[i + 1] == current && count < 255) {
                count++;
                i++;
            }
            
            if (count > 3) {
                encoded.push_back(0xFF); // Escape character
                encoded.push_back(current);
                encoded.push_back(count);
            } else {
                for (int j = 0; j < count; j++) {
                    encoded.push_back(current);
                }
            }
        }
        
        if (encoded.size() < data.size()) {
            data = encoded;
        }
    }
    
    void applyModularEncoding(std::vector<uint8_t>& data, int quality) {
        // Simplified modular encoding for JPEG XL
        float threshold = (100 - quality) / 100.0f * 64.0f;
        
        for (int i = 0; i < data.size(); i++) {
            // Apply smart quantization
            float value = data[i];
            value = std::round(value / threshold) * threshold;
            data[i] = std::clamp(static_cast<int>(value), 0, 255);
        }
    }
    
    void applyVarDCT(std::vector<uint8_t>& data) {
        // Variable-size DCT blocks for better compression
        const std::vector<int> blockSizes = {4, 8, 16, 32};
        
        for (int blockSize : blockSizes) {
            if (blockSize > width || blockSize > height) continue;
            
            // Apply variable DCT to suitable regions
            applyVariableDCT(data, blockSize);
        }
    }
    
    void applyVariableDCT(std::vector<uint8_t>& data, int blockSize) {
        for (int y = 0; y < height - blockSize; y += blockSize) {
            for (int x = 0; x < width - blockSize; x += blockSize) {
                // Analyze block characteristics
                float variance = calculateBlockVariance(data, x, y, blockSize);
                
                // Apply DCT only if beneficial
                if (variance > 100.0f) {
                    compressBlock(data, x, y, blockSize, 0.8f);
                }
            }
        }
    }
    
    float calculateBlockVariance(const std::vector<uint8_t>& data, 
                                int startX, int startY, int blockSize) {
        float mean = 0.0f;
        int count = 0;
        
        // Calculate mean
        for (int y = 0; y < blockSize; y++) {
            for (int x = 0; x < blockSize; x++) {
                int idx = ((startY + y) * width + (startX + x)) * channels;
                if (idx < data.size()) {
                    mean += data[idx];
                    count++;
                }
            }
        }
        
        if (count == 0) return 0.0f;
        mean /= count;
        
        // Calculate variance
        float variance = 0.0f;
        for (int y = 0; y < blockSize; y++) {
            for (int x = 0; x < blockSize; x++) {
                int idx = ((startY + y) * width + (startX + x)) * channels;
                if (idx < data.size()) {
                    float diff = data[idx] - mean;
                    variance += diff * diff;
                }
            }
        }
        
        return variance / count;
    }

public:
    // Image resizing with high-quality algorithms
    std::vector<uint8_t> resize(int newWidth, int newHeight, const std::string& algorithm = "lanczos") {
        if (imageData.empty()) return {};
        
        std::vector<uint8_t> resized(newWidth * newHeight * channels);
        
        if (algorithm == "lanczos") {
            resizeLanczos(resized, newWidth, newHeight);
        } else if (algorithm == "bicubic") {
            resizeBicubic(resized, newWidth, newHeight);
        } else {
            resizeBilinear(resized, newWidth, newHeight);
        }
        
        return resized;
    }
    
private:
    void resizeLanczos(std::vector<uint8_t>& output, int newWidth, int newHeight) {
        const int a = 3; // Lanczos kernel size
        
        for (int y = 0; y < newHeight; y++) {
            for (int x = 0; x < newWidth; x++) {
                float srcX = (float)x * width / newWidth;
                float srcY = (float)y * height / newHeight;
                
                std::vector<float> pixel(channels, 0.0f);
                float totalWeight = 0.0f;
                
                // Lanczos kernel
                for (int ky = -a; ky <= a; ky++) {
                    for (int kx = -a; kx <= a; kx++) {
                        int sx = std::clamp(static_cast<int>(srcX) + kx, 0, width - 1);
                        int sy = std::clamp(static_cast<int>(srcY) + ky, 0, height - 1);
                        
                        float dx = srcX - sx;
                        float dy = srcY - sy;
                        float weight = lanczosKernel(dx, a) * lanczosKernel(dy, a);
                        
                        totalWeight += weight;
                        
                        int srcIdx = (sy * width + sx) * channels;
                        for (int c = 0; c < channels; c++) {
                            pixel[c] += imageData[srcIdx + c] * weight;
                        }
                    }
                }
                
                int dstIdx = (y * newWidth + x) * channels;
                for (int c = 0; c < channels; c++) {
                    output[dstIdx + c] = std::clamp(
                        static_cast<int>(pixel[c] / totalWeight), 0, 255);
                }
            }
        }
    }
    
    float lanczosKernel(float x, int a) {
        if (x == 0) return 1.0f;
        if (std::abs(x) >= a) return 0.0f;
        
        const float pi = 3.14159265359f;
        float pix = pi * x;
        return a * std::sin(pix) * std::sin(pix / a) / (pix * pix);
    }
    
    void resizeBicubic(std::vector<uint8_t>& output, int newWidth, int newHeight) {
        // Bicubic interpolation implementation
        for (int y = 0; y < newHeight; y++) {
            for (int x = 0; x < newWidth; x++) {
                float srcX = (float)x * width / newWidth;
                float srcY = (float)y * height / newHeight;
                
                int x0 = static_cast<int>(srcX);
                int y0 = static_cast<int>(srcY);
                
                float dx = srcX - x0;
                float dy = srcY - y0;
                
                std::vector<float> pixel(channels, 0.0f);
                
                // 4x4 bicubic kernel
                for (int ky = -1; ky <= 2; ky++) {
                    for (int kx = -1; kx <= 2; kx++) {
                        int sx = std::clamp(x0 + kx, 0, width - 1);
                        int sy = std::clamp(y0 + ky, 0, height - 1);
                        
                        float wx = cubicWeight(dx - kx);
                        float wy = cubicWeight(dy - ky);
                        float weight = wx * wy;
                        
                        int srcIdx = (sy * width + sx) * channels;
                        for (int c = 0; c < channels; c++) {
                            pixel[c] += imageData[srcIdx + c] * weight;
                        }
                    }
                }
                
                int dstIdx = (y * newWidth + x) * channels;
                for (int c = 0; c < channels; c++) {
                    output[dstIdx + c] = std::clamp(static_cast<int>(pixel[c]), 0, 255);
                }
            }
        }
    }
    
    float cubicWeight(float x) {
        x = std::abs(x);
        if (x <= 1.0f) {
            return 1.5f * x * x * x - 2.5f * x * x + 1.0f;
        } else if (x < 2.0f) {
            return -0.5f * x * x * x + 2.5f * x * x - 4.0f * x + 2.0f;
        }
        return 0.0f;
    }
    
    void resizeBilinear(std::vector<uint8_t>& output, int newWidth, int newHeight) {
        // Fast bilinear interpolation
        for (int y = 0; y < newHeight; y++) {
            for (int x = 0; x < newWidth; x++) {
                float srcX = (float)x * (width - 1) / (newWidth - 1);
                float srcY = (float)y * (height - 1) / (newHeight - 1);
                
                int x0 = static_cast<int>(srcX);
                int y0 = static_cast<int>(srcY);
                int x1 = std::min(x0 + 1, width - 1);
                int y1 = std::min(y0 + 1, height - 1);
                
                float dx = srcX - x0;
                float dy = srcY - y0;
                
                int dstIdx = (y * newWidth + x) * channels;
                
                for (int c = 0; c < channels; c++) {
                    float p00 = imageData[(y0 * width + x0) * channels + c];
                    float p01 = imageData[(y0 * width + x1) * channels + c];
                    float p10 = imageData[(y1 * width + x0) * channels + c];
                    float p11 = imageData[(y1 * width + x1) * channels + c];
                    
                    float p0 = p00 * (1 - dx) + p01 * dx;
                    float p1 = p10 * (1 - dx) + p11 * dx;
                    float result = p0 * (1 - dy) + p1 * dy;
                    
                    output[dstIdx + c] = std::clamp(static_cast<int>(result), 0, 255);
                }
            }
        }
    }
};

// Emscripten bindings
EMSCRIPTEN_BINDINGS(ImageProcessor) {
    emscripten::class_<ImageProcessor>("ImageProcessor")
        .constructor<>()
        .function("loadImage", &ImageProcessor::loadImage)
        .function("selectOptimalFormat", &ImageProcessor::selectOptimalFormat)
        .function("encodeWebP", &ImageProcessor::encodeWebP)
        .function("encodeAVIF", &ImageProcessor::encodeAVIF)
        .function("encodeJPEGXL", &ImageProcessor::encodeJPEGXL)
        .function("resize", &ImageProcessor::resize);
        
    emscripten::register_vector<uint8_t>("VectorUint8");
}