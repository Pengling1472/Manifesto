import { OrbitControls } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"

import { TwinkleVertex, TwinkleFragment } from "../shaders/Twinkle"
import { useRef } from "react"
import type { ShaderMaterial } from "three"

function Scene() {
    const materialRef = useRef<ShaderMaterial>( null )

    useFrame( ( { clock } ) => {
        const time = clock.getElapsedTime()

        if ( materialRef.current ) materialRef.current.uniforms.uTime.value = time
    } )

    return ( <>
        <mesh>
            <planeGeometry
                args={ [ 1, 1 ] }
            />
            <shaderMaterial
                ref={ materialRef }
                transparent
                vertexShader={ TwinkleVertex() }
                fragmentShader={ TwinkleFragment() }
                uniforms={ { uTime: { value: 0 } } }
            />
        </mesh>
    </> )
}

export default function DesignIsPlay() {
    return (
        <>
            <Canvas id="canvas">
                <OrbitControls/>
                <Scene/>
            </Canvas>
        </>
    )
}