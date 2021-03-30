export enum EngineType {
  HTML = 'html',
  JS = 'js',
  HYBRID = 'hybrid',
}
export type UseEngine = Exclude<EngineType, 'HYBRID'>;
