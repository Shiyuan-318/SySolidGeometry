export type ToolMode = 'select' | 'point' | 'line' | 'surface' | 'curve' | 'measure';
export type LineStyle = 'solid' | 'dashed';
export type GeometryType = 'point' | 'line' | 'surface' | 'curve';

export interface Vertex {
  id: string;
  label: string;
  position: [number, number, number];
}

export interface GeometryObject {
  id: string;
  type: GeometryType;
  name: string;
  expression: string;
  color: string;
  lineStyle: LineStyle;
  visible: boolean;
  vertices: Vertex[];
  area?: number;
}

export interface CameraState {
  position: [number, number, number];
  zoom: number;
}

export interface ExpressionInput {
  id: string;
  text: string;
  error: string | null;
}

export interface GeometryStore {
  objects: GeometryObject[];
  selectedObjectId: string | null;
  cameraState: CameraState;
  toolMode: ToolMode;
  expressions: ExpressionInput[];
  showGrid: boolean;
  showAxes: boolean;
  cursorPosition: [number, number, number];

  addObject: (obj: GeometryObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<GeometryObject>) => void;
  updateVertex: (objectId: string, vertexId: string, position: [number, number, number]) => void;
  updateVertexLabel: (objectId: string, vertexId: string, label: string) => void;
  selectObject: (id: string | null) => void;
  setCameraState: (state: Partial<CameraState>) => void;
  setToolMode: (mode: ToolMode) => void;
  addExpression: () => void;
  updateExpression: (id: string, text: string) => void;
  removeExpression: (id: string) => void;
  setExpressionError: (id: string, error: string | null) => void;
  toggleGrid: () => void;
  toggleAxes: () => void;
  setCursorPosition: (pos: [number, number, number]) => void;
}

let idCounter = 0;
export function generateId(): string {
  return `obj_${Date.now()}_${++idCounter}`;
}

let vertexCounter = 0;
export function generateVertexId(): string {
  return `vtx_${Date.now()}_${++vertexCounter}`;
}

let exprCounter = 0;
export function generateExprId(): string {
  return `expr_${++exprCounter}`;
}
