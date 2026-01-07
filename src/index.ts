#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { StateAnalyzer } from './analyzer';
import { AnalysisResult, ComponentInfo } from './types';

const program = new Command();

program.name('state-analyzer').description('CLI tool for analyzing React state management patterns').version('0.2.1');

program
  .command('analyze')
  .description('Analyze React code in the specified path')
  .argument('<path>', 'Directory path to analyze')
  .option('-o, --output <file>', 'Output file path for JSON results')
  .option('-v, --verbose', 'Verbose output')
  .action((targetPath: string, options: { output?: string; verbose?: boolean }) => {
    console.log(chalk.blue('\nStarting state analysis...\n'));

    const analyzer = new StateAnalyzer();
    const result = analyzer.analyze(targetPath);

    printSummary(result);
    printTopComponents(result);

    if (options.verbose) {
      printDetails(result);
    }

    if (options.output) {
      saveResult(result, options.output);
    }
  });

function printSummary(result: AnalysisResult): void {
  console.log(chalk.bold('=== Analysis Summary ===\n'));

  const componentsWithState = result.components.filter(c => c.stateUsages.length > 0).length;
  const percentage = result.summary.totalComponents > 0
    ? ((componentsWithState / result.summary.totalComponents) * 100).toFixed(1)
    : '0';

  console.log(`Total components: ${chalk.cyan(result.summary.totalComponents)}`);
  console.log(`Components with state: ${chalk.cyan(componentsWithState)} (${percentage}%)`);
  console.log(`Total state usage: ${chalk.cyan(result.summary.totalStateUsages)}`);

  const average = componentsWithState > 0
    ? (result.summary.totalStateUsages / componentsWithState).toFixed(1)
    : '0';
  console.log(`Average: ${chalk.cyan(average)} states/component\n`);

  console.log('Usage by type:');
  const typeLabels: Record<string, string> = {
    useState: 'useState',
    useContext: 'useContext',
    useReducer: 'useReducer',
    zustand: 'zustand',
    jotai: 'jotai',
    redux: 'redux',
  };

  for (const [type, count] of Object.entries(result.summary.byType)) {
    const label = typeLabels[type] || type;
    console.log(`  ${label}: ${chalk.yellow(count)}`);
  }
  console.log('');

  // State distribution
  console.log('State distribution:');
  const distribution = calculateDistribution(result.components);
  for (const [range, count] of Object.entries(distribution)) {
    const bar = '█'.repeat(Math.min(count, 20));
    console.log(`  ${range.padEnd(12)} ${chalk.cyan(bar)} ${chalk.gray(`(${count})`)}`);
  }
  console.log('');
}

function calculateDistribution(components: ComponentInfo[]): Record<string, number> {
  const dist: Record<string, number> = {
    '1-2 states': 0,
    '3-5 states': 0,
    '6-10 states': 0,
    '11+ states': 0,
  };

  for (const comp of components) {
    const count = comp.stateUsages.length;
    if (count === 0) continue;
    if (count <= 2) dist['1-2 states']++;
    else if (count <= 5) dist['3-5 states']++;
    else if (count <= 10) dist['6-10 states']++;
    else dist['11+ states']++;
  }

  return dist;
}

function printDetails(result: AnalysisResult): void {
  console.log(chalk.bold('=== Component Details ===\n'));

  for (const comp of result.components) {
    if (comp.stateUsages.length === 0) continue;

    console.log(chalk.green(`${comp.name}`), chalk.gray(`(${comp.file})`));
    for (const usage of comp.stateUsages) {
      console.log(`  - ${usage.type}: ${chalk.gray(`line ${usage.line}`)}`);
    }
    console.log('');
  }
}

function printTopComponents(result: AnalysisResult): void {
  console.log(chalk.bold('=== Top 10 Components ===\n'));

  const sorted = [...result.components]
    .filter(c => c.stateUsages.length > 0)
    .sort((a, b) => b.stateUsages.length - a.stateUsages.length)
    .slice(0, 10);

  if (sorted.length === 0) {
    console.log(chalk.gray('No components with state found.\n'));
    return;
  }

  sorted.forEach((comp, index) => {
    const patternCounts: Record<string, number> = {};
    comp.stateUsages.forEach(usage => {
      patternCounts[usage.type] = (patternCounts[usage.type] || 0) + 1;
    });

    const patterns = Object.entries(patternCounts)
      .map(([type, count]) => `${type}(${count})`)
      .join(', ');

    console.log(`${chalk.cyan((index + 1).toString().padStart(2))}. ${chalk.green(comp.name)} ${chalk.gray(`(${comp.stateUsages.length} states)`)} - ${chalk.gray(comp.file)}`);
    console.log(`    ${chalk.yellow(patterns)}\n`);
  });
}

function saveResult(result: AnalysisResult, outputPath: string): void {
  const absolutePath = path.resolve(outputPath);
  fs.writeFileSync(absolutePath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(chalk.green(`Results saved to ${absolutePath}\n`));
}

program.parse();
