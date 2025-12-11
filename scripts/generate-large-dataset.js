#!/usr/bin/env node

/**
 * Script to generate a large JSON dataset for testing
 *
 * # Version moyenne (10 000 mouvements, 50 balances)
 * node scripts/generate-large-dataset.js 10000 50
 *
 * # Version grande (50 000 mouvements, 100 balances) - ACTUELLE
 * node scripts/generate-large-dataset.js 50000 100
 *
 * # Version très grande (100 000 mouvements, 200 balances)
 * node scripts/generate-large-dataset.js 100000 200
 *
 * # Version énorme (500 000 mouvements, 500 balances) - Attention, très lourd !
 * node scripts/generate-large-dataset.js 500000 500
 */

const fs = require('node:fs');
const path = require('node:path');

const labels = [
  'SALARY PAYMENT',
  'RENT PAYMENT',
  'UTILITIES',
  'GROCERIES',
  'RESTAURANT',
  'TRANSPORT',
  'ENTERTAINMENT',
  'INSURANCE',
  'PHONE BILL',
  'INTERNET',
  'GAS STATION',
  'PHARMACY',
  'BOOKSTORE',
  'CLOTHING',
  'GIFT',
];

function generateMovements(count) {
  const movements = [];
  const startDate = new Date('2024-01-01');

  for (let i = 1; i <= count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (i % 365));

    movements.push({
      id: i,
      date: date.toISOString().split('T')[0],
      label: labels[i % labels.length],
      amount: Math.round((Math.random() * 2000 - 1000) * 100) / 100,
    });
  }

  return movements;
}

function generateBalances(movementCount, balanceCount) {
  const balances = [];
  const startDate = new Date('2024-01-01');
  const daysBetween = Math.floor(365 / balanceCount);

  let cumulativeBalance = 0;

  for (let i = 0; i < balanceCount; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * daysBetween);

    // Simulate a realistic balance progression
    cumulativeBalance += Math.random() * 5000 - 2000;

    balances.push({
      date: date.toISOString().split('T')[0],
      balance: Math.round(cumulativeBalance * 100) / 100,
    });
  }

  return balances;
}

function calculateFinalBalance(movements, initialBalance = 0) {
  return movements.reduce((sum, m) => sum + m.amount, initialBalance);
}

function main() {
  const args = process.argv.slice(2);
  const movementCount = parseInt(args[0]) || 10000;
  const balanceCount = parseInt(args[1]) || 50;

  console.log(
    `Generating dataset with ${movementCount} movements and ${balanceCount} balances...`,
  );

  const movements = generateMovements(movementCount);
  const balances = generateBalances(movementCount, balanceCount);

  // Calculate the final balance to make it valid
  const finalBalance = calculateFinalBalance(movements);
  if (balances.length > 0) {
    balances[balances.length - 1].balance =
      Math.round(finalBalance * 100) / 100;
  }

  const dataset = {
    movements,
    balances,
  };

  const outputPath = path.join(__dirname, '../examples/example-large.json');
  fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2));

  const fileSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);

  console.log(`✅ Generated ${outputPath}`);
  console.log(`   - Movements: ${movementCount.toLocaleString()}`);
  console.log(`   - Balances: ${balanceCount}`);
  console.log(`   - File size: ${fileSize} MB`);
}

main();
