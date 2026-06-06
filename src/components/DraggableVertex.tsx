import { useRef, useState } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '../store/geometryStore';
import type { Vertex } from '../store/types';

interface DraggableVertexProps {
  objectId: string;
  vertex: Vertex;
  color: string;
}

export default function DraggableVertex({ objectId, vertex, color }: DraggableVertexProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>(vertex.position);
  const updateVertex = useGeometryStore((s) => s.updateVertex);
  const selectObject = useGeometryStore((s) => s.selectObject);
  const selectedObjectId = useGeometryStore((s) => s.selectedObjectId);
  const { gl } = useThree();

  const isSelected = selectedObjectId === objectId;

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    selectObject(objectId);
    gl.domElement.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      updateVertex(objectId, vertex.id, position);
      gl.domElement.style.cursor = 'default';
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !meshRef.current) return;
    e.stopPropagation();

    const newPos: [number, number, number] = [
      Math.round(e.point.x * 100) / 100,
      Math.round(e.point.y * 100) / 100,
      Math.round(e.point.z * 100) / 100,
    ];
    setPosition(newPos);
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? '#ffffff' : color}
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>
      <Text
        position={[0.2, 0.2, 0]}
        color={color}
        fontSize={0.25}
        anchorX="left"
        anchorY="bottom"
      >
        {vertex.label}
      </Text>
    </group>
  );
}
