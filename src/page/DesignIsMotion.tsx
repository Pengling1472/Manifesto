import { Text, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState, Suspense, useMemo } from 'react'

import telegraphBold from "../assets/fonts/Telegraf_Bold.otf"

import { Physics, RapierRigidBody, RigidBody } from '@react-three/rapier'
import blurBrush from "../assets/brushes/blur-brush.png"
import motionBackground from '../assets/images/motion-background.png'

import * as THREE from "three"

import { DecalVertex, DecalFragment } from '../shaders/Decal'

import { Cursor } from './Home'
import { ShootingStar } from './DesignIsPlay'

import trail1 from "../assets/motion/1-trail.png"
import trail2 from "../assets/motion/2-trail.png"
import trail3 from "../assets/motion/3-trail.png"
import trail4 from "../assets/motion/4-trail.png"
import trail5 from "../assets/motion/5-trail.png"
import trail6 from "../assets/motion/6-trail.png"
import trail7 from "../assets/motion/7-trail.png"
import trail8 from "../assets/motion/8-trail.png"

interface characterProps {
    id: number
    text: string
    position: { x: number, y: number }
    onAction: ( id: number, node: RapierRigidBody ) => void
}

interface characterDataStructure {
    id: number
    text: string
    position: { x: number, y: number }
}

interface decalProps {
    isDrawing: boolean
}

interface particleProps {
    id: number
    trailID: number
    active: boolean
    velocity: { x: number, y: number }
    position: { x: number, y: number }
    onAction: ( id: number ) => void
}

interface particlesDataStructure {
    id: number
    trailID: number
    active: boolean
    velocity: { x: number, y: number }
    position: { x: number, y: number }
}

function Particle( { id, trailID, active, velocity, position, onAction }: particleProps ) {
    const rigidBodyRef = useRef<RapierRigidBody>( null )
    const materialRef = useRef<THREE.Material>( null )
    const opacity = useRef<number>( 1 )
    const [ isActive, setIsActive ] = useState( false )
    const texture = useTexture( [ trail1, trail2, trail3, trail4, trail5, trail6, trail7, trail8 ][ trailID ] )

    useEffect( () => {
        if ( active && rigidBodyRef.current ) {
            rigidBodyRef.current.setLinvel( { x: velocity.x, y: velocity.y, z: 0 }, true )   
            rigidBodyRef.current.setTranslation( { x: position.x, y: position.y, z: 0 }, true )
            
            setTimeout( () => {
                setIsActive( true )
            }, 20 )
        }
        if ( !isActive && materialRef.current ) {
            materialRef.current.opacity = opacity.current
            
            opacity.current = 1
        }
    }, [ active, isActive ] )
    
    useFrame( ( _, delta ) => {
        if ( active && materialRef.current ) {
            opacity.current = Math.max( opacity.current - delta * 0.8, 0 )
            materialRef.current.opacity = opacity.current
        }
        if ( opacity.current == 0 && rigidBodyRef.current ) {
            rigidBodyRef.current.sleep()

            onAction( id )
            setIsActive( false )
        }
    } )

    return ( <RigidBody
        ref={ rigidBodyRef }
        type='dynamic'
        linearDamping={ 5 }
        angularDamping={ 2 }
        sensor={ true }
        position={ [ -20, -20, -1 ] }
        includeInvisible
    >
        <mesh
            visible={ isActive }
            scale={ 1.5 }
        >
            <boxGeometry args={ [ 1, 1, 0.1 ] }/>
            <meshBasicMaterial
                ref={ materialRef }
                transparent={ true }
                toneMapped={ false }
                map={ texture }
            />
        </mesh>
    </RigidBody> ) 
}

function Character( { id, text, position, onAction }: characterProps ) {
    const rigidBodyRef = useRef<RapierRigidBody>( null )

    return ( <>
        <RigidBody
            ref={ rigidBodyRef }
            enabledTranslations={ [ true, true, false ] }
			enabledRotations={ [ false, false, true ] }
			linearDamping={ 20 }
			angularDamping={ 15 }
            position={ [ position.x, position.y, 1 ] }
        >
            <Text
                font={ telegraphBold }
                fontSize={ 1 }
                color="white"
                onPointerDown={ () => {
                    if ( rigidBodyRef.current ) onAction( id, rigidBodyRef.current )
                } }>
                { text }
            </Text>
        </RigidBody>
    </> )
}

function DecalComponent( { isDrawing }: decalProps ) {
    const { viewport } = useThree()
    const backgroundTexture = useTexture( motionBackground )
    const brush = useMemo( () => {
        const brush = new Image()

        brush.src = blurBrush

        return brush
    }, [] )
    const canvas = useMemo( () => {
        const canvas = document.createElement( "canvas" )
        const ctx = canvas.getContext( "2d" ) as CanvasRenderingContext2D

        canvas.width = viewport.width * 40
        canvas.height = viewport.height * 40

        ctx.fillStyle = "black"
        ctx.fillRect( 0, 0, viewport.width * 40, viewport.height * 40 )
        
        return canvas
    }, [] )
    const texture = useMemo( () => new THREE.CanvasTexture( canvas ), [ canvas ] )

    useFrame( ( { mouse } ) => {
        const ctx = canvas.getContext( "2d" )

        if ( ctx && isDrawing ) {
            const targetX = mouse.x * viewport.width * 40 / 2
			const targetY = mouse.y * viewport.height * 40 / 2

            ctx.drawImage( brush, targetX + viewport.width / 2 * 40 - 80 / 2, -targetY + viewport.height / 2 * 40 - 80 / 2, 80, 80 )

            texture.needsUpdate = true
        }
    } )

    return ( <>
        <mesh
            position={ [ 0, 0, -5 ] }
        >
            <shaderMaterial
                vertexShader={ DecalVertex() }
                fragmentShader={ DecalFragment() }
                uniforms={ { uTexture: { value: texture }, uBackground: { value: backgroundTexture } } }
            />
            <boxGeometry args={ [ viewport.width, viewport.height, 1 ] }/>
        </mesh>
    </> )
}

function Scene() {
    const { viewport } = useThree()

    const time = useRef<number>( 0 )
    const nodeID = useRef<number>( 0 )
    const selectedNode = useRef<RapierRigidBody>( null )
    const [ isDrawing, setIsDrawing ] = useState<boolean>( false )
    const [ particles, setParticles ] = useState<particlesDataStructure[]>(
        new Array( 60 ).fill( null ).map( ( _, index ) => ( { id: index, trailID: index % 8, active: false, velocity: { x: 0, y: 0 }, position: { x: 0, y: 0 } } ) )
    )
    const [ characters ] = useState<characterDataStructure[]>( [
        { id: 0, text: 'D', position: { x: -4.675, y: 0 } },
        { id: 1, text: 'E', position: { x: -4,   y: 0 } },
        { id: 0, text: 'S', position: { x: -3.375, y: 0 } },
        { id: 1, text: 'I', position: { x: -2.8, y: 0 } },
        { id: 2, text: 'G', position: { x: -2.175,  y: 0 } },
        { id: 3, text: 'N', position: { x: -1.425,  y: 0 } },
        { id: 2, text: 'I', position: { x: -0.5,    y: 0 } },
        { id: 3, text: 'S', position: { x: 0.075,   y: 0 } },
        { id: 4, text: 'M', position: { x: 1.15,   y: 0 } },
        { id: 5, text: 'O', position: { x: 2.025,   y: 0 } },
        { id: 4, text: 'T', position: { x: 2.7,  y: 0 } },
        { id: 5, text: 'I', position: { x: 3.275,  y: 0 } },
        { id: 6, text: 'O', position: { x: 3.875,  y: 0 } },
        { id: 7, text: 'N', position: { x: 4.65,  y: 0 } }
    ] )

    const onPointerDown = ( id: number, node: RapierRigidBody ) => {
        if ( !selectedNode.current ) {
            selectedNode.current = node
            nodeID.current = id

            setIsDrawing( true )
        }
    }

    const handlePointerUp = () => {
        selectedNode.current = null
        time.current = 0

        setIsDrawing( false )
    }

    const disableParticle = ( id: number ) => {
        setParticles( current => {
            const newParticles = [ ...current ]

            newParticles[ id ].active = false

            return newParticles
        } )
    }

    useEffect( () => {
        window.addEventListener( "pointerup", handlePointerUp )

        return () => window.removeEventListener( "pointerup", handlePointerUp )
    }, [] )

    useFrame( ( { mouse }, delta ) => {
        time.current += delta

        if ( time.current > 0.02 && selectedNode.current ) {
            time.current = 0

            const index = particles.findIndex( particle => !particle.active )
            const nodeVelocity = selectedNode.current.linvel()

            if ( index > -1 && ( Math.abs( nodeVelocity.x ) >= 1 || Math.abs( nodeVelocity.y ) >= 1 ) ) {
                const nodePosition = selectedNode.current.translation()

                nodeVelocity.x = Math.min( Math.max( -nodeVelocity.x, -3 ), 3 )
                nodeVelocity.y = Math.min( Math.max( -nodeVelocity.y, -3 ), 3 )
                
                setParticles( current => {
                    const newParticles = [ ...current ] 
                    
                    newParticles[ index ].position = { x: nodePosition.x, y: nodePosition.y }
                    newParticles[ index ].velocity = { x: nodeVelocity.x, y: nodeVelocity.y }
                    newParticles[ index ].trailID = nodeID.current
                    newParticles[ index ].active = true

                    return newParticles
                } )
            }
        }

        if ( selectedNode.current ) {
            const targetX = ( mouse.x * viewport.width ) / 2
            const targetY = ( mouse.y * viewport.height ) / 2

            const position = selectedNode.current.translation()

			const dx = ( targetX - position.x ) * 20
			const dy = ( targetY - position.y ) * 20
			
			selectedNode.current.setLinvel( { x: dx, y: dy, z: 0 }, true )
        }
    } )

    return ( <>
        <Physics gravity={ [ 0, 0, 0 ] }>
            <Suspense fallback={ null }>
                {
                    characters.map( ( character, index ) => (
                        <Character
                            key={ index }
                            id={ character.id }
                            text={ character.text }
                            position={ character.position }
                            onAction={ onPointerDown }
                        />
                    ) )
                }
                {
                    particles.map( particle => (
                        <Particle
                            key={ particle.id }
                            id={ particle.id }
                            trailID={ particle.trailID }
                            active={ particle.active }
                            velocity={ particle.velocity }
                            position={ particle.position }
                            onAction={ disableParticle }
                        />
                    ) )
                }
                <DecalComponent isDrawing={ isDrawing }/>
                <group position={ [ 0, 0, 0 ] }>
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
                <Cursor scale={ 1 }/>
            </Suspense>
        </Physics>
    </> )
}

export default function DesignIsMotion() {
    return (
        <section className='design-is-motion'>
            <Canvas id='canvas' orthographic camera={ { zoom: 100, near: -20 } } dpr={ 1 }>
                <Scene/>
            </Canvas>
        </section>
    )
}