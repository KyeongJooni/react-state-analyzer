<div align="center">

# React State Analyzer

<p align="center">
  <strong>A powerful CLI tool for analyzing React state management patterns</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-state-analyzer">
    <img src="https://img.shields.io/npm/v/react-state-analyzer.svg" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/react-state-analyzer">
    <img src="https://img.shields.io/npm/dm/react-state-analyzer.svg" alt="npm downloads" />
  </a>
  <a href="https://github.com/KyeongJooni/react-state-analyzer/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/react-state-analyzer.svg" alt="license" />
  </a>
  <a href="https://nodejs.org">
    <img src="https://img.shields.io/node/v/react-state-analyzer.svg" alt="node version" />
  </a>
</p>

</div>

---

## Overview

React State Analyzer helps you understand and optimize state management in your React applications. Get instant insights into how your components use state, identify complexity hotspots, and make informed architectural decisions.

**Perfect for:**
- 🔍 Code reviews and refactoring
- 📊 Architecture analysis and documentation
- 🚀 Migration planning between state management solutions
- 👥 Team onboarding and knowledge sharing

## Features

- ⚡ **Fast Analysis** - Powered by TypeScript AST parsing
- 🎯 **Multi-Library Support** - Detects useState, useContext, useReducer, Redux, Zustand, and Jotai
- 📈 **Visual Statistics** - Distribution charts and component rankings
- 💾 **Export Results** - Save analysis data as JSON
- 🎨 **Beautiful CLI Output** - Color-coded, easy-to-read terminal display

## Installation

```bash
npm install -g react-state-analyzer
```

Or use directly with npx:

```bash
npx react-state-analyzer analyze <path>
```

## Quick Start

Analyze your React project:

```bash
state-analyzer analyze ./src
```

Get detailed insights with verbose mode:

```bash
state-analyzer analyze ./src --verbose
```

Export results for further processing:

```bash
state-analyzer analyze ./src --output analysis.json
```

## Example Output

```
Starting state analysis...

=== Analysis Summary ===

Total components: 45
Components with state: 28 (62.2%)
Total state usage: 87
Average: 3.1 states/component

Usage by type:
  useState: 52
  redux: 23
  zustand: 18
  useContext: 12
  jotai: 5

State distribution:
  1-2 states   ████████████ (18)
  3-5 states   ████████ (8)
  6-10 states  ██ (2)
  11+ states    (0)

=== Top 10 Components ===

 1. UserDashboard (8 states) - src/pages/Dashboard.tsx
    useState(5), zustand(2), useContext(1)
```

## Supported State Patterns

| Library | Hooks Detected |
|---------|---------------|
| **React** | `useState`, `useContext`, `useReducer` |
| **Redux** | `useSelector`, `useDispatch`, `useStore` |
| **Zustand** | `use*Store()` patterns |
| **Jotai** | `useAtom`, `useAtomValue`, `useSetAtom` |

## CLI Options

| Option | Alias | Description |
|--------|-------|-------------|
| `<path>` | - | Directory to analyze (required) |
| `--output <file>` | `-o` | Save results as JSON |
| `--verbose` | `-v` | Show detailed component information |

## Use Cases

### Code Review
Identify components with excessive state that may benefit from refactoring:
```bash
state-analyzer analyze ./src --verbose | grep "11+ states"
```

### Migration Planning
Understand current patterns before migrating to a new state management solution:
```bash
state-analyzer analyze ./src --output before-migration.json
```

### CI/CD Integration
Track state complexity metrics over time:
```bash
state-analyzer analyze ./src --output metrics.json
# Parse metrics.json in your CI pipeline
```

## JSON Export Format

```json
{
  "summary": {
    "totalComponents": 45,
    "totalStateUsages": 87,
    "byType": {
      "useState": 52,
      "zustand": 18,
      "useContext": 12,
      "jotai": 5
    }
  },
  "components": [
    {
      "name": "ComponentName",
      "file": "relative/path/to/file.tsx",
      "stateUsages": [
        {
          "type": "useState",
          "name": "useState",
          "file": "relative/path/to/file.tsx",
          "line": 15,
          "component": "ComponentName"
        }
      ]
    }
  ]
}
```

## Requirements

- Node.js >= 16.0.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE) - feel free to use this project for any purpose.

## Links

- [npm package](https://www.npmjs.com/package/react-state-analyzer)
- [GitHub repository](https://github.com/KyeongJooni/react-state-analyzer)
- [Issues](https://github.com/KyeongJooni/react-state-analyzer/issues)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/KyeongJooni">KyeongJooni</a></sub>
</div>
