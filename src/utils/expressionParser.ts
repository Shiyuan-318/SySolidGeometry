import { evaluate, parse } from 'mathjs';
import { GeometryObject, GeometryType, Vertex, generateId, generateVertexId } from '../store/types';

interface ParsedExpression {
  type: 'explicit' | 'implicit' | 'parametric';
  fn?: (x: number, y: number) => number;
  implicitFn?: (x: number, y: number, z: number) => number;
  paramFns?: {
    x: (t: number) => number;
    y: (t: number) => number;
    z: (t: number) => number;
  };
  tRange?: [number, number];
  xRange: [number, number];
  yRange: [number, number];
  rawExpression: string;
}

function parseExplicitZ(expr: string): ((x: number, y: number) => number) | null {
  try {
    const node = parse(expr);
    const compiled = node.compile();
    return (x: number, y: number) => {
      try {
        return compiled.evaluate({ x, y, e: Math.E, pi: Math.PI }) as number;
      } catch {
        return NaN;
      }
    };
  } catch {
    return null;
  }
}

function parseImplicitF(expr: string): ((x: number, y: number, z: number) => number) | null {
  try {
    const node = parse(expr);
    const compiled = node.compile();
    return (x: number, y: number, z: number) => {
      try {
        return compiled.evaluate({ x, y, z, e: Math.E, pi: Math.PI }) as number;
      } catch {
        return NaN;
      }
    };
  } catch {
    return null;
  }
}

function parseParametricComponent(expr: string): ((t: number) => number) | null {
  try {
    const node = parse(expr);
    const compiled = node.compile();
    return (t: number) => {
      try {
        return compiled.evaluate({ t, e: Math.E, pi: Math.PI }) as number;
      } catch {
        return NaN;
      }
    };
  } catch {
    return null;
  }
}

export function parseExpression(input: string): ParsedExpression | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Parametric: x=f(t), y=g(t), z=h(t)
  const parametricMatch = trimmed.match(
    /x\s*=\s*(.+?)\s*,\s*y\s*=\s*(.+?)\s*,\s*z\s*=\s*(.+?)\s*(?:,\s*t\s*:\s*\[([-\d.]+)\s*,\s*([-\d.]+)\])?/
  );
  if (parametricMatch) {
    const xFn = parseParametricComponent(parametricMatch[1]);
    const yFn = parseParametricComponent(parametricMatch[2]);
    const zFn = parseParametricComponent(parametricMatch[3]);
    if (xFn && yFn && zFn) {
      const tMin = parametricMatch[4] ? parseFloat(parametricMatch[4]) : -5;
      const tMax = parametricMatch[5] ? parseFloat(parametricMatch[5]) : 5;
      return {
        type: 'parametric',
        paramFns: { x: xFn, y: yFn, z: zFn },
        tRange: [tMin, tMax],
        xRange: [-5, 5],
        yRange: [-5, 5],
        rawExpression: trimmed,
      };
    }
  }

  // Explicit: z = f(x, y)
  const explicitMatch = trimmed.match(/^z\s*=\s*(.+)$/i);
  if (explicitMatch) {
    const fn = parseExplicitZ(explicitMatch[1]);
    if (fn) {
      return {
        type: 'explicit',
        fn,
        xRange: [-5, 5],
        yRange: [-5, 5],
        rawExpression: trimmed,
      };
    }
  }

  // Implicit: F(x, y, z) = 0
  const implicitMatch = trimmed.match(/^(.+?)\s*=\s*0$/);
  if (implicitMatch) {
    const fn = parseImplicitF(implicitMatch[1]);
    if (fn) {
      return {
        type: 'implicit',
        implicitFn: fn,
        xRange: [-3, 3],
        yRange: [-3, 3],
        rawExpression: trimmed,
      };
    }
  }

  // Try as explicit z= expression without z= prefix
  const fn = parseExplicitZ(trimmed);
  if (fn) {
    return {
      type: 'explicit',
      fn,
      xRange: [-5, 5],
      yRange: [-5, 5],
      rawExpression: `z = ${trimmed}`,
    };
  }

  return null;
}

export function generateSurfaceVertices(
  parsed: ParsedExpression,
  resolution: number = 40
): { positions: Float32Array; indices: number[] } | null {
  if (parsed.type === 'explicit' && parsed.fn) {
    const { xRange, yRange, fn } = parsed;
    const xStep = (xRange[1] - xRange[0]) / resolution;
    const yStep = (yRange[1] - yRange[0]) / resolution;
    const positions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = xRange[0] + i * xStep;
        const y = yRange[0] + j * yStep;
        const z = fn(x, y);
        if (isFinite(z)) {
          positions.push(x, y, z);
        } else {
          positions.push(x, y, 0);
        }
      }
    }

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const a = i * (resolution + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (resolution + 1) + j;
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    return {
      positions: new Float32Array(positions),
      indices,
    };
  }
  return null;
}

export function generateCurvePoints(
  parsed: ParsedExpression,
  segments: number = 100
): [number, number, number][] | null {
  if (parsed.type === 'parametric' && parsed.paramFns && parsed.tRange) {
    const { paramFns, tRange } = parsed;
    const points: [number, number, number][] = [];
    const step = (tRange[1] - tRange[0]) / segments;

    for (let i = 0; i <= segments; i++) {
      const t = tRange[0] + i * step;
      const x = paramFns.x(t);
      const y = paramFns.y(t);
      const z = paramFns.z(t);
      if (isFinite(x) && isFinite(y) && isFinite(z)) {
        points.push([x, y, z]);
      }
    }
    return points;
  }
  return null;
}

export function expressionToGeometryObject(input: string): GeometryObject | null {
  const parsed = parseExpression(input);
  if (!parsed) return null;

  const id = generateId();
  const colors = ['#00d4ff', '#ff6b6b', '#00ff88', '#ffd93d', '#c084fc', '#fb923c', '#f472b6', '#34d399'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  if (parsed.type === 'parametric') {
    const points = generateCurvePoints(parsed);
    const vertices: Vertex[] = points
      ? points.slice(0, 10).map((p, i) => ({
          id: generateVertexId(),
          label: String.fromCharCode(65 + i),
          position: p,
        }))
      : [];

    return {
      id,
      type: 'curve',
      name: `曲线 ${id.slice(-3)}`,
      expression: parsed.rawExpression,
      color,
      lineStyle: 'solid',
      visible: true,
      vertices,
    };
  }

  if (parsed.type === 'explicit') {
    return {
      id,
      type: 'surface',
      name: `曲面 ${id.slice(-3)}`,
      expression: parsed.rawExpression,
      color,
      lineStyle: 'solid',
      visible: true,
      vertices: [],
    };
  }

  if (parsed.type === 'implicit') {
    return {
      id,
      type: 'surface',
      name: `隐式曲面 ${id.slice(-3)}`,
      expression: parsed.rawExpression,
      color,
      lineStyle: 'solid',
      visible: true,
      vertices: [],
    };
  }

  return null;
}

export function calculateArea(vertices: [number, number, number][]): number {
  if (vertices.length < 3) return 0;

  // Triangulate using fan method and sum triangle areas
  let totalArea = 0;
  for (let i = 1; i < vertices.length - 1; i++) {
    const v0 = vertices[0];
    const v1 = vertices[i];
    const v2 = vertices[i + 1];

    const a = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
    const b = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];

    const cross = [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];

    totalArea += 0.5 * Math.sqrt(cross[0] ** 2 + cross[1] ** 2 + cross[2] ** 2);
  }

  return totalArea;
}

export function calculateSurfaceArea(
  fn: (x: number, y: number) => number,
  xRange: [number, number],
  yRange: [number, number],
  resolution: number = 50
): number {
  const xStep = (xRange[1] - xRange[0]) / resolution;
  const yStep = (yRange[1] - yRange[0]) / resolution;
  let totalArea = 0;

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const x0 = xRange[0] + i * xStep;
      const y0 = yRange[0] + j * yStep;
      const x1 = x0 + xStep;
      const y1 = y0 + yStep;

      const z00 = fn(x0, y0);
      const z10 = fn(x1, y0);
      const z01 = fn(x0, y1);
      const z11 = fn(x1, y1);

      if (isFinite(z00) && isFinite(z10) && isFinite(z01) && isFinite(z11)) {
        const area = calculateArea([
          [x0, y0, z00],
          [x1, y0, z10],
          [x0, y1, z01],
        ]) + calculateArea([
          [x1, y0, z10],
          [x1, y1, z11],
          [x0, y1, z01],
        ]);
        totalArea += area;
      }
    }
  }

  return totalArea;
}
