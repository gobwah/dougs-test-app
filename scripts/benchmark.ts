#!/usr/bin/env ts-node

/**
 * Performance Benchmark Script
 *
 * This script runs performance benchmarks for the validation system
 * with various dataset sizes to measure execution time and memory usage.
 */

import { MovementService } from '../src/models/movements/movement.service';
import { BalanceService } from '../src/models/balances/balance.service';
import { DuplicateService } from '../src/models/duplicates/duplicate.service';
import {
  ValidationRequestDto,
  MovementDto,
  BalanceDto,
} from '../src/models/movements/dto/request.dto';

interface BenchmarkResult {
  datasetSize: string;
  movements: number;
  balances: number;
  durationMs: number;
  memoryMB: number;
  throughput: number; // movements per second
}

function generateMovements(count: number): MovementDto[] {
  const movements: MovementDto[] = [];
  const labels = [
    'SALARY PAYMENT',
    'RENT PAYMENT',
    'UTILITIES',
    'GROCERIES',
    'RESTAURANT',
    'TRANSPORT',
    'ENTERTAINMENT',
  ];

  for (let i = 1; i <= count; i++) {
    const date = new Date(2024, 0, 1 + (i % 365));
    movements.push({
      id: i,
      date: date.toISOString().split('T')[0],
      label: labels[i % labels.length],
      amount: Math.round((Math.random() * 2000 - 1000) * 100) / 100,
    });
  }

  return movements;
}

function generateBalances(
  movementCount: number,
  balanceCount: number,
): BalanceDto[] {
  const balances: BalanceDto[] = [];
  const daysBetween = Math.floor(365 / balanceCount);

  for (let i = 0; i < balanceCount; i++) {
    const date = new Date(2024, 0, 1 + i * daysBetween);
    balances.push({
      date: date.toISOString().split('T')[0],
      balance: Math.round(Math.random() * 10000 * 100) / 100,
    });
  }

  return balances;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function runBenchmark(
  movements: MovementDto[],
  balances: BalanceDto[],
  datasetSize: string,
): BenchmarkResult {
  const balanceService = new BalanceService();
  const duplicateService = new DuplicateService();
  const movementService = new MovementService(duplicateService, balanceService);

  const request: ValidationRequestDto = { movements, balances };

  // Force garbage collection if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((global as any).gc) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).gc();
  }

  const memBefore = process.memoryUsage().heapUsed;
  const start = process.hrtime.bigint();

  movementService.validateMovements(request);

  const end = process.hrtime.bigint();
  const memAfter = process.memoryUsage().heapUsed;

  const durationMs = Number(end - start) / 1_000_000;
  const memoryMB = (memAfter - memBefore) / 1024 / 1024;
  const throughput = movements.length / (durationMs / 1000);

  return {
    datasetSize,
    movements: movements.length,
    balances: balances.length,
    durationMs,
    memoryMB,
    throughput,
  };
}

function printResults(results: BenchmarkResult[]): void {
  console.log('\n📊 Benchmark Results\n');
  console.log('─'.repeat(100));
  console.log(
    '| Dataset      | Movements | Balances | Duration (ms) | Memory (MB) | Throughput (mov/s) |',
  );
  console.log('─'.repeat(100));

  for (const result of results) {
    console.log(
      `| ${result.datasetSize.padEnd(12)} | ${String(result.movements).padStart(9)} | ${String(result.balances).padStart(8)} | ${formatNumber(result.durationMs).padStart(10)} | ${formatNumber(result.memoryMB).padStart(12)} | ${formatNumber(result.throughput).padStart(13)} |`,
    );
  }

  console.log('─'.repeat(100));
  console.log('\n');
}

async function main(): Promise<void> {
  console.log('🚀 Starting performance benchmarks...\n');

  const results: BenchmarkResult[] = [];

  // Small dataset
  console.log('📦 Testing with small dataset (100 movements, 4 balances)...');
  const smallMovements = generateMovements(100);
  const smallBalances = generateBalances(100, 4);
  results.push(runBenchmark(smallMovements, smallBalances, 'Small'));

  // Medium dataset
  console.log(
    '📦 Testing with medium dataset (1,000 movements, 12 balances)...',
  );
  const mediumMovements = generateMovements(1000);
  const mediumBalances = generateBalances(1000, 12);
  results.push(runBenchmark(mediumMovements, mediumBalances, 'Medium'));

  // Large dataset
  console.log(
    '📦 Testing with large dataset (10,000 movements, 24 balances)...',
  );
  const largeMovements = generateMovements(10000);
  const largeBalances = generateBalances(10000, 24);
  results.push(runBenchmark(largeMovements, largeBalances, 'Large'));

  // Very large dataset
  console.log(
    '📦 Testing with very large dataset (50,000 movements, 50 balances)...',
  );
  const veryLargeMovements = generateMovements(50000);
  const veryLargeBalances = generateBalances(50000, 50);
  results.push(
    runBenchmark(veryLargeMovements, veryLargeBalances, 'Very Large'),
  );

  // Dataset with duplicates
  console.log(
    '📦 Testing with dataset containing duplicates (1,000 movements + 50 duplicates)...',
  );
  const dupMovements = generateMovements(1000);
  for (let i = 0; i < 50; i++) {
    dupMovements.push({
      ...dupMovements[i],
      id: dupMovements.length + i + 1,
    });
  }
  const dupBalances = generateBalances(1000, 12);
  results.push(runBenchmark(dupMovements, dupBalances, 'With Duplicates'));

  printResults(results);

  // Summary
  console.log('📈 Performance Analysis:\n');
  const avgThroughput =
    results.reduce((sum, r) => sum + r.throughput, 0) / results.length;
  const maxDuration = Math.max(...results.map((r) => r.durationMs));
  const maxMemory = Math.max(...results.map((r) => r.memoryMB));

  console.log(
    `  • Average throughput: ${formatNumber(avgThroughput)} movements/second`,
  );
  console.log(`  • Maximum duration: ${formatNumber(maxDuration)}ms`);
  console.log(`  • Maximum memory: ${formatNumber(maxMemory)}MB`);
  console.log('\n✅ Benchmarks completed!\n');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error during benchmarks:', error);
    process.exit(1);
  });
}

export { runBenchmark, generateMovements, generateBalances };
