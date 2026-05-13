import { OrbitControls, useFBO, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";

import { GuassianBlurVertex, GuassianBlurFragment } from "../shaders/GuassianBlur";

import background from "../assets/images/background.png"
import { ShaderMaterial, SRGBColorSpace, RepeatWrapping } from "three";

import { ShootingStar } from "./DesignIsPlay";
import { Cursor } from "./Home";

interface letterDataStructure {
    texturePath: string
    position: { x: number, y: number, z: number }
}

interface letterProps {
    texturePath: string
    position: { x: number, y: number, z: number }
}

function Letter( { texturePath, position }: letterProps ) {
    const texture = useTexture( texturePath )

    return ( <mesh
        position={ [ position.x, position.y, position.z ] }
        scale={ [ 4, 4, 4 ] }
    >
        <planeGeometry/>
        <meshBasicMaterial
            map={ texture }
            transparent
        />
    </mesh> )
}

function Scene() {
    const { viewport, scene, camera } = useThree()
    const renderTarget = useFBO()
    const guassianMaterial = useRef<ShaderMaterial>( null )

    const backgroundTexture = useTexture( background )
    const [ letters, setLetters ] = useState<letterDataStructure[]>(
        new Array( 33 ).fill( null ).map( ( _, index ) => ( {
            texturePath: new URL( `../assets/community/slice${ index + 1 }.png`, import.meta.url ).href, 
            position: { x: 6 * Math.cos( 2 * Math.PI * index / 33 ), y: 1.5 * Math.sin( 3.1 + 4 * Math.PI * index / 33 * 2 ), z: 6 * Math.sin( 2 * Math.PI * index / 33 ) },
            rotation: 0
        } ) )
    ) 

    useFrame( ( { clock, gl } ) => {
        const time = clock.getElapsedTime() * 0.25

        scene.children[ 34 ].visible = false
        scene.children[ 36 ].visible = false

        gl.setRenderTarget( renderTarget )
        gl.render( scene, camera )

        if ( guassianMaterial.current ) {
            const texture = renderTarget.texture

            texture.wrapS = RepeatWrapping
            texture.wrapT = RepeatWrapping
            guassianMaterial.current.uniforms.uTexture.value = texture
        }

        gl.setRenderTarget( null )

        scene.children[ 34 ].visible = true
        scene.children[ 36 ].visible = true

        setLetters( current => {
            const newLetters = [ ...current ]

            for ( let i = 0; i < newLetters.length; i++ ) {
                newLetters[ i ].position.x = 6 * Math.cos( 2 * Math.PI * i / 33 - time )
                newLetters[ i ].position.y = 1.5 * Math.sin( 3.1 + 4 * Math.PI * i / 33 - time * 2 )
                newLetters[ i ].position.z = 6 * Math.sin( 2 * Math.PI * i / 33 - time )
            }

            return newLetters
        } )
    } )

    return ( <>
        <OrbitControls/>
        { letters.map( ( letter, index ) => (
            <Letter
                key={ index }
                texturePath={ letter.texturePath }
                position={ letter.position }
            />
        ) ) }
        <mesh position={ [ 0, 0, -10 ] }>
            <planeGeometry args={ [ viewport.width, viewport.height ] }/>
            <meshBasicMaterial
                map={ backgroundTexture }
                toneMapped={ false }
                onUpdate={ () => {
                    backgroundTexture.colorSpace = SRGBColorSpace
                    backgroundTexture.needsUpdate = true
                } }
            />
        </mesh>
        <mesh position={ [ 0, 0, 10 ] }>
            <planeGeometry args={ [ viewport.width, viewport.height ] }/>
            <shaderMaterial
                ref={ guassianMaterial }
                toneMapped={ true }
                vertexShader={ GuassianBlurVertex() }
                fragmentShader={ GuassianBlurFragment() }
                uniforms={ { uTexture: { value: null }, uvStride: { value: [ 1 / viewport.width, 1 / viewport.height ] } } }
            />
        </mesh>
        <group
            position={ [ 0, 0, -9 ] }
        >
            <ShootingStar
                startingPosition={ { x: 2 + viewport.width / 2 + 3, y: viewport.height / 2 + 3 } }
                startTime={ 0.2 }
            />
            <ShootingStar
                startingPosition={ { x: 6 + viewport.width / 2 + 3, y: viewport.height / 2 + 3 } }
                startTime={ 0.6 }
            />
            <ShootingStar
                startingPosition={ { x: 8 + viewport.width / 2 + 3, y: viewport.height / 2 + 3 } }
                startTime={ 0.3 }
            />
            <ShootingStar
                startingPosition={ { x: viewport.width / 2 + 3, y: viewport.height / 2 + 3 } }
                startTime={ 0.9 }
            />
            <ShootingStar
                startingPosition={ { x: 10 - viewport.width / 2 + 3, y: viewport.height / 2 + 3 } }
                startTime={ 0 }
            />
            <ShootingStar
                startingPosition={ { x: 15 - viewport.width / 2 + 3, y: viewport.height / 2 + 3 } }
                startTime={ 0.5 }
            />
            <ShootingStar
                startingPosition={ { x: 3 - viewport.width / 2 + 3, y: viewport.height / 2 + 3 } }
                startTime={ 0.4 }
            />
            <ShootingStar
                startingPosition={ { x: 8 - viewport.width / 2 + 3, y: viewport.height / 2 + 3 } }
                startTime={ 0.7 }
            />
        </group>
        <Cursor scale={ 1 }/>
    </> )
}

export default function DesignIsCommunity() {
    return ( <Canvas
        id="canvas"
        orthographic
        camera={ {
            zoom: 100,
            near: -20,
            position: [ 0, 0, 10 ]
        } }
    >
        <Scene/>
    </Canvas> )
}