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
      chrome: /(?:chrome|crios)\/(\d+\.\d+(?:\.\d+)?)/i,
      firefox: /(?:firefox|fxios)\/(\d+\.\d+(?:\.\d+)?)/i,
      safari: /(?:version|safari)\/(\d+\.\d+(?:\.\d+)?)/i,
      edge: /(?:edg|edge)\/(\d+\.\d+(?:\.\d+)?)/i,
      opera: /(?:opera|opr)\/(\d+\.\d+(?:\.\d+)?)/i,
      ie: /(?:msie\s(\d+\.\d+)|rv:(\d+\.\d+))/i,
      android: /android\s(\d+\.\d+(?:\.\d+)?)/i,
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

    // Firefox-specific APIs (check first to avoid false positives)
    if (window.InstallTrigger !== undefined) {
      result.browser = 'Firefox';
      result.confidence = 0.95;
    }
    // Chrome-specific APIs
    else if (window.chrome && window.chrome.runtime && window.chrome.runtime.onConnect) {
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

    // Firefox detection (prioritize over Safari to avoid false positives)
    if (ua.includes('firefox') || ua.includes('fxios')) {
      result.browser = 'Firefox';
      result.confidence = 0.85;
      return result;
    }

    // Edge detection (prioritize 'edg' over 'chrome')
    if (ua.includes('edg')) {
      result.browser = 'Edge';
      result.confidence = 0.85;
      return result;
    }

    // Opera detection
    if (ua.includes('opr') || ua.includes('opera')) {
      result.browser = 'Opera';
      result.confidence = 0.85;
      return result;
    }

    // Internet Explorer detection
    if (ua.includes('msie') || ua.includes('trident')) {
      result.browser = 'Internet Explorer';
      result.confidence = 0.95;
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
      return result;
    }

    // Special case: Chrome mobile emulation (UA shows Safari but vendor shows Google)
    if (ua.includes('safari') && navigator.vendor.toLowerCase().includes('google')) {
      result.browser = 'Chrome';
      result.confidence = 0.85;
      return result;
    }

    // Edge detection (multiple patterns)
    if (ua.includes('edge')) {
      result.browser = 'Edge';
      result.confidence = 0.85;
      return result;
    }

    // Edge mobile on Android (might look like Chrome)
    if (ua.includes('android') && ua.includes('chrome') && ua.includes('safari') &&
      !ua.includes('firefox') && navigator.vendor === '') {
      result.browser = 'Edge';
      result.confidence = 0.8;
      return result;
    }

    // Safari detection (last resort, after all other browsers)
    if (ua.includes('safari') && !ua.includes('chrome')) {
      result.browser = 'Safari';
      result.confidence = 0.7;
      return result;
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
    // Try to get version from navigator.userAgentData first (modern browsers)
    if (navigator.userAgentData && navigator.userAgentData.brands) {
      const brands = navigator.userAgentData.brands;
      for (const brand of brands) {
        if (brand.brand.toLowerCase() === browser.toLowerCase()) {
          return brand.version;
        }
        // Handle Edge case
        if (browser === 'Edge' && brand.brand === 'Microsoft Edge') {
          return brand.version;
        }
        // Handle Chrome case
        if (browser === 'Chrome' && brand.brand === 'Google Chrome') {
          return brand.version;
        }
      }
    }
    const ua = navigator.userAgent;
    let version = 'Unknown';

    if (browser === 'Chrome') {
      // Try multiple patterns for Chrome
      let match = ua.match(this.regexPatterns.chrome);
      if (!match) {
        // Fallback for Chrome mobile
        match = ua.match(/crios\/(\d+\.\d+(?:\.\d+)?)/i);
      }
      if (!match) {
        // Fallback for Chrome desktop
        match = ua.match(/chrome\/(\d+\.\d+(?:\.\d+)?)/i);
      }
      version = match && match[1] ? match[1] : 'Unknown';
    } else if (browser === 'Firefox') {
      // Try multiple patterns for Firefox
      let match = ua.match(this.regexPatterns.firefox);
      if (!match) {
        // Fallback for Firefox mobile
        match = ua.match(/fxios\/(\d+\.\d+(?:\.\d+)?)/i);
      }
      if (!match) {
        // Fallback for Firefox desktop
        match = ua.match(/firefox\/(\d+\.\d+(?:\.\d+)?)/i);
      }
      version = match && match[1] ? match[1] : 'Unknown';
    } else if (browser === 'Safari') {
      // Try multiple patterns for Safari
      let match = ua.match(this.regexPatterns.safari);
      if (!match) {
        // Fallback for Safari version
        match = ua.match(/version\/(\d+\.\d+(?:\.\d+)?)/i);
      }
      if (!match) {
        // Fallback for Safari mobile
        match = ua.match(/mobile\/\w+\s(\d+\.\d+(?:\.\d+)?)/i);
      }
      version = match && match[1] ? match[1] : 'Unknown';
    } else if (browser === 'Edge') {
      // Try multiple patterns for Edge
      let match = ua.match(this.regexPatterns.edge);
      if (!match) {
        // Fallback for Edge legacy
        match = ua.match(/edge\/(\d+\.\d+(?:\.\d+)?)/i);
      }
      if (!match) {
        // Fallback for Edge Chromium
        match = ua.match(/edg\/(\d+\.\d+(?:\.\d+)?)/i);
      }
      version = match && match[1] ? match[1] : 'Unknown';
    } else if (browser === 'Opera') {
      // Try multiple patterns for Opera
      let match = ua.match(this.regexPatterns.opera);
      if (!match) {
        // Fallback for Opera mobile
        match = ua.match(/opr\/(\d+\.\d+(?:\.\d+)?)/i);
      }
      if (!match) {
        // Fallback for Opera desktop
        match = ua.match(/opera\/(\d+\.\d+(?:\.\d+)?)/i);
      }
      version = match && match[1] ? match[1] : 'Unknown';
    } else if (browser === 'Internet Explorer') {
      // Try multiple patterns for IE
      let match = ua.match(this.regexPatterns.ie);
      if (!match) {
        // Fallback for IE 11
        match = ua.match(/rv:(\d+\.\d+(?:\.\d+)?)/i);
      }
      if (!match) {
        // Fallback for older IE
        match = ua.match(/msie\s(\d+\.\d+(?:\.\d+)?)/i);
      }
      version = match && (match[1] || match[2]) ? (match[1] || match[2] || 'Unknown') : 'Unknown';
    }

    // Additional fallback: try to extract any version number if still unknown
    if (version === 'Unknown' && browser !== 'Unknown') {
      const genericMatch = ua.match(/(\d+\.\d+(?:\.\d+)?)/);
      if (genericMatch && genericMatch[1]) {
        version = genericMatch[1];
      }
    }

    return version;
  }

  /**
   * Get engine information for browser
   * @param browser - Browser name
   * @returns Engine information
   */
  public getEngineInfo(browser: BrowserType): EngineInfo {
    const browserVersion = this.getBrowserVersion(browser);

    const engineMap: Record<BrowserType, EngineInfo> = {
      'Chrome': { engine: 'Blink', version: browserVersion },
      'Edge': { engine: 'Blink', version: browserVersion },
      'Firefox': { engine: 'Gecko', version: browserVersion },
      'Safari': { engine: 'WebKit', version: browserVersion },
      'Opera': { engine: 'Blink', version: browserVersion },
      'Internet Explorer': { engine: 'Trident', version: browserVersion },
      'Unknown': { engine: 'Unknown', version: 'Unknown' }
    };

    const result = engineMap[browser] || { engine: 'Unknown', version: 'Unknown' };

    // If engine version is still unknown, try to extract from user agent
    if (result.version === 'Unknown' && browser !== 'Unknown') {
      const ua = navigator.userAgent;

      // Try to extract engine version from user agent
      if (result.engine === 'Blink') {
        const blinkMatch = ua.match(/blink\/(\d+\.\d+(?:\.\d+)?)/i);
        if (blinkMatch && blinkMatch[1]) {
          result.version = blinkMatch[1];
        }
      } else if (result.engine === 'Gecko') {
        const geckoMatch = ua.match(/gecko\/(\d+\.\d+(?:\.\d+)?)/i);
        if (geckoMatch && geckoMatch[1]) {
          result.version = geckoMatch[1];
        }
      } else if (result.engine === 'WebKit') {
        const webkitMatch = ua.match(/webkit\/(\d+\.\d+(?:\.\d+)?)/i);
        if (webkitMatch && webkitMatch[1]) {
          result.version = webkitMatch[1];
        }
      } else if (result.engine === 'Trident') {
        const tridentMatch = ua.match(/trident\/(\d+\.\d+(?:\.\d+)?)/i);
        if (tridentMatch && tridentMatch[1]) {
          result.version = tridentMatch[1];
        }
      }
    }

    return result;
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
      } else {
        // Fallback for Windows without specific version
        osVersion = 'Windows';
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
        } else if (version >= 12) {
          osVersion = 'macOS Sierra';
        } else if (version >= 11) {
          osVersion = 'macOS El Capitan';
        } else if (version >= 10) {
          osVersion = 'macOS Yosemite';
        } else {
          osVersion = `macOS ${version}`;
        }
      } else {
        // Fallback for macOS without specific version
        osVersion = 'macOS';
      }
    } else if (/linux/i.test(ua) || /x11/i.test(ua)) {
      os = 'Linux';
      // Try to detect specific Linux distributions
      if (ua.includes('ubuntu')) {
        osVersion = 'Ubuntu';
      } else if (ua.includes('fedora')) {
        osVersion = 'Fedora';
      } else if (ua.includes('debian')) {
        osVersion = 'Debian';
      } else if (ua.includes('centos')) {
        osVersion = 'CentOS';
      } else if (ua.includes('redhat')) {
        osVersion = 'Red Hat';
      } else {
        osVersion = 'Linux';
      }
    } else if (/android/i.test(ua)) {
      os = 'Android';
      const match = ua.match(this.regexPatterns.android);
      if (match && match[1]) {
        const version = parseFloat(match[1]);
        if (version >= 14) {
          osVersion = `Android ${match[1]} (Android 14+)`;
        } else if (version >= 13) {
          osVersion = `Android ${match[1]} (Android 13)`;
        } else if (version >= 12) {
          osVersion = `Android ${match[1]} (Android 12)`;
        } else if (version >= 11) {
          osVersion = `Android ${match[1]} (Android 11)`;
        } else if (version >= 10) {
          osVersion = `Android ${match[1]} (Android 10)`;
        } else {
          osVersion = `Android ${match[1]}`;
        }
      } else {
        osVersion = 'Android';
      }
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      os = 'iOS';
      const match = ua.match(this.regexPatterns.ios);
      if (match && match[1]) {
        const version = match[1].replace(/_/g, '.');
        const versionNum = parseFloat(version);
        if (versionNum >= 17) {
          osVersion = `iOS ${version} (iOS 17+)`;
        } else if (versionNum >= 16) {
          osVersion = `iOS ${version} (iOS 16)`;
        } else if (versionNum >= 15) {
          osVersion = `iOS ${version} (iOS 15)`;
        } else if (versionNum >= 14) {
          osVersion = `iOS ${version} (iOS 14)`;
        } else {
          osVersion = `iOS ${version}`;
        }
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

export default SmartBrowserDetection; 