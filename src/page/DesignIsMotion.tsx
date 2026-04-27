import { Text, useTexture } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState, Suspense } from 'react'

import telegraphBold from "../assets/fonts/Telegraf_Bold.otf"

// import * as THREE from "three"
import { CuboidCollider, Physics, RapierRigidBody, RigidBody } from '@react-three/rapier'

interface characterProps {
    text: string
    position: { x: number, y: number }
    addParticle: ( position: { x: number, y: number } ) => void
}

interface particleProps {
    position: { x: number, y: number }
    id: number
}

useTexture.preload( [
    "/motion/1-trail.png",
    "/motion/2-trail.png",
    "/motion/3-trail.png",
    "/motion/4-trail.png",
    "/motion/5-trail.png",
    "/motion/6-trail.png",
    "/motion/7-trail.png",
    "/motion/8-trail.png"
] )

function Particle( { position, id }: particleProps ) {
    const trail = useTexture( `/motion/${id + 1}-trail.png` )
    const rigidBodyRef = useRef<RapierRigidBody>( null )

    useEffect( () => {
        const timer = setTimeout( () => {
            if ( rigidBodyRef.current ) {
                // const randomX = (Math.random() - 0.5) * 10;
                // const randomY = (Math.random() - 0.5) * 10;
    
                console.log( "spawned" )
                rigidBodyRef.current.applyImpulse( { x: -10 + Math.floor( Math.random() * 20 ), y: 1 + Math.floor( Math.random() * 10 ), z: 0 }, true ) 
                // rigidBodyRef.current.applyImpulse( { x: 0, y: 100, z: 0 }, true ) 
            }
        }, 20 )

        return () => clearTimeout( timer )
    }, [] )

    return ( <>
        <RigidBody
            ref={ rigidBodyRef }
            enabledTranslations={ [ true, true, false ] }
			enabledRotations={ [ false, false, true ] }
            type='dynamic'
            gravityScale={ 0 }
            // linearVelocity={ [ 0, -30, 0 ] }
            restitution={ 1 }
            linearDamping={ 0 }
            angularDamping={ 0 }
            colliders="cuboid"
            friction={ 1 }
            >
            <mesh
                scale={ 4 }
                position={ [ position.x, position.y, -1 ] }>
                <boxGeometry args={ [ 1, 1, 0.01 ] }/>
                <meshBasicMaterial
                    transparent={ true }
                    toneMapped={ false }
                    map={ trail }
                    color={ "white" }/>
            </mesh>
            {/* <CuboidCollider args={ [ 1, 1, 1 ] } sensor/> */}
        </RigidBody>
    </> )
}

function Character( { text, position, addParticle }: characterProps ) {
    const rigidBodyRef = useRef<RapierRigidBody>( null )
    const isDraggingRef = useRef<boolean>( false )
    const timer = useRef<number>( 0 )

    useFrame( ( { mouse, viewport }, delta ) => {
        if ( rigidBodyRef.current && isDraggingRef.current ) {
            
            const targetX = ( mouse.x * viewport.width ) / 2
            const targetY = ( mouse.y * viewport.height ) / 2

            timer.current += delta

            if ( timer.current > 0.25 ) {
                timer.current = 0

                console.log( "h" )
                
                // addParticle( <Particle position={ { x: targetX, y: targetY } }/> )
                addParticle( { x: targetX, y: targetY } )
            }
            
            rigidBodyRef.current.setTranslation( { x: targetX, y: targetY, z: 0 }, true )
        }
    } )

    useEffect( () => {
        const handlePointerUp = () => {
            if ( !isDraggingRef.current ) return

            isDraggingRef.current = false
        }

        window.addEventListener( "pointerup", handlePointerUp )

        return () => window.removeEventListener( "pointerup", handlePointerUp )
    }, [] )

    return ( <>
        <RigidBody
            ref={ rigidBodyRef }
            enabledTranslations={ [ true, true, false ] }
			enabledRotations={ [ false, false, true ] }
			linearDamping={ 3 }
			angularDamping={ 2 }
            position={ [ position.x, position.y, 0 ] }>
            <Text
                font={ telegraphBold }
                fontSize={ 4 }
                color="#7981bf"
                onPointerDown={ () => {
                    isDraggingRef.current = true
                } }>
                { text }
            </Text>
        </RigidBody>
    </> )
}

export default function DesignIsMotion() {
    const [ particles, setParticles ] = useState<React.ReactNode[]>( [] )

    const addParticle = ( { x, y }: { x: number, y: number }, id: number ) => {
        setParticles( [ ...particles, <Particle position={ { x, y } } id={ id }/> ] )
    }

    return (
        <article className='design-is-motion'>
            <h2>As a [  ] designer, I create [  ] by [  ]</h2>
            <h1>Design is Motion</h1>
            <Canvas orthographic camera={ { zoom: 35 } }>
                {/* <ambientLight intensity={ 10 }/> */}
                <Physics gravity={ [ 0, 0, 0 ] }>
                    <Character text='D' position={ { x: -12, y: 6.5 } } addParticle={ ( position ) => addParticle( position, 0 ) }/>
                    <Character text='e' position={ { x: -9, y: 8.5 } } addParticle={ ( position ) => addParticle( position, 1 ) }/>
                    <Character text='s' position={ { x: -6, y: 7.5 } } addParticle={ ( position ) => addParticle( position, 0 ) }/>
                    <Character text='i' position={ { x: -3, y: 8 } } addParticle={ ( position ) => addParticle( position, 1 ) }/>
                    <Character text='g' position={ { x: 0, y: 5 } } addParticle={ ( position ) => addParticle( position, 2 ) }/>
                    <Character text='n' position={ { x: 3, y: 5.5 } } addParticle={ ( position ) => addParticle( position, 3 ) }/>
                    <Character text='i' position={ { x: -18, y: -2.5 } } addParticle={ ( position ) => addParticle( position, 2 ) }/>
                    <Character text='s' position={ { x: -15, y: -4 } } addParticle={ ( position ) => addParticle( position, 3 ) }/>
                    <Character text='M' position={ { x: 0, y: -2.5 } } addParticle={ ( position ) => addParticle( position, 4 ) }/>
                    <Character text='o' position={ { x: 3.5, y: -1 } } addParticle={ ( position ) => addParticle( position, 5 ) }/>
                    <Character text='t' position={ { x: 6, y: -1.5 } } addParticle={ ( position ) => addParticle( position, 4 ) }/>
                    <Character text='i' position={ { x: 8.75, y: -1.5 } } addParticle={ ( position ) => addParticle( position, 5 ) }/>
                    <Character text='o' position={ { x: 11.5, y: -4.5 } } addParticle={ ( position ) => addParticle( position, 6 ) }/>
                    <Character text='n' position={ { x: 15, y: -4.5 } } addParticle={ ( position ) => addParticle( position, 7 ) }/>
                    <Suspense fallback={ null }>
                        { particles }
                    </Suspense>
                </Physics>
            </Canvas>
        </article>
    )
}