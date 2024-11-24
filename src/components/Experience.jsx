import { OrbitControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { STLLoader } from "three-stdlib";
import { Suspense } from "react";

const Experience = () => {
    const tibiaGeometry = useLoader(STLLoader, "/models/Right_Tibia.stl");
    const femurGeometry = useLoader(STLLoader, "/models/Right_Femur.stl");

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrbitControls />
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[-5, 5, 5]}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />
            
            {/* Plane for Shadows */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -75, 0]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="gray" />
            </mesh>

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
                geometry={femurGeometry}
                scale={0.1}
                rotation={[-0.5 * Math.PI, 0, 0]}
                position={[10, -70, 0]}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial color="lightgreen" />
            </mesh>
        </Suspense>
    );
};

export default Experience;
