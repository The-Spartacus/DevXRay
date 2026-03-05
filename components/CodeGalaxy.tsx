'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface CodeGalaxyProps {
  tree: any[];
}

function GalaxyNode({ position, color, size, label }: { position: [number, number, number], color: string, size: number, label: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <Text
        position={[0, size + 0.2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="var(--font-mono)"
      >
        {label}
      </Text>
    </group>
  );
}

function Connections({ nodes }: { nodes: any[] }) {
  const lines = useMemo(() => {
    const result = [];
    // Connect some nodes to simulate dependencies deterministically
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Use a deterministic condition instead of Math.random()
        if ((i * j + i + j) % 17 === 0) {
          result.push([nodes[i].pos, nodes[j].pos]);
        }
      }
    }
    return result;
  }, [nodes]);

  return (
    <group>
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry attach="geometry">
            <float32BufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line[0], ...line[1]])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#10b981" opacity={0.2} transparent />
        </line>
      ))}
    </group>
  );
}

export default function CodeGalaxy({ tree }: CodeGalaxyProps) {
  const nodes = useMemo(() => {
    if (!tree) return [];
    
    // Limit nodes for performance
    const filtered = tree.filter(f => f.type === 'tree').slice(0, 30);
    
    return filtered.map((item, i) => {
      const angle = (i / filtered.length) * Math.PI * 2;
      // Deterministic radius and height
      const radius = 5 + (i % 5);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (i % 7) - 3;
      
      return {
        pos: [x, y, z] as [number, number, number],
        label: item.path.split('/').pop() || '',
        color: item.type === 'tree' ? '#10b981' : '#3b82f6',
        size: item.type === 'tree' ? 0.3 : 0.15
      };
    });
  }, [tree]);

  return (
    <div className="w-full h-full bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 10, 20]} />
        <OrbitControls enableDamping dampingFactor={0.05} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <group>
          {nodes.map((node, i) => (
            <GalaxyNode 
              key={i} 
              position={node.pos} 
              color={node.color} 
              size={node.size} 
              label={node.label} 
            />
          ))}
          <Connections nodes={nodes} />
        </group>

        {/* Center Sun */}
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={5} />
        </mesh>
      </Canvas>
      
      <div className="absolute top-4 left-4 p-4 bg-zinc-950/50 backdrop-blur-md border border-zinc-800 rounded-2xl pointer-events-none">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Code Galaxy</h3>
        <p className="text-[10px] text-zinc-500 mt-1">3D visualization of repository modules</p>
      </div>
    </div>
  );
}
