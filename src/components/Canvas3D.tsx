import { useRef, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '../store/geometryStore';
import { parseExpression, generateSurfaceVertices, generateCurvePoints } from '../utils/expressionParser';
import DraggableVertex from './DraggableVertex';

function AxisLabels() {
  return (
    <>
      <Text position={[5.5, 0, 0]} color="#ff4444" fontSize={0.3}>X</Text>
      <Text position={[0, 5.5, 0]} color="#44ff44" fontSize={0.3}>Y</Text>
      <Text position={[0, 0, 5.5]} color="#4444ff" fontSize={0.3}>Z</Text>
    </>
  );
}

function AxisLines() {
  return (
    <>
      <Line points={[[-5, 0, 0], [5, 0, 0]]} color="#ff4444" lineWidth={2} />
      <Line points={[[0, -5, 0], [0, 5, 0]]} color="#44ff44" lineWidth={2} />
      <Line points={[[0, 0, -5], [0, 0, 5]]} color="#4444ff" lineWidth={2} />
    </>
  );
}

function SurfaceMesh({ expression, color, lineStyle }: { expression: string; color: string; lineStyle: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.LineSegments>(null);

  const parsed = parseExpression(expression);
  if (!parsed || (parsed.type !== 'explicit' && parsed.type !== 'implicit')) return null;

  const result = generateSurfaceVertices(parsed, 40);
  if (!result) return null;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(result.positions, 3));
  geometry.setIndex(result.indices);
  geometry.computeVertexNormals();

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          wireframe={lineStyle === 'dashed'}
        />
      </mesh>
      {lineStyle === 'dashed' && (
        <lineSegments geometry={geometry}>
          <lineBasicMaterial color={color} transparent opacity={0.3} />
        </lineSegments>
      )}
    </group>
  );
}

function CurveMesh({ expression, color, lineStyle }: { expression: string; color: string; lineStyle: string }) {
  const parsed = parseExpression(expression);
  if (!parsed || parsed.type !== 'parametric') return null;

  const points = generateCurvePoints(parsed, 100);
  if (!points || points.length < 2) return null;

  const curvePoints = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));

  if (lineStyle === 'dashed') {
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.02, 8, false);
    return (
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
    );
  }

  return (
    <Line
      points={curvePoints}
      color={color}
      lineWidth={3}
    />
  );
}

function SceneObjects() {
  const objects = useGeometryStore((s) => s.objects);

  return (
    <>
      {objects.map((obj) => {
        if (!obj.visible) return null;

        if (obj.type === 'surface') {
          return (
            <SurfaceMesh
              key={obj.id}
              expression={obj.expression}
              color={obj.color}
              lineStyle={obj.lineStyle}
            />
          );
        }

        if (obj.type === 'curve') {
          return (
            <CurveMesh
              key={obj.id}
              expression={obj.expression}
              color={obj.color}
              lineStyle={obj.lineStyle}
            />
          );
        }

        if (obj.type === 'line') {
          if (obj.vertices.length >= 2) {
            const points = obj.vertices.map(v => new THREE.Vector3(...v.position));
            return (
              <group key={obj.id}>
                <Line
                  points={points}
                  color={obj.color}
                  lineWidth={3}
                  dashed={obj.lineStyle === 'dashed'}
                  dashSize={0.2}
                  gapSize={0.1}
                />
                {obj.vertices.map((v) => (
                  <DraggableVertex
                    key={v.id}
                    objectId={obj.id}
                    vertex={v}
                    color={obj.color}
                  />
                ))}
              </group>
            );
          }
        }

        if (obj.type === 'point') {
          return (
            <group key={obj.id}>
              {obj.vertices.map((v) => (
                <DraggableVertex
                  key={v.id}
                  objectId={obj.id}
                  vertex={v}
                  color={obj.color}
                />
              ))}
            </group>
          );
        }

        return null;
      })}
    </>
  );
}

function CameraController() {
  const { camera } = useThree();
  const setCameraState = useGeometryStore((s) => s.setCameraState);

  useFrame(() => {
    const pos = camera.position;
    setCameraState({
      position: [pos.x, pos.y, pos.z],
      zoom: (camera as THREE.PerspectiveCamera).zoom,
    });
  });

  return null;
}

function KeyboardHandler() {
  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const perspCam = camera as THREE.PerspectiveCamera;
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          perspCam.zoom = Math.min(perspCam.zoom * 1.1, 10);
          perspCam.updateProjectionMatrix();
        } else if (e.key === '-') {
          e.preventDefault();
          perspCam.zoom = Math.max(perspCam.zoom / 1.1, 0.1);
          perspCam.updateProjectionMatrix();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera]);

  return null;
}

function PlaneClickHandler() {
  const toolMode = useGeometryStore((s) => s.toolMode);
  const addObject = useGeometryStore((s) => s.addObject);
  const setCursorPosition = useGeometryStore((s) => s.setCursorPosition);

  const handlePointerDown = useCallback(
    (e: THREE.Event) => {
      const event = e as unknown as { point: THREE.Vector3 };
      if (!event.point) return;

      const pos: [number, number, number] = [
        Math.round(event.point.x * 100) / 100,
        Math.round(event.point.y * 100) / 100,
        Math.round(event.point.z * 100) / 100,
      ];

      setCursorPosition(pos);

      if (toolMode === 'point') {
        const id = `obj_${Date.now()}`;
        const label = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        addObject({
          id,
          type: 'point',
          name: `点 ${label}`,
          expression: `(${pos[0]}, ${pos[1]}, ${pos[2]})`,
          color: '#00d4ff',
          lineStyle: 'solid',
          visible: true,
          vertices: [
            {
              id: `vtx_${Date.now()}`,
              label,
              position: pos,
            },
          ],
        });
      }
    },
    [toolMode, addObject, setCursorPosition]
  );

  if (toolMode !== 'point' && toolMode !== 'select') return null;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      visible={false}
    >
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

export default function Canvas3D() {
  const showGrid = useGeometryStore((s) => s.showGrid);
  const showAxes = useGeometryStore((s) => s.showAxes);

  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 45, near: 0.1, far: 1000 }}
      style={{ background: '#0d1117' }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />

      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.8}
        zoomSpeed={1.2}
        minDistance={1}
        maxDistance={50}
      />

      {showGrid && (
        <Grid
          args={[10, 10]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#334155"
          fadeDistance={30}
          infiniteGrid
        />
      )}

      {showAxes && (
        <>
          <AxisLines />
          <AxisLabels />
        </>
      )}

      <SceneObjects />
      <PlaneClickHandler />
      <CameraController />
      <KeyboardHandler />
    </Canvas>
  );
}
