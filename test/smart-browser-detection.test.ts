/* eslint-disable @typescript-eslint/no-explicit-any */
import { SmartBrowserDetection, BrowserDetectionResult, DetectionMethodResult } from '../src/index';

describe('SmartBrowserDetection', () => {
  let detector: SmartBrowserDetection;

  beforeEach(() => {
    detector = new SmartBrowserDetection();
    detector.clearCache();
  });

  describe('Constructor', () => {
    test('should initialize with correct properties', () => {
      expect(detector).toBeInstanceOf(SmartBrowserDetection);
      expect(detector.getCacheStats().size).toBe(0);
    });
  });

  describe('detectBrowser', () => {
    test('should return cached result on subsequent calls', () => {
      const result1 = detector.detectBrowser();
      const result2 = detector.detectBrowser();

      expect(result1).toBe(result2);
      expect(detector.getCacheStats().size).toBe(1);
    });

    test('should return object with all required properties', () => {
      const result: BrowserDetectionResult = detector.detectBrowser();

      expect(result).toHaveProperty('browser');
      expect(result).toHaveProperty('browserVersion');
      expect(result).toHaveProperty('engine');
      expect(result).toHaveProperty('engineVersion');
      expect(result).toHaveProperty('platform');
      expect(result).toHaveProperty('os');
      expect(result).toHaveProperty('osVersion');
      expect(result).toHaveProperty('isMobile');
      expect(result).toHaveProperty('isTablet');
      expect(result).toHaveProperty('isDesktop');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('detectionMethods');
      expect(result).toHaveProperty('userAgent');
      expect(result).toHaveProperty('vendor');
      expect(result).toHaveProperty('timestamp');
    });

    test('should return valid browser detection result', () => {
      const result: BrowserDetectionResult = detector.detectBrowser();

      expect(typeof result.browser).toBe('string');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(result.detectionMethods)).toBe(true);
      expect(typeof result.timestamp).toBe('number');
    });
  });

  describe('apiDetection', () => {
    test('should detect Chrome via API', () => {
      // Mock Chrome API
       
      (global as any).window = {
        ...global.window,
        chrome: { runtime: { onConnect: true } }
      };

       
      const result: DetectionMethodResult = (detector as any).apiDetection();
      expect(result.browser).toBe('Chrome');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.method).toBe('apiDetection');
    });

    test('should detect Firefox via API', () => {
      // Mock Firefox API
      (global as any).window = {
        ...global.window,
        InstallTrigger: {},
        chrome: undefined
      };

      const result: DetectionMethodResult = (detector as any).apiDetection();
      expect(result.browser).toBe('Firefox');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should detect Safari via API', () => {
      // Mock Safari API
      (global as any).window = {
        ...global.window,
        safari: { pushNotification: true },
        chrome: undefined,
        InstallTrigger: undefined
      };

      const result: DetectionMethodResult = (detector as any).apiDetection();
      expect(result.browser).toBe('Safari');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should detect Edge via API', () => {
      // Mock Edge API
      (global as any).navigator = {
        ...global.navigator,
        userAgentData: {
          brands: [{ brand: 'Microsoft Edge' }]
        }
      };
      (global as any).window = {
        ...global.window,
        chrome: undefined,
        InstallTrigger: undefined,
        safari: undefined
      };

      const result: DetectionMethodResult = (detector as any).apiDetection();
      expect(result.browser).toBe('Edge');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should detect IE via API', () => {
      // Mock IE API
      (global as any).document = {
        ...global.document,
        documentMode: 11
      };
      (global as any).window = {
        ...global.window,
        chrome: undefined,
        InstallTrigger: undefined,
        safari: undefined
      };
      (global as any).navigator = {
        ...global.navigator,
        userAgentData: undefined
      };

      const result: DetectionMethodResult = (detector as any).apiDetection();
      expect(result.browser).toBe('Internet Explorer');
      expect(result.confidence).toBeGreaterThan(0.9);
    });
  });

  describe('vendorDetection', () => {
    test('should detect Chrome via vendor', () => {
      (global as any).navigator = {
        ...global.navigator,
        vendor: 'Google Inc.',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };

      const result: DetectionMethodResult = (detector as any).vendorDetection();
      expect(result.browser).toBe('Chrome');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('should detect Safari via vendor', () => {
      (global as any).navigator = {
        ...global.navigator,
        vendor: 'Apple Computer, Inc.'
      };

      const result: DetectionMethodResult = (detector as any).vendorDetection();
      expect(result.browser).toBe('Safari');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('should detect Firefox via vendor', () => {
      (global as any).navigator = {
        ...global.navigator,
        vendor: 'Mozilla Foundation'
      };

      const result: DetectionMethodResult = (detector as any).vendorDetection();
      expect(result.browser).toBe('Firefox');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should detect Edge via empty vendor and UA', () => {
      (global as any).navigator = {
        ...global.navigator,
        vendor: '',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      };

      const result: DetectionMethodResult = (detector as any).vendorDetection();
      expect(result.browser).toBe('Edge');
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('userAgentDetection', () => {
    test('should detect Chrome via user agent', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };

      const result: DetectionMethodResult = (detector as any).userAgentDetection();
      expect(result.browser).toBe('Chrome');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should detect Edge via user agent', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      };

      const result: DetectionMethodResult = (detector as any).userAgentDetection();
      expect(result.browser).toBe('Edge');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('should detect Firefox via user agent', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
      };

      const result: DetectionMethodResult = (detector as any).userAgentDetection();
      expect(result.browser).toBe('Firefox');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('should detect Safari via user agent', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
      };

      const result: DetectionMethodResult = (detector as any).userAgentDetection();
      expect(result.browser).toBe('Safari');
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('detectMobile', () => {
    test('should detect mobile via user agent', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      };
      (global as any).window = {
        ...global.window,
        innerWidth: 375
      };

      const result: boolean = detector.detectMobile();
      expect(result).toBe(true);
    });

    test('should detect mobile via touch events', () => {
      (global as any).navigator = {
        ...global.navigator,
        maxTouchPoints: 5
      };
      (global as any).window = {
        ...global.window,
        innerWidth: 768,
        ontouchstart: true
      };

      const result: boolean = detector.detectMobile();
      expect(result).toBe(true);
    });

    test('should not detect mobile for desktop', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };
      (global as any).window = {
        ...global.window,
        innerWidth: 1920
      };

      const result: boolean = detector.detectMobile();
      expect(result).toBe(false);
    });
  });

  describe('detectTablet', () => {
    test('should detect tablet via user agent', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      };
      (global as any).window = {
        ...global.window,
        innerWidth: 1024,
        ontouchstart: true
      };

      const result: boolean = detector.detectTablet();
      expect(result).toBe(true);
    });

    test('should detect tablet via screen size', () => {
      (global as any).window = {
        ...global.window,
        innerWidth: 800,
        ontouchstart: true
      };

      const result: boolean = detector.detectTablet();
      expect(result).toBe(true);
    });
  });

  describe('getBrowserVersion', () => {
    test('should extract Chrome version', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };

      const version: string = detector.getBrowserVersion('Chrome');
      expect(version).toBe('120.0.0.0');
    });

    test('should extract Firefox version', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
      };

      const version: string = detector.getBrowserVersion('Firefox');
      expect(version).toBe('120.0');
    });

    test('should return Unknown for unknown browser', () => {
      const version: string = detector.getBrowserVersion('Unknown');
      expect(version).toBe('Unknown');
    });
  });

  describe('getEngineInfo', () => {
    test('should return correct engine for Chrome', () => {
      const engineInfo = detector.getEngineInfo('Chrome');
      expect(engineInfo.engine).toBe('Blink');
    });

    test('should return correct engine for Firefox', () => {
      const engineInfo = detector.getEngineInfo('Firefox');
      expect(engineInfo.engine).toBe('Gecko');
    });

    test('should return correct engine for Safari', () => {
      const engineInfo = detector.getEngineInfo('Safari');
      expect(engineInfo.engine).toBe('WebKit');
    });

    test('should return correct engine for Edge', () => {
      const engineInfo = detector.getEngineInfo('Edge');
      expect(engineInfo.engine).toBe('Blink');
    });

    test('should return correct engine for IE', () => {
      const engineInfo = detector.getEngineInfo('Internet Explorer');
      expect(engineInfo.engine).toBe('Trident');
    });
  });

  describe('getOSInfo', () => {
    test('should detect Windows', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };

      const osInfo = detector.getOSInfo();
      expect(osInfo.os).toBe('Windows');
      expect(osInfo.osVersion).toContain('Windows');
    });

    test('should detect macOS', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
      };

      const osInfo = detector.getOSInfo();
      expect(osInfo.os).toBe('macOS');
      expect(osInfo.osVersion).toContain('macOS');
    });

    test('should detect Android', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      };

      const osInfo = detector.getOSInfo();
      expect(osInfo.os).toBe('Android');
      expect(osInfo.osVersion).toContain('Android');
    });

    test('should detect iOS', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      };

      const osInfo = detector.getOSInfo();
      expect(osInfo.os).toBe('iOS');
      expect(osInfo.osVersion).toContain('iOS');
    });
  });

  describe('getPlatform', () => {
    test('should return Desktop for desktop environment', () => {
      (global as any).window = {
        ...global.window,
        innerWidth: 1920
      };

      const platform = detector.getPlatform();
      expect(platform).toBe('Desktop');
    });

    test('should return Mobile for mobile environment', () => {
      (global as any).navigator = {
        ...global.navigator,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      };
      (global as any).window = {
        ...global.window,
        innerWidth: 375
      };

      const platform = detector.getPlatform();
      expect(platform).toBe('Mobile');
    });
  });

  describe('getCompleteInfo', () => {
    test('should return complete browser information', () => {
      const completeInfo = detector.getCompleteInfo();

      expect(completeInfo).toHaveProperty('browser');
      expect(completeInfo).toHaveProperty('browserVersion');
      expect(completeInfo).toHaveProperty('platform');
      expect(completeInfo).toHaveProperty('os');
      expect(completeInfo).toHaveProperty('osVersion');
      expect(completeInfo).toHaveProperty('isMobile');
      expect(completeInfo).toHaveProperty('isTablet');
      expect(completeInfo).toHaveProperty('isDesktop');
      expect(completeInfo).toHaveProperty('confidence');
      expect(completeInfo).toHaveProperty('userAgent');
      expect(completeInfo).toHaveProperty('vendor');
      expect(completeInfo).toHaveProperty('timestamp');
    });
  });

  describe('Cache Management', () => {
    test('should clear cache', () => {
      detector.detectBrowser(); // Populate cache
      expect(detector.getCacheStats().size).toBe(1);

      detector.clearCache();
      expect(detector.getCacheStats().size).toBe(0);
    });

    test('should return cache statistics', () => {
      const stats = detector.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('keys');
      expect(Array.isArray(stats.keys)).toBe(true);
    });
  });
}); 