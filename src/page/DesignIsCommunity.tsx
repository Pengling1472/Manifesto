import { Center, Text, useFBO, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";

import { GuassianBlurVertex, GuassianBlurFragment } from "../shaders/GuassianBlur";

import background from "../assets/images/background.png"
import { ShaderMaterial, SRGBColorSpace, RepeatWrapping, Group, Mesh, Material } from "three";

import { ShootingStar } from "./DesignIsPlay";
import { Cursor } from "./Home";
import { SVGLoader } from "three/examples/jsm/Addons.js";

import courierPrimeBold from "../assets/fonts/CourierPrime-Bold.ttf"
import blurTextBox from "../assets/images/blur-text-box.png"

interface letterDataStructure {
    texturePath: string
    svgPath: string
}

interface letterProps {
    texturePath: string
    svgPath: string
    index: number
    onAction: ( node: Mesh, index: number ) => void
}

enum colorType {
    Green,
    Yellow,
    RedPink,
    LightPurple,
    Orange
}

const dialogues: string[] = [
    `We believe that design holds a\ncommunity.`,
    `The most powerful visual language is\nweaved from unwritten traditions,\nquiet symbols only insiders recognize.`,
    `Impactful design echoes voices that\nrarely get to see themselves\nreflected back.`,
    `When design listens before it speaks,\nit becomes a mirror. It reflects who\nwe are, where we came from, and who\nwe're making space for.`,
    `The pieces that matter most are not\nthose that impress strangers. They're\nthe ones who make those closest to you\nfeel seen.`
]

const letterData: colorType[] = [
    colorType.Green, //V
    colorType.Yellow, //i
    colorType.RedPink, //b
    colorType.LightPurple, //R
    colorType.Orange, //a
    colorType.Yellow, //n
    colorType.RedPink, //T
    colorType.Orange, //e
    colorType.LightPurple, //t
    colorType.Green, //a
    colorType.RedPink, //e
    colorType.Yellow, //r
    colorType.LightPurple, //c
    colorType.Green, //e
    colorType.Yellow, //w
    colorType.RedPink, //g
    colorType.Orange, //e
    colorType.LightPurple, //h
    colorType.RedPink, //t
    colorType.Yellow, //e
    colorType.RedPink, //g
    colorType.Orange, //O
    colorType.LightPurple, //T
    colorType.Green, //d
    colorType.Yellow, //i
    colorType.RedPink, //V
    colorType.LightPurple, //e
    colorType.Orange, //R
    colorType.Green, //S
    colorType.LightPurple, //e
    colorType.Yellow, //a
    colorType.Orange, //n
    colorType.RedPink, //d
]

function Letter( { texturePath, svgPath, index, onAction }: letterProps ) {
    const groupRef = useRef<Mesh>( null )
    const svgData = useLoader( SVGLoader, svgPath )
    const shapes = useMemo( () => ( svgData.paths.map( path => path.toShapes( true ) ) ), [ svgData ] )

    const texture = useTexture( texturePath )

    return ( <group ref={ groupRef }>
        <mesh
            scale={ [ 4, 4, 4 ] }
        >
            <planeGeometry/>
            <meshBasicMaterial
                map={ texture }
                transparent
            />
        </mesh>
        <Center>
            <mesh scale={ [ 0.008, -0.008, 1 ] }
                onPointerDown={ () => {
                    if ( groupRef.current ) onAction( groupRef.current, index )
                } }
                renderOrder={ -1 }
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
                            transparent
                            opacity={ 0 }
                        />
                    </mesh>
                ) ) }
            </mesh>
        </Center>
    </group> )
}

function Scene() {
    type TypeText = ComponentRef<typeof Text>

    const { viewport, scene, camera } = useThree()
    const renderTarget = useFBO()
    const guassianMaterial = useRef<ShaderMaterial>( null )
    const textBoxMaterial = useRef<Material>( null )
    const textMaterial = useRef<Material>( null )
    const textBox = useRef<Mesh>( null )
    const textRef = useRef<TypeText>( null! )
    const opacity = useRef<number>( 0 )
    const selectedNode = useRef<Mesh>( null )
    const nodeID = useRef<number>( 0 )
    const time = useRef<number>( 0 )
    const textTime = useRef<number>( 0 )
    const visibleCharacter = useRef<number>( 0 )
    const blurTextBoxTexture = useTexture( blurTextBox )

    const backgroundTexture = useTexture( background )
    const [ letters ] = useState<letterDataStructure[]>(
        new Array( 33 ).fill( null ).map( ( _, index ) => ( {
            texturePath: new URL( `../assets/community/slice${ index + 1 }.png`, import.meta.url ).href, 
            svgPath: new URL( `../assets/community-svg/${ index + 1 }.svg`, import.meta.url ).href,
            rotation: 0
        } ) )
    )

    const groupRef = useRef<Group>( null )

    const onPointerDown = ( node: Mesh, index: number ) => {
        if ( selectedNode.current != null ) return

        selectedNode.current = node
        nodeID.current = index

        const position = node.position

        // node.position.set( position.x, position.y, 11 )

        if ( textBox.current && textBoxMaterial.current ) {
            textBox.current.position.set(
                position.x + ( position.x > 0 ? -3.5 : 3.5 ),
                position.y,
                9.5
            )

            visibleCharacter.current = 0
            textRef.current.text = ``
        }
    }

    const onPointerDownOutside = () => {
        if ( !selectedNode.current || opacity.current == 0 ) return

        selectedNode.current = null
    }

    useFrame( ( { gl }, delta ) => {
        opacity.current = Math.min( Math.max( opacity.current + ( selectedNode.current == null ? -delta : delta ) * 2, 0 ), 1 )

        if ( textTime.current > 1 && visibleCharacter.current < dialogues[ letterData[ nodeID.current ] ].length ) {
            textTime.current = 0
            visibleCharacter.current += 1

            textRef.current.text = dialogues[ letterData[ nodeID.current ] ].slice( 0, visibleCharacter.current )
        }

        if ( textBoxMaterial.current && textMaterial.current ) {
            textMaterial.current.opacity = opacity.current
            textBoxMaterial.current.opacity = opacity.current
        }

        scene.children[ 3 ].visible = false
        scene.children[ 5 ].visible = false

        if ( textBox.current ) textBox.current.children[ 0 ].visible = false
        if ( opacity.current > 0 ) scene.children[ 0 ].children[ nodeID.current ].visible = false

        gl.setRenderTarget( renderTarget )
        gl.render( scene, camera )

        if ( guassianMaterial.current ) {
            renderTarget.texture.wrapS = RepeatWrapping
            renderTarget.texture.wrapT = RepeatWrapping

            guassianMaterial.current.uniforms.uOpacity.value = opacity.current
            guassianMaterial.current.uniforms.uTexture.value = renderTarget.texture
        }

        gl.setRenderTarget( null )

        if ( opacity.current > 0 ) scene.children[ 0 ].children[ nodeID.current ].visible = true

        scene.children[ 3 ].visible = true
        scene.children[ 5 ].visible = true

        if ( textBox.current ) textBox.current.children[ 0 ].visible = true
        if ( opacity.current == 1 ) textTime.current += delta * 30
        if ( groupRef.current && opacity.current < 1 ) {
            time.current += delta * ( 0.1 * ( 1 - opacity.current ) )

            for ( let i = 0; i < groupRef.current.children.length; i++ ) {
                groupRef.current.children[ i ].position.set(
                    6 * Math.cos( 2 * Math.PI * i / 33 - time.current ),
                    1.5 * Math.sin( 3.1 + 4 * Math.PI * i / 33 - time.current * 2 ),
                    nodeID.current == i && opacity.current > 0 ? 11 : 6 * Math.sin( 2 * Math.PI * i / 33 - time.current )
                )
            }
        }
    } )

    useEffect( () => {
        window.addEventListener( "pointerdown", onPointerDownOutside )

        return () => window.removeEventListener( "pointerdown", onPointerDownOutside )
    }, [] )

    return ( <>
        {/* <OrbitControls/> */}
        <group ref={ groupRef }>
            { letters.map( ( letter, index ) => (
                <Letter
                    key={ index }
                    index={ index }
                    texturePath={ letter.texturePath }
                    svgPath={ letter.svgPath }
                    onAction={ onPointerDown }
                />
            ) ) }
        </group>
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
        <mesh ref={ textBox }>
            <planeGeometry args={ [ 6 * 1.1, 2 * 1.1 ] }/>
            <meshBasicMaterial ref={ textBoxMaterial } map={ blurTextBoxTexture } transparent/>
            <Text ref={ textRef } position={ [ -2.25, 0.45, 2 ] } font={ courierPrimeBold } fontSize={ 0.2 } anchorX={ "left" } anchorY={ "top" }>
                <meshBasicMaterial ref={ textMaterial } transparent/>
                { `` }
            </Text>
        </mesh>
        <mesh position={ [ 0, 0, 10 ] }>
            <planeGeometry args={ [ viewport.width, viewport.height ] }/>
            <shaderMaterial
                ref={ guassianMaterial }
                transparent={ true }
                toneMapped={ true }
                vertexShader={ GuassianBlurVertex() }
                fragmentShader={ GuassianBlurFragment() }
                uniforms={ { uTexture: { value: null }, uOpacity: { value: 1.0 }, uvStride: { value: [ 1 / viewport.width, 1 / viewport.height ] } } }
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
        <Cursor scale={ 0.5 }/>
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