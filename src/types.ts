export interface StateUsage {
  type: 'useState' | 'useContext' | 'useReducer' | 'zustand' | 'jotai';
  name: string;
  file: string;
  line: number;
  component: string;
}

export interface ComponentInfo {
  name: string;
  file: string;
  stateUsages: StateUsage[];
  children: string[];
}

export interface AnalysisResult {
  summary: {
    totalComponents: number;
    totalStateUsages: number;
    byType: Record<string, number>;
  };
  components: ComponentInfo[];
  suggestions: Suggestion[];
}

export interface Suggestion {
  type: 'warning' | 'info' | 'improvement';
  message: string;
  file: string;
  component: string;
}
