/**
 * Smart Browser Detection Library
 * Advanced browser detection with anti-spoofing capabilities
 * 
 * @version 1.0.0
 * @author Smart Browser Detection Team
 * @license MIT
 */

// Type definitions
export interface BrowserDetectionResult {
  browser: string;
  browserVersion: string;
  engine: string;
  engineVersion: string;
  platform: string;
  os: string;
  osVersion: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  confidence: number;
  detectionMethods: string[];
  userAgent: string;
  vendor: string;
  timestamp: number;
}

export interface DetectionMethodResult {
  browser: string;
  confidence: number;
  method: string;
}

export interface EngineInfo {
  engine: string;
  version: string;
}

export interface OSInfo {
  os: string;
  osVersion: string;
}

export interface CacheStats {
  size: number;
  keys: string[];
}

export interface RegexPatterns {
  chrome: RegExp;
  firefox: RegExp;
  safari: RegExp;
  edge: RegExp;
  opera: RegExp;
  ie: RegExp;
  android: RegExp;
  ios: RegExp;
  windows: RegExp;
  macos: RegExp;
}

export type DetectionMethod = 'apiDetection' | 'vendorDetection' | 'userAgentDetection' | 'cssDetection';

export type BrowserType = 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'Internet Explorer' | 'Unknown';

export type PlatformType = 'Desktop' | 'Mobile' | 'Tablet';

export type OSType = 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'Unknown';

export type EngineType = 'Blink' | 'Gecko' | 'WebKit' | 'Trident' | 'Unknown';

// Browser-specific API interfaces
interface ChromeAPI {
  runtime?: {
    onConnect?: EventTarget;
  };
  webstore?: {
    install?: (url: string, callback?: (error?: Error) => void) => void;
  };
}

interface SafariAPI {
  pushNotification?: {
    permission?: string;
    requestPermission?: () => Promise<string>;
  };
}

interface OperaAPI {
  version?: string;
}

interface UserAgentData {
  brands?: Array<{ brand: string; version: string }>;
  mobile?: boolean;
  platform?: string;
}

// Extended Window interface
declare global {
  interface Window {
    chrome?: ChromeAPI;
    InstallTrigger?: boolean;
    safari?: SafariAPI;
    opera?: OperaAPI;
  }

  interface Navigator {
    userAgentData?: UserAgentData;
  }

  interface Document {
    documentMode?: number;
  }

  interface CSSStyleDeclaration {
    webkitTransform: string;
    webkitAppearance: string;
  }
}

/**
 * Smart Browser Detection Class
 * Provides multi-method browser detection with confidence scoring
 */
export class SmartBrowserDetection {
  private cache: Map<string, BrowserDetectionResult>;
  private detectionMethods: DetectionMethod[];
  private regexPatterns: RegexPatterns;

  constructor() {
    this.cache = new Map();
    this.detectionMethods = [
      'apiDetection',
      'vendorDetection',
      'userAgentDetection',
      'cssDetection'
    ];

    // Performance optimization: pre-compile regex patterns
    this.regexPatterns = {
      chrome: /chrome\/(\d+\.\d+)/i,
      firefox: /firefox\/(\d+\.\d+)/i,
      safari: /version\/(\d+\.\d+)/i,
      edge: /edg\/(\d+\.\d+)/i,
      opera: /(?:opera|opr)\/(\d+\.\d+)/i,
      ie: /(?:msie\s(\d+\.\d+)|rv:(\d+\.\d+))/i,
      android: /android\s(\d+\.\d+)/i,
      ios: /os\s(\d+_\d+)/i,
      windows: /windows nt (10\.0|6\.3|6\.2|6\.1)/i,
      macos: /mac os x 10_(\d+)/i
    };
  }

  /**
   * Main detection function that combines multiple methods
   * @returns Browser detection result with confidence scoring
   */
  public detectBrowser(): BrowserDetectionResult {
    const cacheKey = 'browser_detection';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result: BrowserDetectionResult = {
      browser: 'Unknown',
      browserVersion: 'Unknown',
      engine: 'Unknown',
      engineVersion: 'Unknown',
      platform: 'Unknown',
      os: 'Unknown',
      osVersion: 'Unknown',
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      confidence: 0,
      detectionMethods: [],
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      timestamp: Date.now()
    };

    // Collect all method results
    const methodResults: DetectionMethodResult[] = [];

    // Try each detection method
    for (const method of this.detectionMethods) {
      try {
        let methodResult: DetectionMethodResult | null = null;
        switch (method) {
          case 'apiDetection':
            methodResult = this.apiDetection();
            break;
          case 'vendorDetection':
            methodResult = this.vendorDetection();
            break;
          case 'userAgentDetection':
            methodResult = this.userAgentDetection();
            break;
          case 'cssDetection':
            methodResult = this.cssDetection();
            break;
        }
        if (methodResult && methodResult.browser !== 'Unknown') {
          methodResults.push(methodResult);
        }
      } catch (error) {
        // Silent fail for detection methods to ensure robustness
        console.warn(`Detection method ${method} failed:`, error);
      }
    }

    // Smart result selection based on method priority and confidence
    if (methodResults.length > 0) {
      const finalResult = this.selectBestResult(methodResults);
      Object.assign(result, finalResult);
    }

    // Determine device type
    result.isMobile = this.detectMobile();
    result.isTablet = this.detectTablet();
    result.isDesktop = !result.isMobile && !result.isTablet;

    // Add engine information
    const engineInfo = this.getEngineInfo(result.browser as BrowserType);
    result.engine = engineInfo.engine;
    result.engineVersion = engineInfo.version;

    // Add OS information
    const osInfo = this.getOSInfo();
    result.os = osInfo.os;
    result.osVersion = osInfo.osVersion;

    // Add browser version
    result.browserVersion = this.getBrowserVersion(result.browser as BrowserType);

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Smart result selection algorithm with priority handling
   * @param methodResults - Array of detection method results
   * @returns Best detection result
   */
  private selectBestResult(methodResults: DetectionMethodResult[]): Partial<BrowserDetectionResult> {
    // Count detections per browser
    const browserCounts: Record<string, number> = {};
    const browserConfidences: Record<string, number> = {};
    const browserResults: Record<string, DetectionMethodResult> = {};

    methodResults.forEach((result) => {
      const browser = result.browser;
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      browserConfidences[browser] = Math.max(
        browserConfidences[browser] || 0,
        result.confidence
      );
      browserResults[browser] = result;
    });

    // Find browser with highest count and confidence
    let bestBrowser = 'Unknown';
    let bestScore = 0;

    Object.keys(browserCounts).forEach((browser) => {
      const count = browserCounts[browser] || 0;
      const confidence = browserConfidences[browser] || 0;
      const score = count * confidence;

      // Special case: If Edge is detected by at least 2 methods, prioritize it
      if (browser === 'Edge' && count >= 2) {
        bestBrowser = browser;
        bestScore = score;
        return;
      }

      // Special case: Chrome with high confidence from API detection
      if (browser === 'Chrome' && confidence >= 0.9) {
        bestBrowser = browser;
        bestScore = score;
        return;
      }

      if (score > bestScore) {
        bestBrowser = browser;
        bestScore = score;
      }
    });

    // Get the best result for the selected browser
    const bestResult = browserResults[bestBrowser];

    return {
      browser: bestBrowser,
      confidence: bestResult ? bestResult.confidence : 0,
      detectionMethods: methodResults
        .filter((r) => r.browser === bestBrowser)
        .map((r) => r.method)
    };
  }

  /**
   * API-based detection using browser-specific APIs
   * @returns API detection result
   */
  private apiDetection(): DetectionMethodResult {
    const result: DetectionMethodResult = {
      browser: 'Unknown',
      confidence: 0,
      method: 'apiDetection'
    };

    // Chrome-specific APIs
    if (window.chrome && window.chrome.runtime && window.chrome.runtime.onConnect) {
      result.browser = 'Chrome';
      result.confidence = 0.95;
    }
    // Safari-specific APIs
    else if (window.safari && window.safari.pushNotification) {
      result.browser = 'Safari';
      result.confidence = 0.95;
    }
    // Edge-specific APIs (with fallback for mobile)
    else if (navigator.userAgentData && navigator.userAgentData.brands) {
      const brands = navigator.userAgentData.brands;
      const hasEdge = brands.some((brand) => brand.brand === 'Microsoft Edge');
      if (hasEdge) {
        result.browser = 'Edge';
        result.confidence = 0.95;
      }
    }
    // Opera detection
    else if (window.opera && window.opera.version) {
      result.browser = 'Opera';
      result.confidence = 0.9;
    }
    // Internet Explorer detection
    else if (document.documentMode) {
      result.browser = 'Internet Explorer';
      result.confidence = 0.95;
    }

    return result;
  }

  /**
   * Vendor-based detection using navigator.vendor and other vendor info
   * @returns Vendor detection result
   */
  private vendorDetection(): DetectionMethodResult {
    const result: DetectionMethodResult = {
      browser: 'Unknown',
      confidence: 0,
      method: 'vendorDetection'
    };

    const vendor = navigator.vendor.toLowerCase();
    const ua = navigator.userAgent.toLowerCase();

    // Edge detection: UA contains 'edg' takes precedence
    if (ua.includes('edg')) {
      result.browser = 'Edge';
      result.confidence = 0.9;
      return result;
    }

    if (vendor.includes('google')) {
      result.browser = 'Chrome';
      result.confidence = 0.9;
    } else if (vendor.includes('apple')) {
      result.browser = 'Safari';
      result.confidence = 0.9;
    } else if (vendor.includes('mozilla')) {
      result.browser = 'Firefox';
      result.confidence = 0.8;
    } else if (vendor === '') {
      // Edge often has an empty vendor string
      if (ua.includes('edg') || ua.includes('edge')) {
        result.browser = 'Edge';
        result.confidence = 0.8;
      }
      // Edge mobile on Android might have empty vendor
      else if (ua.includes('android') && ua.includes('chrome') && ua.includes('safari')) {
        result.browser = 'Edge';
        result.confidence = 0.7;
      }
    }

    return result;
  }

  /**
   * Enhanced user agent detection with better parsing
   * @returns User agent detection result
   */
  private userAgentDetection(): DetectionMethodResult {
    const result: DetectionMethodResult = {
      browser: 'Unknown',
      confidence: 0,
      method: 'userAgentDetection'
    };

    const ua = navigator.userAgent.toLowerCase();

    // Edge detection (prioritize 'edg' over 'chrome')
    if (ua.includes('edg')) {
      result.browser = 'Edge';
      result.confidence = 0.85;
      return result;
    }

    // Chrome detection (including mobile Chrome)
    if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) {
      result.browser = 'Chrome';
      result.confidence = 0.8;
      if (ua.includes('crios')) {
        result.browser = 'Chrome';
        result.confidence = 0.95;
      }
    }
    // Special case: Chrome mobile emulation (UA shows Safari but vendor shows Google)
    else if (ua.includes('safari') && navigator.vendor.toLowerCase().includes('google')) {
      result.browser = 'Chrome';
      result.confidence = 0.85;
    }
    // Edge detection (multiple patterns)
    else if (ua.includes('edge')) {
      result.browser = 'Edge';
      result.confidence = 0.85;
    }
    // Edge mobile on Android (might look like Chrome)
    else if (ua.includes('android') && ua.includes('chrome') && ua.includes('safari') &&
      !ua.includes('firefox') && navigator.vendor === '') {
      result.browser = 'Edge';
      result.confidence = 0.8;
    }
    // Firefox detection
    else if (ua.includes('firefox') || ua.includes('fxios')) {
      result.browser = 'Firefox';
      result.confidence = 0.85;
    }
    // Safari detection
    else if (ua.includes('safari') && !ua.includes('chrome')) {
      result.browser = 'Safari';
      result.confidence = 0.7;
    }
    // Opera detection
    else if (ua.includes('opr') || ua.includes('opera')) {
      result.browser = 'Opera';
      result.confidence = 0.85;
    }
    // Internet Explorer detection
    else if (ua.includes('msie') || ua.includes('trident')) {
      result.browser = 'Internet Explorer';
      result.confidence = 0.95;
    }

    return result;
  }

  /**
   * CSS-based detection using browser-specific CSS features
   * @returns CSS detection result
   */
  private cssDetection(): DetectionMethodResult {
    const result: DetectionMethodResult = {
      browser: 'Unknown',
      confidence: 0,
      method: 'cssDetection'
    };

    try {
      // Create a test element
      const testElement = document.createElement('div');
      testElement.style.cssText = 'position:absolute;top:-9999px;left:-9999px;';
      document.body.appendChild(testElement);

      // Chrome-specific CSS
      testElement.style.webkitTransform = 'translateZ(0)';
      if (testElement.style.webkitTransform !== '') {
        if (window.chrome && window.chrome.webstore) {
          result.browser = 'Chrome';
          result.confidence = 0.7;
        }
      }

      // Safari-specific CSS
      testElement.style.webkitAppearance = 'none';
      if (testElement.style.webkitAppearance !== '') {
        if (window.safari && window.safari.pushNotification) {
          result.browser = 'Safari';
          result.confidence = 0.7;
        }
      }

      // Edge-specific CSS (Edge supports webkit prefixes but has unique behavior)
      if (navigator.userAgent.toLowerCase().includes('edg') ||
        navigator.userAgent.toLowerCase().includes('edge')) {
        result.browser = 'Edge';
        result.confidence = 0.7;
      }
      // Edge mobile on Android pattern
      else if (navigator.userAgent.toLowerCase().includes('android') &&
        navigator.userAgent.toLowerCase().includes('chrome') &&
        navigator.userAgent.toLowerCase().includes('safari') &&
        navigator.vendor === '') {
        result.browser = 'Edge';
        result.confidence = 0.6;
      }

      // Clean up
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement);
      }
    } catch {
      // Silent fail for CSS detection
    }

    return result;
  }

  /**
   * Detect if running on mobile device
   * @returns True if mobile device
   */
  public detectMobile(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'mobile', 'android', 'iphone', 'ipod', 'blackberry',
      'windows phone', 'opera mini', 'iemobile'
    ];

    const hasMobileKeyword = mobileKeywords.some(keyword => ua.includes(keyword));
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;

    return hasMobileKeyword || (hasTouch && isSmallScreen);
  }

  /**
   * Detect if running on tablet device
   * @returns True if tablet device
   */
  public detectTablet(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    const tabletKeywords = ['ipad', 'tablet', 'playbook', 'silk'];
    const hasTabletKeyword = tabletKeywords.some(keyword => ua.includes(keyword));

    const isTabletSize = window.innerWidth > 768 && window.innerWidth <= 1024;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return hasTabletKeyword || (hasTouch && isTabletSize);
  }

  /**
   * Get browser version from user agent
   * @param browser - Browser name
   * @returns Browser version
   */
  public getBrowserVersion(browser: BrowserType): string {
    const ua = navigator.userAgent;
    let version = 'Unknown';

    if (browser === 'Chrome') {
      const match = ua.match(this.regexPatterns.chrome);
      version = match && match[1] ? match[1] : 'Unknown';
    } else if (browser === 'Firefox') {
      const match = ua.match(this.regexPatterns.firefox);
      version = match && match[1] ? match[1] : 'Unknown';
    } else if (browser === 'Safari') {
      const match = ua.match(this.regexPatterns.safari);
      version = match && match[1] ? match[1] : 'Unknown';
    } else if (browser === 'Edge') {
      const match = ua.match(this.regexPatterns.edge);
      version = match && match[1] ? match[1] : 'Unknown';
    } else if (browser === 'Opera') {
      const match = ua.match(this.regexPatterns.opera);
      version = match && match[1] ? match[1] : 'Unknown';
    } else if (browser === 'Internet Explorer') {
      const match = ua.match(this.regexPatterns.ie);
      version = match && (match[1] || match[2]) ? (match[1] || match[2] || 'Unknown') : 'Unknown';
    }

    return version;
  }

  /**
   * Get engine information for browser
   * @param browser - Browser name
   * @returns Engine information
   */
  public getEngineInfo(browser: BrowserType): EngineInfo {
    const engineMap: Record<BrowserType, EngineInfo> = {
      'Chrome': { engine: 'Blink', version: this.getBrowserVersion(browser) },
      'Edge': { engine: 'Blink', version: this.getBrowserVersion(browser) },
      'Firefox': { engine: 'Gecko', version: this.getBrowserVersion(browser) },
      'Safari': { engine: 'WebKit', version: this.getBrowserVersion(browser) },
      'Opera': { engine: 'Blink', version: this.getBrowserVersion(browser) },
      'Internet Explorer': { engine: 'Trident', version: this.getBrowserVersion(browser) },
      'Unknown': { engine: 'Unknown', version: 'Unknown' }
    };

    return engineMap[browser] || { engine: 'Unknown', version: 'Unknown' };
  }

  /**
   * Get OS information
   * @returns OS information
   */
  public getOSInfo(): OSInfo {
    const ua = navigator.userAgent.toLowerCase();
    let os: OSType = 'Unknown';
    let osVersion = 'Unknown';

    if (/win/i.test(ua) || /windows/i.test(ua)) {
      os = 'Windows';
      const match = ua.match(this.regexPatterns.windows);
      if (match) {
        if (match[1] === '10.0') {
          osVersion = 'Windows 10/11';
        } else if (match[1] === '6.3') {
          osVersion = 'Windows 8.1';
        } else if (match[1] === '6.2') {
          osVersion = 'Windows 8';
        } else if (match[1] === '6.1') {
          osVersion = 'Windows 7';
        }
      }
    } else if (/mac/i.test(ua) || /macintosh/i.test(ua)) {
      os = 'macOS';
      const match = ua.match(this.regexPatterns.macos);
      if (match && match[1]) {
        const version = parseInt(match[1]);
        if (version >= 15) {
          osVersion = 'macOS Big Sur+';
        } else if (version >= 14) {
          osVersion = 'macOS Mojave';
        } else if (version >= 13) {
          osVersion = 'macOS High Sierra';
        }
      }
    } else if (/linux/i.test(ua) || /x11/i.test(ua)) {
      os = 'Linux';
      osVersion = 'Linux';
    } else if (/android/i.test(ua)) {
      os = 'Android';
      const match = ua.match(this.regexPatterns.android);
      osVersion = match && match[1] ? `Android ${match[1]}` : 'Android';
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      os = 'iOS';
      const match = ua.match(this.regexPatterns.ios);
      if (match && match[1]) {
        const version = match[1].replace(/_/g, '.');
        osVersion = `iOS ${version}`;
      } else {
        osVersion = 'iOS';
      }
    }

    return { os, osVersion };
  }

  /**
   * Get platform type
   * @returns Platform type
   */
  public getPlatform(): PlatformType {
    if (this.detectMobile()) return 'Mobile';
    if (this.detectTablet()) return 'Tablet';
    return 'Desktop';
  }

  /**
   * Get complete browser information
   * @returns Complete browser information
   */
  public getCompleteInfo(): BrowserDetectionResult {
    const detection = this.detectBrowser();
    const version = this.getBrowserVersion(detection.browser as BrowserType);
    const { os, osVersion } = this.getOSInfo();
    const platform = this.getPlatform();
    const engineInfo = this.getEngineInfo(detection.browser as BrowserType);

    return {
      browser: detection.browser,
      browserVersion: version,
      engine: engineInfo.engine,
      engineVersion: engineInfo.version,
      platform: platform,
      os: os,
      osVersion: osVersion,
      isMobile: detection.isMobile,
      isTablet: detection.isTablet,
      isDesktop: detection.isDesktop,
      confidence: detection.confidence,
      detectionMethods: detection.detectionMethods,
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      timestamp: detection.timestamp
    };
  }

  /**
   * Clear detection cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  public getCacheStats(): CacheStats {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export for different module systems
if (typeof window !== 'undefined') {
  (window as Window & { SmartBrowserDetection?: typeof SmartBrowserDetection }).SmartBrowserDetection = SmartBrowserDetection;
}

// ES6 module export (default)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartBrowserDetection;
}

// Default export
export default SmartBrowserDetection; 