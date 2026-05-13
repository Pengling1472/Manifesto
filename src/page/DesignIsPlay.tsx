import { Text, useTexture } from "@react-three/drei"
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"

import { TwinkleVertex, TwinkleFragment } from "../shaders/Twinkle"
import { Suspense, useMemo, useRef, useState } from "react"
import { SRGBColorSpace, type Mesh, type ShaderMaterial } from "three"

import background from "../assets/images/background.png"
import shootingStar from "../assets/images/shooting-star.png"
import playText from "../assets/svg/play-text.svg"

import { Cursor } from "./Home"
import { SVGLoader } from "three/examples/jsm/Addons.js"

import courierPrimeBoldItalic from "../assets/fonts/CourierPrime-BoldItalic.ttf"
import courierPrimeRegular from "../assets/fonts/CourierPrime-Regular.ttf"

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

interface twinkleProps {
    index: number
    position: { x: number, y: number }
    texturePath: string
    scale: number
    color: starColors
    onAction: ( id: number, node: Mesh ) => void 
}

interface twinkleDataStructure {
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
        time.current = Math.min( time.current + Math.min( delta, 0.1 ) * speed.current, 1 )
        
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

function Twinkle( { index, position, texturePath, scale, color, onAction }: twinkleProps ) {
    const svgData = useLoader( SVGLoader, texturePath )
    const shapes = useMemo( () => ( svgData.paths.map( path => path.toShapes( true ) ) ), [ svgData ] )
    const randomTimeRef = useRef<number>( Math.floor( Math.random() * 100 ) )
    const meshRef = useRef<Mesh>( null )
    const materialRef = useRef<ShaderMaterial>( null )
    const twinkleColor = [
        [ 0.25, 0.58, 0.54 ],
        [ 0.47, 0.37, 1    ],
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
    >
        <mesh scale={ [ 0.01, -0.01, 1 ] } position={ [ -1.47, 1.47, 0 ] }
            onPointerDown={ () => {
                if ( meshRef.current ) onAction( index, meshRef.current )
            } }
        >
            { shapes.map( ( shape, index ) => (
                <mesh key={ index }>
                    <extrudeGeometry
                        args={ [ shape, {
                            depth: 0.1,
                            bevelEnabled: false,
                            steps: 1
                        } ] }
                    />
                    <meshBasicMaterial
                        color={ svgData.paths[ index ].color }
                        transparent
                    />
                </mesh>
            ) ) }
        </mesh>
        <mesh renderOrder={ -1 }>
            <planeGeometry args={ [ scale, scale ] }/>
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

    const backgroundTexture = useTexture( background )
    const [ stars ] = useState<twinkleDataStructure[]>( () =>
        new Array( 26 ).fill( null ).map( ( _, index ) => ( {
            texturePath: new URL( `../assets/play/${ index + 1 }.svg`, import.meta.url ).href,
            ...starsData[ index ]
        } ) )
    )
    const audios = useMemo<HTMLAudioElement[]>( () => (
        new Array( 26 ).fill( null ).map( ( _, index ) => {
            const audio = new Audio()
            const path = new URL( `../assets/play-audio/${ index + 1 }.mp3`, import.meta.url ).href

            audio.src = path
            audio.preload = "auto"
            audio.load()

            return audio
        } )
    ), [] )

    const onPointerDown = ( index: number) => {
        const audio = audios[ index ]

        audio.currentTime = 0
        audio.play()
    }
    
    return ( <Suspense fallback={ null }>
        { stars.map( ( star, index ) => (
            <Twinkle
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
                map={ backgroundTexture }
                toneMapped={ false }
                onUpdate={ () => {
                    backgroundTexture.colorSpace = SRGBColorSpace
                    backgroundTexture.needsUpdate = true
                } }
            />
        </mesh>
        <group
            position={ [ 0, 0, 3 ] }
        >
            <Text position={ [ -8.1, 3.3, 0 ] } font={ courierPrimeRegular } anchorX={ "left" } fontSize={ 0.25 } lineHeight={ 1.5 } color={ "#F7E0A8" }>
                { `We learn best when we forget we're learning.\nAs children, we touched, tested, broke things, and tried again.\nCuriosity came naturally; yet, somewhere along the way...` }
            </Text>
            <Text position={ [ -8.1, 2.5, 0 ] } font={ courierPrimeBoldItalic } anchorX={ "left" } fontSize={ 0.3 } color={ "#F7E0A8" }>
                We traded it in for certainty.
            </Text>
            <Text position={ [ 8.3, 0.85, 0 ] } font={ courierPrimeBoldItalic } anchorX={ "right" } fontSize={ 0.67 } color={ "#F7E0A8" }>
                Design asks for it back.
            </Text>
            <Text position={ [ -8.1, -1, 0 ] } font={ courierPrimeRegular } anchorX={ "left" } fontSize={ 0.25 } lineHeight={ 1.5 } color={ "#F7E0A8" }>
                { `One detail leads to another…\n          ...one discovery opens a door you didn't see coming. ` }
            </Text>
            <Text position={ [ -3.4, -3.7, 0 ] } font={ courierPrimeBoldItalic } anchorX={ "left" } fontSize={ 0.32 } color={ "#F7E0A8" }>
                And suddenly you're inside it, lost in the best possible way.
            </Text>
        </group>
        <group position={ [ 0, 0, -0.5 ] }>
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
        </group>
        <Cursor scale={ 0.5 }/>
    </Suspense> )
}

export default function DesignIsPlay() {
    return ( <Canvas
        id="canvas"
        orthographic
        camera={ { zoom: 90, near: -20 } }
    >
        <Scene/>
    </Canvas> )
}