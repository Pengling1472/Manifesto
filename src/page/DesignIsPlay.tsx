import { OrbitControls, useTexture } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"

import { TwinkleVertex, TwinkleFragment } from "../shaders/Twinkle"
import { Suspense, useEffect, useRef, useState } from "react"
import type { Mesh, ShaderMaterial } from "three"

import background from "../assets/images/background.png"
import shootingStar from "../assets/images/shooting-star.png"

enum starColors {
    Green,
    Blue,
    Red,
    Yellow,
    Purple
}

const starsData: {
    scale: number
    color: starColors
    position: { x: number, y: number }
}[] = [
    { scale: 3.6, color: starColors.Green  , position: { x: 9.37,  y: -0.67 } },
    { scale: 2.8, color: starColors.Yellow , position: { x: -3.35, y: 4.44  } },
    { scale: 1.8, color: starColors.Purple , position: { x: 0.35,  y: -2.17 } },
    { scale: 2.7, color: starColors.Blue   , position: { x: -5.38, y: 0.48  } },
    { scale: 3,   color: starColors.Red    , position: { x: 0.36,  y: 2.75  } },
    { scale: 2.7, color: starColors.Purple , position: { x: 2.72,  y: -2.92 } },
    { scale: 3.1, color: starColors.Blue   , position: { x: 3.94,  y: -0.34 } },
    { scale: 5.1, color: starColors.Red    , position: { x: 7.00,  y: -4.59 } },
    { scale: 4.4, color: starColors.Yellow , position: { x: -3.01, y: 0.93  } },
    { scale: 2.1, color: starColors.Yellow , position: { x: 3.29,  y: 1.09  } },
    { scale: 2.5, color: starColors.Red    , position: { x: 1.97,  y: -1.56 } },
    { scale: 3.6, color: starColors.Yellow , position: { x: 4.51,  y: 3.53  } },
    { scale: 2.7, color: starColors.Purple , position: { x: -8.58, y: 3.57  } },
    { scale: 5.3, color: starColors.Purple , position: { x: 8.51,  y: 2.91  } },
    { scale: 4,   color: starColors.Red    , position: { x: -7.12, y: -1.55 } },
    { scale: 4.7, color: starColors.Yellow , position: { x: -8.42, y: -3.56 } },
    { scale: 2.2, color: starColors.Green  , position: { x: -9.09, y: 4.94  } },
    { scale: 3.1, color: starColors.Blue   , position: { x: 1.61,  y: 4.51  } },
    { scale: 2.3, color: starColors.Red    , position: { x: -6.95, y: 1.83  } },
    { scale: 3.7, color: starColors.Blue   , position: { x: -4.05, y: -2.55 } },
    { scale: 3.7, color: starColors.Green  , position: { x: -8.35, y: 0.26  } },
    { scale: 1.9, color: starColors.Green  , position: { x: -5.23, y: 4.50  } },
    { scale: 3,   color: starColors.Red    , position: { x: 7.55,  y: 0.07  } },
    { scale: 2.2, color: starColors.Blue   , position: { x: 6.32,  y: 4.7   } },
    { scale: 2.4, color: starColors.Yellow , position: { x: -7.21, y: 5.03  } },
    { scale: 3.2, color: starColors.Green  , position: { x: -2.33, y: 3.81  } }
]

interface sparkleProps {
    index: number
    position: { x: number, y: number }
    texturePath: string
    scale: number
    color: starColors
    onAction: ( id: number, node: Mesh ) => void 
}

interface sparkleDataStructure {
    texturePath: string
    position: { x: number, y: number }
    scale: number
    color: starColors
}

interface shootingStarProps {
    startingPosition: { x: number, y: number }
    startTime: number
}

export function ShootingStar( { startingPosition, startTime }: shootingStarProps ) {
    const texture = useTexture( shootingStar )
    const meshRef = useRef<Mesh>( null )
    const time = useRef<number>( startTime )
    const speed = useRef<number>( 0.3 )
    const targetPosition = useRef<{ x: number, y: number }>( { x: 20, y: 20 } )

    useFrame( ( _, delta ) => {
        time.current = Math.min( time.current + delta * speed.current, 1 )
        
        if ( meshRef.current ) {
            if ( time.current == 1 ) {
                meshRef.current.position.set( startingPosition.x, startingPosition.y, 0 )
                time.current = 0
            }

            const dx = targetPosition.current.x * ( 1 - time.current ) - startingPosition.x
            const dy = targetPosition.current.y * ( 1 - time.current ) - startingPosition.y

            meshRef.current.position.set( dx, dy, 0 )
        }
    } )

    return ( <mesh
        ref={ meshRef }
        renderOrder={ -2 }
        position={ [ startingPosition.x, startingPosition.y, 0 ] }
    >
        <planeGeometry
            args={ [ 3, 3 ] }
        />
        <meshBasicMaterial
            map={ texture }
            toneMapped={ false }
            opacity={ 1 - time.current }
            transparent
        />
    </mesh> )
}

function Sparkle( { index, position, texturePath, scale, color, onAction }: sparkleProps ) {
    const randomTimeRef = useRef<number>( Math.floor( Math.random() * 100 ) )
    const meshRef = useRef<Mesh>( null )
    const materialRef = useRef<ShaderMaterial>( null )
    const texture = useTexture( texturePath )
    const twinkleColor = [
        [ 0.25, 0.58, 0.54 ],
        [ 0.47, 0.37, 1 ],
        [ 0.95, 0.14, 0.38 ],
        [ 0.96, 0.77, 0.25 ],
        [ 0.51, 0.09, 0.66 ]
    ][ color ]

    useFrame( ( { clock } ) => {
        const time = clock.getElapsedTime() + randomTimeRef.current

        if ( materialRef.current ) materialRef.current.uniforms.uTime.value = time
    } )

    return ( <group
        ref={ meshRef }
        position={ [ position.x, position.y, 0 ] }
        onPointerDown={ () => {
            if ( meshRef.current ) onAction( index, meshRef.current )
        } }
    >
        <mesh
            scale={ 2.5 }
        >
            <planeGeometry/>
            <meshBasicMaterial
                map={ texture }
                transparent
            />
        </mesh>
        <mesh
            renderOrder={ -1 }
        >
            <planeGeometry
                args={ [ scale, scale ] }
            />
            <shaderMaterial
                ref={ materialRef }
                transparent
                vertexShader={ TwinkleVertex() }
                fragmentShader={ TwinkleFragment() }
                uniforms={ { uTime: { value: 0 }, uColor: { value: twinkleColor } } }
            />
        </mesh>
    </group> )
}

function Scene() {
    const { viewport } = useThree()

    const meshRef = useRef<Mesh>( null )
    const indexRef = useRef<number>( null )
    const playTexture = useTexture( background )
    const lightScale = useRef<number[]>( new Array( 26 ).fill( 0 ) )
    const [ stars, setStars ] = useState<sparkleDataStructure[]>( () =>
        new Array( 26 ).fill( null ).map( ( _, index ) => ( {
            texturePath: `/src/assets/play/${ index + 1 }.svg`,
            ...starsData[ index ]
        } ) )
    )

    const onPointerDown = ( index: number, node: Mesh ) => {
        if ( !meshRef.current && false ) {
            meshRef.current = node
            indexRef.current = index
        }
    }

    const onPointerUp = () => {
        if ( meshRef.current && indexRef.current != null ) {
            const index = indexRef.current

            lightScale.current[ index ] += 0.1 

            setStars( current => {
                const newStars = [ ...current ]
                
                newStars[ index ].scale = lightScale.current[ index ]

                return newStars
            } )

            console.log( lightScale.current )

            meshRef.current = null
        }
    }

    // useFrame( ( { mouse } ) => {
    //     if ( meshRef.current ) {
    //         const targetX = ( mouse.x * viewport.width ) / 2
	// 		const targetY = ( mouse.y * viewport.height ) / 2

    //         meshRef.current.position.set( targetX, targetY, 0 )
    //     }
    // } )

    useEffect( () => {
        window.addEventListener( "pointerup", onPointerUp )

        return () => window.removeEventListener( "pointerup", onPointerUp )
    }, [ onPointerUp ] )

    return ( <Suspense fallback={ null }>
        { stars.map( ( star, index ) => (
            <Sparkle
                key={ index }
                index={ index }
                position={ star.position }
                texturePath={ star.texturePath }
                scale={ star.scale }
                color={ star.color }
                onAction={ onPointerDown }
            />
        ) ) }
        <mesh position={ [ 0, 0, -1 ] }>
            <planeGeometry args={ [ viewport.width, viewport.height ] }/>
            <meshBasicMaterial
                map={ playTexture }
                toneMapped={ false }
            />
        </mesh>
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
            startingPosition={ { x: 8 -  viewport.width / 2 + 3, y: viewport.height / 2 + 3 } }
            startTime={ 0.7 }
        />
    </Suspense> )
}

export default function DesignIsPlay() {
    return ( <Canvas id="canvas" orthographic camera={ { zoom: 90 } } dpr={ 2 }>
        <OrbitControls/>
        <Scene/>
    </Canvas> )
}