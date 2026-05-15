import { Center, Text, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState, Suspense, useMemo } from 'react'

import telegraphBold from "../assets/fonts/Telegraf_Bold.otf"

import { Physics, RapierRigidBody, RigidBody } from '@react-three/rapier'
import blurBrush from "../assets/brushes/blur-brush.png"
import motionBackground from '../assets/images/motion-background.png'
import button from "../assets/svg/home-button.svg"
import music from "../assets/background-music/motion.mp3"

import * as THREE from "three"

import { DecalVertex, DecalFragment } from '../shaders/Decal'

import { Cursor } from './Home'
import { Oumuamua, ShootingStar } from './DesignIsPlay'

import trail1 from "../assets/motion/1-trail.png"
import trail2 from "../assets/motion/2-trail.png"
import trail3 from "../assets/motion/3-trail.png"
import trail4 from "../assets/motion/4-trail.png"
import trail5 from "../assets/motion/5-trail.png"
import trail6 from "../assets/motion/6-trail.png"
import trail7 from "../assets/motion/7-trail.png"
import trail8 from "../assets/motion/8-trail.png"
import { useNavigate } from 'react-router-dom'
import { SVGLoader } from 'three/examples/jsm/Addons.js'

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
	const brush = useMemo( () => {
		const brush = new Image()

		brush.src = blurBrush

		return brush
	}, [] )
	const canvas = useMemo( () => {
		const canvas = document.createElement( "canvas" )
		const ctx = canvas.getContext( "2d" ) as CanvasRenderingContext2D

		canvas.width = 1920
		canvas.height = 1080

		ctx.fillStyle = "black"
		ctx.fillRect( 0, 0, canvas.width, canvas.height )
		
		return canvas
	}, [] )
	const texture = useMemo( () => new THREE.CanvasTexture( canvas ), [ canvas ] )
	const previousPosition = useRef<{ x: number, y: number }>( { x: 0, y: 0 } )

	useFrame( ( { mouse } ) => {
		const ctx = canvas.getContext( "2d" )

		if ( ctx && isDrawing ) {
			const size = 225
			const scale = viewport.height / 9
			
			const targetX = mouse.x * viewport.width  / ( 16 * scale ) * 1920 / 2
			const targetY = mouse.y * viewport.height / ( 9  * scale ) * 1080 / 2
			const distance = Math.sqrt( ( previousPosition.current.x - targetX ) ** 2 + ( previousPosition.current.y - targetY ) ** 2 )

			if ( previousPosition.current.x != 0 && previousPosition.current.y != 0 && distance >= 80 ) {
				const points = 10
	
				for ( let i = 0; i <= points; i++ ) {
					const m = ( targetY - previousPosition.current.y ) / ( targetX - previousPosition.current.x )
	
					const x = ( targetX - previousPosition.current.x ) / ( points + 1 ) * i + previousPosition.current.x
					const y = m * i * ( ( targetX - previousPosition.current.x ) / ( points + 1 ) ) + previousPosition.current.y
	
					ctx.drawImage( brush, x + canvas.width / 2 - size / 2, -y + canvas.height / 2 - size / 2, size, size )
					ctx.drawImage( brush, x + canvas.width / 2 - size / 2, -y + canvas.height / 2 - size / 2, size, size )
				}
			}
			
			ctx.drawImage( brush, targetX + canvas.width / 2 - size / 2, -targetY + canvas.height / 2 - size / 2, size, size )
			
			previousPosition.current = { x: targetX, y: targetY }

			texture.needsUpdate = true
		}
		if ( !isDrawing ) previousPosition.current = { x: 0, y: 0 }
	} )

	return ( <>
		<mesh
			position={ [ 0, 0, -5 ] }
			scale={ viewport.height / 9 }
		>
			<shaderMaterial
				transparent
				vertexShader={ DecalVertex() }
				fragmentShader={ DecalFragment() }
				uniforms={ { uTexture: { value: texture } } }
			/>
			<planeGeometry args={ [ 16, 9 ] }/>
		</mesh>
	</> )
}

function Scene() {
	const { viewport, camera } = useThree()
	const navigate = useNavigate()

	const svgButtonData = useLoader( SVGLoader, button )
	const buttonShapes = useMemo( () => ( svgButtonData.paths.map( path => path.toShapes( true ) ) ), [ svgButtonData ] )

	const listener = useRef<THREE.AudioListener>( new THREE.AudioListener() )
	const sound = useRef<THREE.Audio>( new THREE.Audio( listener.current ) )
	const time = useRef<number>( 0 )
	const nodeID = useRef<number>( 0 )
	const selectedNode = useRef<RapierRigidBody>( null )
	const backgroundTexture = useTexture( motionBackground )
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

		const audioLoader = new THREE.AudioLoader()
		
		camera.add( listener.current )

		audioLoader.load( music, buffer => {
			sound.current.setBuffer( buffer )
			sound.current.setLoop( true )
			sound.current.setVolume( 0.5 )

			sound.current.play()
		} )

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

				// const degrees = 40
				//+ ( degrees * Math.PI ) / 180 * ( Math.random() - 1 / 2 )
				// const mathDelta = Math.atan2( nodeVelocity.y, nodeVelocity.x )
				// const dx = nodeVelocity.x * Math.cos( mathDelta )
				// const dy = nodeVelocity.y * Math.sin( mathDelta )

				const dx = ( -nodeVelocity.x + Math.random() * ( nodeVelocity.x > 0 ? -50 : 50 ) - 25 ) / 10
				const dy = ( -nodeVelocity.y + Math.random() * ( nodeVelocity.y > 0 ? -50 : 50 ) - 25 ) / 10 

				nodeVelocity.x = dx
				nodeVelocity.y = dy

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
				<mesh position={ [ 0, 0, -7 ] } scale={ viewport.height / 9 }>
					<planeGeometry args={ [ 16, 9 ] }/>
					<meshBasicMaterial
						map={ backgroundTexture }
						onUpdate={ () => {
							backgroundTexture.colorSpace = THREE.SRGBColorSpace
							backgroundTexture.needsUpdate = true
						} }
					/>
				</mesh>
				<group position={ [ 0, 0, -6 ] }>
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
				<DecalComponent isDrawing={ isDrawing }/>
				<group position={ [ 0, -4.6, 1 ] }>
					<Center scale={ [ 0.008, -0.008, 0.008 ] }>
						<mesh
							onPointerDown={ () => {
								sound.current.stop()
								camera.remove( listener.current )

								navigate( "/" )
							} }
						>
							{
								buttonShapes.map( ( shape, index ) => ( <mesh key={ index }>
									<extrudeGeometry
										args={ [ shape, {
											depth: 0.1,
											bevelEnabled: false,
											steps: 1
										} ] }
									/>
									<meshBasicMaterial
										color={ svgButtonData.paths[ index ].color }
										transparent
									/>
								</mesh> ) )
							}
						</mesh>
					</Center>
				</group>
				<Cursor scale={ 1 }/>
				<Oumuamua begginingToEndPosition={ 53 }/>
			</Suspense>
		</Physics>
	</> )
}

export default function DesignIsMotion() {
	return ( <Canvas id='canvas' orthographic camera={ { zoom: 90, near: -20 } } dpr={ 1 }>
		<ambientLight/>
		<Scene/>
	</Canvas> )
}