/**
 * Smart Browser Detection - Basic Usage Examples
 * 
 * This file demonstrates basic usage patterns for the Smart Browser Detection library.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Import the library (ES6)
import { SmartBrowserDetection, BrowserDetectionResult } from '../src/index';

// Or require it (CommonJS)
// const { SmartBrowserDetection } = require('smart-browser-detection');

// Create a detector instance
const detector = new SmartBrowserDetection();

// Example 1: Basic browser detection
function basicDetection(): void {
  console.log('=== Basic Browser Detection ===');

  const result: BrowserDetectionResult = detector.detectBrowser();

  console.log('Browser:', result.browser);
  console.log('Version:', result.browserVersion);
  console.log('Confidence:', (result.confidence * 100).toFixed(1) + '%');
  console.log('Platform:', result.platform);
  console.log('OS:', result.os);
  console.log('Is Mobile:', result.isMobile);
  console.log('Detection Methods:', result.detectionMethods.join(', '));
}

// Example 2: Confidence-based decisions
function confidenceBasedDetection(): void {
  console.log('\n=== Confidence-Based Detection ===');

  const result: BrowserDetectionResult = detector.detectBrowser();

  if (result.confidence >= 0.9) {
    console.log('✅ High confidence detection:', result.browser);
    console.log('   Safe to use for critical features');
  } else if (result.confidence >= 0.7) {
    console.log('⚠️  Medium confidence detection:', result.browser);
    console.log('   Use with caution, consider fallbacks');
  } else {
    console.log('❌ Low confidence detection:', result.browser);
    console.log('   Use fallback detection methods');
  }
}

// Example 3: Mobile-specific detection
function mobileDetection(): void {
  console.log('\n=== Mobile Detection ===');

  const result: BrowserDetectionResult = detector.detectBrowser();

  if (result.isMobile) {
    console.log('📱 Mobile device detected');
    console.log('Browser:', result.browser);
    console.log('Platform:', result.platform);

    // Mobile-specific logic
    if (result.browser === 'Chrome') {
      console.log('   Using Chrome mobile optimizations');
    } else if (result.browser === 'Safari') {
      console.log('   Using Safari mobile optimizations');
    } else if (result.browser === 'Edge') {
      console.log('   Using Edge mobile optimizations');
    }
  } else if (result.isTablet) {
    console.log('📱 Tablet device detected');
    console.log('Browser:', result.browser);
  } else {
    console.log('🖥️  Desktop device detected');
    console.log('Browser:', result.browser);
  }
}

// Example 4: Browser-specific features
function browserSpecificFeatures(): void {
  console.log('\n=== Browser-Specific Features ===');

  const result: BrowserDetectionResult = detector.detectBrowser();

  switch (result.browser) {
    case 'Chrome':
      console.log('🚀 Chrome detected - using Chrome-specific features');
      console.log('   - WebP image support');
      console.log('   - Advanced CSS features');
      console.log('   - Service Worker support');
      break;

    case 'Firefox':
      console.log('🦊 Firefox detected - using Firefox-specific features');
      console.log('   - Mozilla-specific APIs');
      console.log('   - Enhanced privacy features');
      break;

    case 'Safari':
      console.log('🍎 Safari detected - using Safari-specific features');
      console.log('   - WebKit optimizations');
      console.log('   - Apple-specific features');
      break;

    case 'Edge':
      console.log('🌐 Edge detected - using Edge-specific features');
      console.log('   - Chromium-based features');
      console.log('   - Microsoft-specific integrations');
      break;

    default:
      console.log('❓ Unknown browser - using fallback features');
  }
}

// Example 5: Version-specific features
function versionSpecificFeatures(): void {
  console.log('\n=== Version-Specific Features ===');

  const result: BrowserDetectionResult = detector.detectBrowser();
  const version: number = parseFloat(result.browserVersion);

  console.log(`Browser: ${result.browser} ${result.browserVersion}`);

  if (result.browser === 'Chrome') {
    if (version >= 120) {
      console.log('✅ Using latest Chrome features');
    } else if (version >= 100) {
      console.log('⚠️  Using Chrome 100+ features');
    } else {
      console.log('❌ Using fallback features for older Chrome');
    }
  } else if (result.browser === 'Firefox') {
    if (version >= 120) {
      console.log('✅ Using latest Firefox features');
    } else if (version >= 100) {
      console.log('⚠️  Using Firefox 100+ features');
    } else {
      console.log('❌ Using fallback features for older Firefox');
    }
  }
}

// Example 6: OS-specific features
function osSpecificFeatures(): void {
  console.log('\n=== OS-Specific Features ===');

  const result: BrowserDetectionResult = detector.detectBrowser();

  console.log(`OS: ${result.os} ${result.osVersion}`);

  switch (result.os) {
    case 'Windows':
      console.log('🪟 Windows detected');
      console.log('   - Windows-specific optimizations');
      console.log('   - DirectX support');
      break;

    case 'macOS':
      console.log('🍎 macOS detected');
      console.log('   - macOS-specific optimizations');
      console.log('   - Metal graphics support');
      break;

    case 'Linux':
      console.log('🐧 Linux detected');
      console.log('   - Linux-specific optimizations');
      console.log('   - OpenGL support');
      break;

    case 'Android':
      console.log('🤖 Android detected');
      console.log('   - Android-specific optimizations');
      console.log('   - Touch interface support');
      break;

    case 'iOS':
      console.log('📱 iOS detected');
      console.log('   - iOS-specific optimizations');
      console.log('   - Touch interface support');
      break;
  }
}

// Example 7: Cache management
function cacheManagement(): void {
  console.log('\n=== Cache Management ===');

  // First detection (will be cached)
  const start1: number = performance.now();
  detector.detectBrowser();
  const time1: number = performance.now() - start1;

  // Second detection (from cache)
  const start2: number = performance.now();
  detector.detectBrowser();
  const time2: number = performance.now() - start2;

  console.log(`First detection: ${time1.toFixed(4)}ms`);
  console.log(`Cached detection: ${time2.toFixed(4)}ms`);
  console.log(`Speed improvement: ${(time1 / time2).toFixed(1)}x faster`);

  // Clear cache
  detector.clearCache();
  console.log('Cache cleared');

  const cacheStats = detector.getCacheStats();
  console.log(`Cache size: ${cacheStats.size}`);
}

// Example 8: Error handling
function errorHandling(): void {
  console.log('\n=== Error Handling ===');

  try {
    const result: BrowserDetectionResult = detector.detectBrowser();
    console.log('✅ Detection successful:', result.browser);
  } catch (error) {
    console.error('❌ Detection failed:', error);
    console.log('Using fallback detection...');

    // Fallback detection
    const fallbackResult = {
      browser: 'Unknown',
      confidence: 0,
      isMobile: false,
      isTablet: false,
      isDesktop: true
    };

    console.log('Fallback result:', fallbackResult);
  }
}

// Example 9: Complete information
function completeInformation(): void {
  console.log('\n=== Complete Information ===');

  const completeInfo: BrowserDetectionResult = detector.getCompleteInfo();
  console.log('Complete browser information:', JSON.stringify(completeInfo, null, 2));
}

// Example 10: Performance monitoring
function performanceMonitoring(): void {
  console.log('\n=== Performance Monitoring ===');

  const iterations: number = 1000;
  const start: number = performance.now();

  for (let i = 0; i < iterations; i++) {
    detector.detectBrowser();
  }

  const end: number = performance.now();
  const totalTime: number = end - start;
  const avgTime: number = totalTime / iterations;

  console.log(`Total time for ${iterations} detections: ${totalTime.toFixed(2)}ms`);
  console.log(`Average time per detection: ${avgTime.toFixed(4)}ms`);
  console.log(`Detections per second: ${(1000 / avgTime).toFixed(0)}`);
}

// Run all examples
function runAllExamples(): void {
  console.log('🚀 Smart Browser Detection Examples');
  console.log('===================================\n');

  basicDetection();
  confidenceBasedDetection();
  mobileDetection();
  browserSpecificFeatures();
  versionSpecificFeatures();
  osSpecificFeatures();
  cacheManagement();
  errorHandling();
  completeInformation();
  performanceMonitoring();

  console.log('\n✅ All examples completed successfully!');
}

// Export functions for use in other modules
export {
  basicDetection,
  confidenceBasedDetection,
  mobileDetection,
  browserSpecificFeatures,
  versionSpecificFeatures,
  osSpecificFeatures,
  cacheManagement,
  errorHandling,
  completeInformation,
  performanceMonitoring,
  runAllExamples
};

// Run examples if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).runSmartBrowserDetectionExamples = runAllExamples;
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    runAllExamples,
    detector
  };
}
