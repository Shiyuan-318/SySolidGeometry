import { create } from 'zustand';
import {
  GeometryStore,
  GeometryObject,
  CameraState,
  generateId,
  generateExprId,
} from './types';

const defaultCameraState: CameraState = {
  position: [5, 5, 5],
  zoom: 1,
};

export const useGeometryStore = create<GeometryStore>((set) => ({
  objects: [],
  selectedObjectId: null,
  cameraState: defaultCameraState,
  toolMode: 'select',
  expressions: [{ id: generateExprId(), text: '', error: null }],
  showGrid: true,
  showAxes: true,
  cursorPosition: [0, 0, 0],

  addObject: (obj: GeometryObject) =>
    set((state) => ({ objects: [...state.objects, obj] })),

  removeObject: (id: string) =>
    set((state) => ({
      objects: state.objects.filter((o) => o.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
    })),

  updateObject: (id: string, updates: Partial<GeometryObject>) =>
    set((state) => ({
      objects: state.objects.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
    })),

  updateVertex: (objectId: string, vertexId: string, position: [number, number, number]) =>
    set((state) => ({
      objects: state.objects.map((o) =>
        o.id === objectId
          ? {
              ...o,
              vertices: o.vertices.map((v) =>
                v.id === vertexId ? { ...v, position } : v
              ),
            }
          : o
      ),
    })),

  updateVertexLabel: (objectId: string, vertexId: string, label: string) =>
    set((state) => ({
      objects: state.objects.map((o) =>
        o.id === objectId
          ? {
              ...o,
              vertices: o.vertices.map((v) =>
                v.id === vertexId ? { ...v, label } : v
              ),
            }
          : o
      ),
    })),

  selectObject: (id: string | null) => set({ selectedObjectId: id }),

  setCameraState: (state: Partial<CameraState>) =>
    set((prev) => ({
      cameraState: { ...prev.cameraState, ...state },
    })),

  setToolMode: (mode) => set({ toolMode: mode }),

  addExpression: () =>
    set((state) => ({
      expressions: [...state.expressions, { id: generateExprId(), text: '', error: null }],
    })),

  updateExpression: (id: string, text: string) =>
    set((state) => ({
      expressions: state.expressions.map((e) =>
        e.id === id ? { ...e, text } : e
      ),
    })),

  removeExpression: (id: string) =>
    set((state) => ({
      expressions: state.expressions.length > 1
        ? state.expressions.filter((e) => e.id !== id)
        : state.expressions,
    })),

  setExpressionError: (id: string, error: string | null) =>
    set((state) => ({
      expressions: state.expressions.map((e) =>
        e.id === id ? { ...e, error } : e
      ),
    })),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleAxes: () => set((state) => ({ showAxes: !state.showAxes })),
  setCursorPosition: (pos: [number, number, number]) => set({ cursorPosition: pos }),
}));
