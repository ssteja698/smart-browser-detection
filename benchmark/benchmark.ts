/**
 * Smart Browser Detection Benchmark (TypeScript)
 * Compares performance and accuracy with other browser detection libraries
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { SmartBrowserDetection } from '../src/index';

type TestEnvironment = {
  name: string;
  userAgent: string;
  vendor: string;
  expected: string;
  isSpoofed?: boolean;
};

const testEnvironments: TestEnvironment[] = [
  {
    name: 'Chrome Desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    vendor: 'Google Inc.',
    expected: 'Chrome'
  },
  {
    name: 'Firefox Desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    vendor: 'Mozilla Foundation',
    expected: 'Firefox'
  },
  {
    name: 'Safari Desktop',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    vendor: 'Apple Computer, Inc.',
    expected: 'Safari'
  },
  {
    name: 'Edge Desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    vendor: '',
    expected: 'Edge'
  },
  {
    name: 'Edge Mobile Android',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    vendor: '',
    expected: 'Edge'
  },
  {
    name: 'Chrome Mobile',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    vendor: 'Google Inc.',
    expected: 'Chrome'
  },
  {
    name: 'Safari Mobile',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    vendor: 'Apple Computer, Inc.',
    expected: 'Safari'
  },
  {
    name: 'Firefox Mobile',
    userAgent: 'Mozilla/5.0 (Android 13; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0',
    vendor: 'Mozilla Foundation',
    expected: 'Firefox'
  }
];

const spoofedEnvironments: TestEnvironment[] = [
  {
    name: 'Spoofed Chrome as Firefox',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    vendor: 'Google Inc.', // Real Chrome vendor
    expected: 'Chrome', // Should detect real browser despite spoofed UA
    isSpoofed: true
  },
  {
    name: 'Spoofed Edge as Chrome',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    vendor: '', // Real Edge vendor
    expected: 'Edge', // Should detect real browser despite spoofed UA
    isSpoofed: true
  }
];

function mockEnvironment(env: TestEnvironment): void {
  global.navigator = {
    userAgent: env.userAgent,
    vendor: env.vendor,
    maxTouchPoints: env.userAgent.includes('Mobile') ? 5 : 0
  } as any;

  global.window = {
    innerWidth: env.userAgent.includes('Mobile') ? 375 : 1920,
    innerHeight: env.userAgent.includes('Mobile') ? 667 : 1080,
    chrome: env.expected === 'Chrome' ? { runtime: { onConnect: true }, webstore: true } : undefined,
    InstallTrigger: env.expected === 'Firefox' ? {} : undefined,
    safari: env.expected === 'Safari' ? { pushNotification: true } : undefined,
    opera: env.expected === 'Opera' ? { version: '120.0' } : undefined
  } as any;

  global.document = {
    documentMode: env.expected === 'Internet Explorer' ? 11 : undefined,
    createElement: () => ({
      style: {},
      parentNode: { removeChild: () => { } }
    }) as any,
    body: { appendChild: () => { } } as any
  } as any;
}

function runAccuracyTest(): number {
  console.log('\n🔍 ACCURACY TEST');
  console.log('='.repeat(50));

  let correctDetections = 0;
  const totalTests = testEnvironments.length + spoofedEnvironments.length;

  // Test normal environments
  testEnvironments.forEach(env => {
    mockEnvironment(env);
    const detector = new SmartBrowserDetection();
    const result = detector.detectBrowser();
    const isCorrect = result.browser === env.expected;
    const status = isCorrect ? '✅' : '❌';
    console.log(`${status} ${env.name}:`);
    console.log(`   Expected: ${env.expected}`);
    console.log(`   Detected: ${result.browser}`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   Methods: ${result.detectionMethods.join(', ')}`);
    console.log('');
    if (isCorrect) correctDetections++;
  });

  // Test spoofed environments
  spoofedEnvironments.forEach(env => {
    mockEnvironment(env);
    const detector = new SmartBrowserDetection();
    const result = detector.detectBrowser();
    const isCorrect = result.browser === env.expected;
    const status = isCorrect ? '✅' : '❌';
    console.log(`${status} ${env.name} (SPOOFED):`);
    console.log(`   Expected: ${env.expected} (real browser)`);
    console.log(`   Detected: ${result.browser}`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   Methods: ${result.detectionMethods.join(', ')}`);
    console.log('');
    if (isCorrect) correctDetections++;
  });

  const accuracy = (correctDetections / totalTests) * 100;
  console.log(`📊 Overall Accuracy: ${accuracy.toFixed(1)}% (${correctDetections}/${totalTests})`);
  return accuracy;
}

function runPerformanceTest(): number {
  console.log('\n⚡ PERFORMANCE TEST');
  console.log('='.repeat(50));

  const testEnv = testEnvironments[0]!;
  mockEnvironment(testEnv);
  const detector = new SmartBrowserDetection();
  const iterations = 10000;
  const startTime = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    detector.clearCache();
    detector.detectBrowser();
  }
  const endTime = process.hrtime.bigint();
  const totalTime = Number(endTime - startTime) / 1000000; // ms
  const avgTime = totalTime / iterations;
  console.log(`🔄 ${iterations.toLocaleString()} iterations completed`);
  console.log(`⏱️  Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`⚡ Average time per detection: ${avgTime.toFixed(4)}ms`);
  console.log(`🚀 Detections per second: ${(1000 / avgTime).toFixed(0)}`);
  return avgTime;
}

function runMemoryTest(): { heapUsed: number; heapTotal: number; external: number } {
  console.log('\n💾 MEMORY TEST');
  console.log('='.repeat(50));
  const initialMemory = process.memoryUsage();
  const detectors: SmartBrowserDetection[] = [];
  for (let i = 0; i < 1000; i++) {
    const detector = new SmartBrowserDetection();
    detector.detectBrowser();
    detectors.push(detector);
  }
  const finalMemory = process.memoryUsage();
  const memoryIncrease = {
    heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
    heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
    external: finalMemory.external - initialMemory.external
  };
  console.log(`📦 Created ${detectors.length} detector instances`);
  console.log(`💾 Memory increase:`);
  console.log(`   Heap Used: ${(memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Heap Total: ${(memoryIncrease.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   External: ${(memoryIncrease.external / 1024 / 1024).toFixed(2)} MB`);
  return memoryIncrease;
}

function runCacheTest(): { time1: number; time2: number; speedup: number } {
  console.log('\n🗄️  CACHE TEST');
  console.log('='.repeat(50));
  const testEnv = testEnvironments[0]!;
  mockEnvironment(testEnv);
  const detector = new SmartBrowserDetection();
  // First call (no cache)
  const startTime1 = process.hrtime.bigint();
  detector.detectBrowser();
  const endTime1 = process.hrtime.bigint();
  const time1 = Number(endTime1 - startTime1) / 1000000;
  // Second call (cached)
  const startTime2 = process.hrtime.bigint();
  detector.detectBrowser();
  const endTime2 = process.hrtime.bigint();
  const time2 = Number(endTime2 - startTime2) / 1000000;
  console.log(`🔄 First call (no cache): ${time1.toFixed(4)}ms`);
  console.log(`⚡ Second call (cached): ${time2.toFixed(4)}ms`);
  console.log(`🚀 Speed improvement: ${(time1 / time2).toFixed(1)}x faster`);
  console.log(`📊 Cache stats: ${JSON.stringify(detector.getCacheStats())}`);
  return { time1, time2, speedup: time1 / time2 };
}

function runComparisonBenchmark(): {
  accuracy: number;
  performance: number;
  memory: { heapUsed: number; heapTotal: number; external: number };
  cache: { time1: number; time2: number; speedup: number };
} {
  console.log('\n📊 COMPARISON BENCHMARK');
  console.log('='.repeat(50));
  const results = {
    accuracy: runAccuracyTest(),
    performance: runPerformanceTest(),
    memory: runMemoryTest(),
    cache: runCacheTest()
  };
  return results;
}

function main(): void {
  runComparisonBenchmark();
}

if (require.main === module) {
  main();
} 