type MountingPoint = {
  namespace: string;
  path: string;
};

export interface EngineSettings {
  cache: boolean;
  mountPoint: MountingPoint[];
}

export interface EngineModuleSetting {
  defaultPath: string;
  mountingPoints: MountingPoint[];
}
