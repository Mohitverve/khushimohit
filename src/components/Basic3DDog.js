import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Basic3DDog = () => {
  return (
    <Canvas>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <group>
        {/* Head */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="brown" />
        </mesh>
        {/* Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 1, 32]} />
          <meshStandardMaterial color="brown" />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.6, 1.3, 0]}>
          <coneGeometry args={[0.2, 0.5, 32]} />
          <meshStandardMaterial color="brown" />
        </mesh>
        <mesh position={[0.6, 1.3, 0]}>
          <coneGeometry args={[0.2, 0.5, 32]} />
          <meshStandardMaterial color="brown" />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.5, -0.5, 0.5]}>
          <cylinderGeometry args={[0.2, 0.2, 0.5, 32]} />
          <meshStandardMaterial color="brown" />
        </mesh>
        <mesh position={[0.5, -0.5, 0.5]}>
          <cylinderGeometry args={[0.2, 0.2, 0.5, 32]} />
          <meshStandardMaterial color="brown" />
        </mesh>
      </group>
    </Canvas>
  );
};

export default Basic3DDog;
