import { Project, SourceFile, SyntaxKind } from 'ts-morph';
import * as path from 'path';
import { StateUsage, ComponentInfo, AnalysisResult } from './types';

export class StateAnalyzer {
  private project: Project;

  constructor() {
    this.project = new Project({
      skipAddingFilesFromTsConfig: true,
    });
  }

  analyze(targetPath: string): AnalysisResult {
    const absolutePath = path.resolve(targetPath).replace(/\\/g, '/');

    this.project.addSourceFilesAtPaths([
      `${absolutePath}/**/*.tsx`,
      `${absolutePath}/**/*.ts`,
      `!${absolutePath}/**/node_modules/**`,
      `!${absolutePath}/**/*.test.*`,
      `!${absolutePath}/**/*.spec.*`,
      `!${absolutePath}/**/*.d.ts`,
      `!${absolutePath}/**/*.config.*`,
      `!${absolutePath}/**/dist/**`,
      `!${absolutePath}/**/build/**`,
    ]);

    const sourceFiles = this.project.getSourceFiles();
    const components: ComponentInfo[] = [];
    const allUsages: StateUsage[] = [];

    for (const sourceFile of sourceFiles) {
      const fileComponents = this.analyzeFile(sourceFile);
      components.push(...fileComponents);
      fileComponents.forEach(comp => allUsages.push(...comp.stateUsages));
    }

    const byType = this.countByType(allUsages);

    return {
      summary: {
        totalComponents: components.length,
        totalStateUsages: allUsages.length,
        byType,
      },
      components,
      suggestions: [],
    };
  }

  private analyzeFile(sourceFile: SourceFile): ComponentInfo[] {
    const components: ComponentInfo[] = [];
    const filePath = sourceFile.getFilePath();
    const relativePath = path.relative(process.cwd(), filePath);

    // Skip common non-component files
    const fileName = path.basename(filePath);
    if (/(styled|styles|constants|types|utils|helpers|config|api|services)\.tsx?$/.test(fileName)) {
      return [];
    }

    // Find function declarations and arrow functions that might be components
    const functions = sourceFile.getFunctions();
    const variableDeclarations = sourceFile.getVariableDeclarations();

    // Analyze function components
    for (const func of functions) {
      const name = func.getName();
      if (name && this.isComponentName(name)) {
        const stateUsages = this.findStateUsages(func.getBody()?.getText() || '', relativePath, name);
        if (stateUsages.length > 0 || this.hasJsxReturn(func.getText())) {
          components.push({
            name,
            file: relativePath,
            stateUsages,
            children: [],
          });
        }
      }
    }

    // Analyze arrow function components
    for (const varDecl of variableDeclarations) {
      const name = varDecl.getName();
      if (this.isComponentName(name)) {
        const initializer = varDecl.getInitializer();
        if (initializer && initializer.getKind() === SyntaxKind.ArrowFunction) {
          const text = initializer.getText();
          const stateUsages = this.findStateUsages(text, relativePath, name);
          if (stateUsages.length > 0 || this.hasJsxReturn(text)) {
            components.push({
              name,
              file: relativePath,
              stateUsages,
              children: [],
            });
          }
        }
      }
    }

    return components;
  }

  private findStateUsages(code: string, file: string, component: string): StateUsage[] {
    const usages: StateUsage[] = [];
    const lines = code.split('\n');

    const patterns = [
      { regex: /useState\s*[<(]/g, type: 'useState' as const },
      { regex: /useContext\s*\(/g, type: 'useContext' as const },
      { regex: /useReducer\s*\(/g, type: 'useReducer' as const },
      { regex: /use[A-Z]\w*Store\s*\(/g, type: 'zustand' as const },
      { regex: /useAtom\s*\(/g, type: 'jotai' as const },
      { regex: /useAtomValue\s*\(/g, type: 'jotai' as const },
      { regex: /useSetAtom\s*\(/g, type: 'jotai' as const },
      { regex: /useSelector\s*[<(]/g, type: 'redux' as const },
      { regex: /useDispatch\s*[<(]/g, type: 'redux' as const },
      { regex: /useStore\s*[<(]/g, type: 'redux' as const },
    ];

    lines.forEach((line, index) => {
      for (const pattern of patterns) {
        const matches = line.match(pattern.regex);
        if (matches) {
          matches.forEach(match => {
            usages.push({
              type: pattern.type,
              name: match.replace(/\s*[<(]/, ''),
              file,
              line: index + 1,
              component,
            });
          });
        }
      }
    });

    return usages;
  }

  private isComponentName(name: string): boolean {
    return /^[A-Z]/.test(name);
  }

  private hasJsxReturn(code: string): boolean {
    return /<[A-Z]|<[a-z]+[\s>]|<>/.test(code);
  }

  private countByType(usages: StateUsage[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const usage of usages) {
      counts[usage.type] = (counts[usage.type] || 0) + 1;
    }
    return counts;
  }

}
