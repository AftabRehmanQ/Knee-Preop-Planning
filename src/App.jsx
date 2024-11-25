import React, { useState, useRef } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';
import { Vector3, BufferGeometry, LineBasicMaterial, Line, PlaneGeometry, MeshBasicMaterial, Mesh, DoubleSide } from 'three';
import { Raycaster, Vector2 } from 'three';
import { Stack } from '@mantine/core';

function LandmarkPlacer({ activeLandmark, setLandmarkPositions }) {
  const { camera, scene } = useThree();

  const handleSurfaceClick = (event) => {
    if (activeLandmark) {
      const raycaster = new Raycaster();
      const mouse = new Vector2();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        const newLandmark = { name: activeLandmark, position: point };
        setLandmarkPositions((prev) => [...prev, newLandmark]);
      }
    }
  };

  return (
    <mesh onClick={handleSurfaceClick}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function App() {
  const [activeLandmark, setActiveLandmark] = useState(null);
  const [landmarkPositions, setLandmarkPositions] = useState([]);
  const [activeControl, setActiveControl] = useState(false);
  const [activeLandmarkMesh, setActiveLandmarkMesh] = useState(null);
  const [orbitControlEnabled, setOrbitControlEnabled] = useState(true);
  const [lines, setLines] = useState([]);
  const femurRef = useRef();
  const transformRef = useRef();
  const landmarkRefs = useRef([]);

  const tibiaGeometry = useLoader(STLLoader, "/models/Right_Tibia.stl");
  const femurGeometry = useLoader(STLLoader, '/models/Right_Femur.stl');

  const handleClick = (landmarkName) => {
    setActiveLandmark((prev) => (prev === landmarkName ? null : landmarkName));
    setActiveControl(false);
  };

  const handleLandmarkClick = (e, index) => {
    e.stopPropagation();
    const landmark = landmarkRefs.current[index];
    setActiveLandmarkMesh(landmark);
    setActiveControl(true);
    setOrbitControlEnabled(false);
  };

  const handleTranslate = (index, position) => {
    setLandmarkPositions((prev) =>
      prev.map((landmark, i) =>
        i === index ? { ...landmark, position } : landmark
      )
    );
  };

  const handleTransformEnd = () => {
    setOrbitControlEnabled(true);
    setActiveControl(false);
  };

  const createLine = (start, end) => {
    if (!start || !end) {
      console.error('Invalid points for line creation:', { start, end });
      return null;
    }

    const geometry = new BufferGeometry().setFromPoints([start, end]);
    const material = new LineBasicMaterial({ color: 0x00ff00 });
    return new Line(geometry, material);
  };

  const handleUpdate = () => {
    if (landmarkPositions.length < 2) {
      alert('Please create at least 2 landmarks to create lines!');
      return;
    }

    const axes = [
      { start: 0, end: 1, name: 'Mechanical Axis' },
      { start: 2, end: 3, name: 'Anatomical Axis' },
      { start: 4, end: 5, name: 'TEA-Trans Epicondyle Axis' },
      { start: 8, end: 9, name: 'PCA-Posterior Condyle Axis' },
    ];

    const newLines = [];

    axes.forEach((axis) => {
      const start = landmarkPositions[axis.start]?.position;
      const end = landmarkPositions[axis.end]?.position;

      if (start && end) {
        const line = createLine(start, end);
        if (line) {
          newLines.push(line);
          console.log(`${axis.name} created.`);
        }
      } else {
        console.log(`Skipping ${axis.name}: Not enough landmarks.`);
      }
    });

    if (newLines.length > 0) {
      setLines(newLines);
      alert(`${newLines.length} lines created successfully!`);
    } else {
      alert('No lines could be created. Please add more landmarks.');
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <Canvas camera={{ position: [10, 0, 100] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[-5, 5, 5]} />

        {/* Tibia Model */}
        <mesh
                geometry={tibiaGeometry}
                scale={0.1}
                rotation={[-0.5 * Math.PI, 0, 0]}
                position={[10, -70, 0]}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial color="lightpink" />
            </mesh>

        {/* Femur Model */}
        <mesh
          ref={femurRef}
          geometry={femurGeometry}
          scale={0.1}
          rotation={[-0.5 * Math.PI, 0, 0]}
          position={[10, -70, 0]}
        >
          <meshStandardMaterial color="lightgreen" />
        </mesh>

        {/* Render Landmarks */}
        {landmarkPositions.map((landmark, index) => (
          <mesh
            key={index}
            position={landmark.position}
            ref={(el) => (landmarkRefs.current[index] = el)}
            onClick={(e) => handleLandmarkClick(e, index)}
          >
            <sphereGeometry args={[0.5]} />
            <meshStandardMaterial color="blue" />
          </mesh>
        ))}

        {/* Landmark Placer */}
        <LandmarkPlacer
          activeLandmark={activeLandmark}
          setLandmarkPositions={setLandmarkPositions}
        />

        {/* Attach TransformControls conditionally */}
        {activeLandmarkMesh && activeControl && (
          <TransformControls
            ref={transformRef}
            object={activeLandmarkMesh}
            mode="translate"
            onChange={(e) =>
              handleTranslate(
                landmarkPositions.findIndex(
                  (landmark) => landmark.position === e.target.position
                ),
                e.target.position
              )
            }
            onMouseUp={handleTransformEnd}
          />
        )}

        {/* Render the created lines */}
        {lines.map((line, index) => (
          <primitive key={index} object={line} />
        ))}

        <OrbitControls enabled={orbitControlEnabled} />
      </Canvas>

      {/* Buttons */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
        {[
          'Femur Center',
          'Hip Center',
          'Femur Proximal Canal',
          'Femur Distal Canal',
          'Medial Epicondyle',
          'Lateral Epicondyle',
          'Distal Medial Pt',
          'Distal Lateral Pt',
          'Posterior Medial Pt',
          'Posterior Lateral Pt',
        ].map((landmarkName) => (
          <Stack>
          <button
            key={landmarkName}
            onClick={() => handleClick(landmarkName)}
            style={{
              marginBottom: '10px',
              padding: '10px 20px',
              backgroundColor: activeLandmark === landmarkName ? 'black' : 'lightgray',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {landmarkName}
          </button>
          </Stack>
        ))}
        <button
          onClick={handleUpdate}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default App;
