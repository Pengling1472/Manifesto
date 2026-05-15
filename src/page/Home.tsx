import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'	
import { Center, Text, useTexture } from "@react-three/drei" 
import { CuboidCollider, Physics, RapierRigidBody, RigidBody } from '@react-three/rapier'

import telegraphRegular from "../assets/fonts/Telegraf_Regular.otf"
import telegraphBold from "../assets/fonts/Telegraf_Bold.otf"

import { ShapeFragment, ShapeVertex } from "../shaders/Shape.tsx"
import type { ShaderMaterial } from 'three'

import * as THREE from "three"
import { useNavigate } from 'react-router-dom'

import background from "../assets/images/background.png"
import pointer from "../assets/images/pointer.png"
import cursor from "../assets/images/cursor.png"
import button from "../assets/svg/home-button.svg"
import { SVGLoader } from 'three/examples/jsm/Addons.js'

import courierPrimeBold from "../assets/fonts/CourierPrime-Bold.ttf"

enum PMCTypes {
	Play,
	Motion,
	Community
}

interface shapeDataStructure {
	id: number
	type: PMCTypes
	text: string
	position: { x: number, y: number }
	rotation: number
	scale: number
	isDragging: boolean
}

interface shapeProps {
	id: number
	text: string
	position: { x: number, y: number }
	rotation: number
	scale: number
	isDragging: boolean
	onAction: ( id: number, node: RapierRigidBody ) => void
}

interface cursorProps {
	scale?: number
}

const square = new THREE.Shape()
	.moveTo( 1, 1 )
	.lineTo( 1, -1 )
	.lineTo( -1, -1 )
	.lineTo( -1, 1 )
const triangle = new THREE.Shape()
	.moveTo( 0, 2 / 1.5 )
	.lineTo( 2 / 1.75, -2 / 3 )
	.lineTo( -2 / 1.75, -2 / 3 )
const circle = new THREE.Shape()
	.absarc( 0, 0, 1, 0, Math.PI * 2, false )

export function Cursor( { scale = 3 }: cursorProps ) {
	const materialRef = useRef<THREE.MeshBasicMaterial>( null )
	const cursorRef = useRef<THREE.Mesh>( null )
	const textures = useTexture( [ cursor, pointer ] )

	const onPointerUp = () => {
		if ( materialRef.current ) materialRef.current.map = textures[ 0 ]
	}
	const onPointerDown = () => {
		if ( materialRef.current ) materialRef.current.map = textures[ 1 ]
	}

	useFrame( ( { mouse, viewport } ) => {
		if ( cursorRef.current ) {
			const targetX = ( mouse.x * viewport.width ) / 2
			const targetY = ( mouse.y * viewport.height ) / 2

			cursorRef.current.position.set( targetX, targetY, 12 )
		}
	} )

	useEffect( () => {
		window.addEventListener( "pointerup", onPointerUp )
		window.addEventListener( "pointerdown", onPointerDown )

		textures.forEach( texture => {
			texture.colorSpace = THREE.SRGBColorSpace
			texture.needsUpdate = true
		} )

		return () => {
			window.removeEventListener( "pointerup", onPointerUp )
			window.removeEventListener( "pointerdown", onPointerDown )
		}
	}, [] )

	return ( <mesh ref={ cursorRef } scale={ scale }>
		<planeGeometry/>
		<meshBasicMaterial
			ref={ materialRef }
			map={ textures[ 0 ] }
			toneMapped={ false }
			transparent
		/>
	</mesh> )
}

function Shape( { id, text, position, rotation, scale, onAction }: shapeProps ) {
	const rigidBodyRef = useRef<RapierRigidBody>( null )
	const materialRef = useRef<ShaderMaterial>( null )
	const meshRef = useRef<THREE.Mesh>( null )

	useFrame( ( { clock } ) => {
		if ( meshRef.current && rigidBodyRef.current ) {
			meshRef.current.scale.lerp(
				new THREE.Vector3( scale, scale, 1 ),
				0.05
			)
		}
		if ( materialRef.current ) {
			const time = clock.getElapsedTime()

			materialRef.current.uniforms.uTime.value = time
		}
	} )

	return (
		<RigidBody
			ref={ rigidBodyRef }
			enabledTranslations={ [ true, true, false ] }
			enabledRotations={ [ false, false, true ] }
			linearDamping={ 3 }
			angularDamping={ 2 }
			position={ [ position.x, position.y, -3 ] }
			rotation={ [ 0, 0, rotation ] }
			colliders="hull"
		>
			<group
				ref={ meshRef }
			>
				<Text
					position={ [ 0, 0, 3 ] }
					font={ telegraphBold }
					fontSize={ 0.75 }
					textAlign='center'
					color={ "white" }
				>
					{ text.replace( /\\n/g, '\n' ) }
				</Text>
				<mesh
					scale={ 3 }
					onPointerDown={ () => {
						if ( rigidBodyRef.current ) onAction( id, rigidBodyRef.current )
					} }
				>
					{ [
						<shapeGeometry args={ [ triangle ] } />,
						<shapeGeometry args={ [ circle ] }/>,
						<shapeGeometry args={ [ square ] }/>
					][ id % 3 ] }
					<shaderMaterial
						ref={ materialRef }
						vertexShader={ ShapeVertex() }
						fragmentShader={ ShapeFragment() }
						uniforms={ { uTime: { value: 0 }, id: { value: id % 3 } } }
					/>
					<extrudeGeometry
						args={
							[ [ triangle, circle, square ][ id % 3 ], { depth: 1, bevelEnabled: false } ]
						}
					/>
				</mesh>
			</group>
		</RigidBody>
	)
}

function Border() {
	const { viewport } = useThree()

	return ( <>
		<RigidBody
			type='fixed'
			position={ [ 0, -viewport.height / 2 - 1, 0 ] }>
			<CuboidCollider args={ [ viewport.width / 2, 1, 10 ] }/>
		</RigidBody>
		<RigidBody
			type='fixed'
			position={ [ 0, viewport.height / 2 + 1, 0 ] }>
			<CuboidCollider args={ [ viewport.width / 2, 1, 10 ] }/>
		</RigidBody>
		<RigidBody
			type='fixed'
			position={ [ -viewport.width / 2 - 1, 0, 0 ] }>
			<CuboidCollider args={ [ 1, viewport.height / 2, 10 ] }/>
		</RigidBody>
		<RigidBody
			type='fixed'
			position={ [ viewport.width / 2 + 1, 0, 0 ] }>
			<CuboidCollider args={ [ 1, viewport.height / 2, 10 ] }/>
		</RigidBody>
	</> )
}

useTexture.preload( [ cursor, pointer, background ] )

function Scene() {
	const { viewport, camera } = useThree()
	const backgroundTexture = useTexture( background )

	const svgButtonData = useLoader( SVGLoader, button )
	const buttonShapes = useMemo( () => ( svgButtonData.paths.map( path => path.toShapes( true ) ) ), [ svgButtonData ] )

	const promptCoordinates = useRef<number[][]>( [ [ -11.68, -10 ], [ 7.67, -10 ], [ 14.95, -10 ] ] )
	const selectedNode = useRef<RapierRigidBody>( null )
	const isDragging = useRef<boolean>( false )
	const nodeID = useRef<number>( 0 )
	const promptNodes = useRef<( { id: number, node: RapierRigidBody } | null )[]>( [ null, null, null ] )
	const [ shapes, setShapes ] = useState<shapeDataStructure[]>( [
		{ id: 0, type: PMCTypes.Motion,    text: "Fluid",                position: { x: -14,   y: 8.1   }, rotation: 45 , scale: 1, isDragging: false },
		{ id: 1, type: PMCTypes.Motion,    text: "Rhythm",               position: { x: -8.9,  y: 2.36  }, rotation: 15 , scale: 1, isDragging: false },
		{ id: 2, type: PMCTypes.Motion,    text: "Bringing\nit to Life", position: { x: -18,   y: -3.3  }, rotation: 0  , scale: 1, isDragging: false },
		{ id: 3, type: PMCTypes.Community, text: "Colla-\nborative",     position: { x: -3.16, y: -4.43 }, rotation: -35, scale: 1, isDragging: false },
		{ id: 4, type: PMCTypes.Community, text: "Diversity",            position: { x: 5.3,   y: -1.6  }, rotation: 0  , scale: 1, isDragging: false },
		{ id: 5, type: PMCTypes.Community, text: "Making\nChanges",      position: { x: 0.03,  y: 6.9   }, rotation: 15 , scale: 1, isDragging: false },
		{ id: 6, type: PMCTypes.Play,      text: "Fearless",             position: { x: 9.29,  y: 9.6   }, rotation: -50, scale: 1, isDragging: false },
		{ id: 7, type: PMCTypes.Play,      text: "Surprises",            position: { x: 17,    y: 6.43  }, rotation: -25, scale: 1, isDragging: false },
		{ id: 8, type: PMCTypes.Play,      text: "Outside\nof the Grid", position: { x: 14.7,  y: -2.3  }, rotation: 15 , scale: 1, isDragging: false },
	] )

	const navigate = useNavigate()
	
	const redirect = () => {
		let choices = [ 0, 0, 0 ]

		for ( const item of promptNodes.current ) if ( item ) {
			const { id } = item

			choices[ shapes[ id ].type ]++
		}

		const [ play, motion, community ] = choices

		if ( play >= 1 ) return navigate( "/play" )
		if ( motion >= 1 ) return navigate( "/motion" )
		if ( community >= 1 ) return navigate( "/community" )

		const random = Math.random()
		
		navigate( random >= ( 1 / 3 ) ? "/play" : random >= ( 1 / 3 * 2 ) ? "/motion" : "community" )
	}

	const onPointerDown = ( id: number, node: RapierRigidBody ) => {
		if ( !isDragging.current ) {
			selectedNode.current = node
			isDragging.current = true
			nodeID.current = id
			
			selectedNode.current.setEnabledRotations( false, false, true, true )
			
			setShapes( current => {
				const newShapes = [ ...current ]

				newShapes[ id ].scale = 1.1
				newShapes[ id ].isDragging = true
				
				return newShapes
			} )
		}
	}

	const onPointerUp = () => {
		if ( selectedNode.current ) {
			const position = selectedNode.current.translation()

			for ( const [ index, [ x2, y2 ] ] of promptCoordinates.current.entries() ) {
				if ( promptNodes.current[ index ] != null || ( shapes[ nodeID.current ].id % 3 ) != index ) continue

				const distance = Math.sqrt( ( x2 - position.x ) ** 2 + ( y2 - position.y ) ** 2 )
				const node = selectedNode.current

				if ( distance < 3 ) {
					setShapes( current => {
						const newShapes = [ ...current ]

						newShapes[ nodeID.current ].scale = 0.5

						return newShapes
					} )

					promptNodes.current[ index ] = { id: nodeID.current, node }
					
					shapes[ nodeID.current ].isDragging = false

					node.setTranslation( { x: position.x, y: position.y, z: -10 }, true )
					node.setEnabledRotations( false, false, false, true )

					isDragging.current = false
					selectedNode.current = null

					return
				}
			}
			
			selectedNode.current.setTranslation( { x: position.x, y: position.y, z: -3 }, true )

			isDragging.current = false
			selectedNode.current = null

			setShapes( current => {
				const newShapes = [ ...current ]

				newShapes[ nodeID.current ].scale = 1
				newShapes[ nodeID.current ].isDragging = false

				return newShapes
			} )
		}
	}

	useFrame( ( { mouse }, delta ) => {
		for ( const [ index, item ] of promptNodes.current.entries() ) {
			if ( item && shapes[ item.id ].isDragging ) promptNodes.current[ index ] = null 
			if ( item && !shapes[ item.id ].isDragging ) {
				const [ targetX, targetY ] = promptCoordinates.current[ index ]
				const { node } = item

				const position = node.translation()
				const rotation = node.rotation()

				const dx = ( targetX - position.x ) * 4
				const dy = ( targetY - position.y ) * 4
				const dz = -rotation.z * delta * 4
				
				node.setLinvel( { x: dx, y: dy, z: 0 }, true )
				node.setRotation( { x: 0, y: 0, z: rotation.z + dz, w: 1 }, false )
			}
		}
		if ( selectedNode.current ) {
			const targetX = ( mouse.x * viewport.width ) / 2
			const targetY = ( mouse.y * viewport.height ) / 2

			const position = selectedNode.current.translation()

			const dx = ( targetX - position.x ) * 4
			const dy = ( targetY - position.y ) * 4
			
			selectedNode.current.setLinvel( { x: dx, y: dy, z: 0 }, true )
			selectedNode.current.setTranslation( { x: position.x, y: position.y, z: -2 }, true )	
		}
	} )

	useEffect( () => {
		window.addEventListener( "pointerup", onPointerUp )

		const listener = camera.children.find( child => child instanceof AudioListener )

		if ( listener ) camera.remove( listener )

		return () => window.removeEventListener( "pointerup", onPointerUp )
	}, [] )

	return ( <>
		<Physics gravity={ [ 0, 0, 0 ] }>
			<Border/>
			<Suspense fallback={ null }>
				{ shapes.map( shape =>
					<Shape 
						key={ shape.id }
						id={ shape.id }
						text={ shape.text }
						position={ shape.position }
						rotation={ Math.PI / 180 * shape.rotation }
						scale={ shape.scale }
						isDragging={ shape.isDragging }
						onAction={ onPointerDown }
					/>
				) }
				<mesh
					position={ [ -11.68, -10, -10 ] }
					scale={ 1.5 }>
					<shapeGeometry args={ [ triangle ] }/>
					<meshBasicMaterial color={ "#F7E0A8" }/>
					<extrudeGeometry args={ [ triangle, { depth: 0.1, bevelEnabled: false } ] }/>
				</mesh>
				<mesh	
					position={ [ 7.67, -10, -10 ] }
					scale={ 1.5 }>
					<shapeGeometry args={ [ triangle ] }/>
					<meshBasicMaterial color={ "#F7E0A8" }/>
					<extrudeGeometry args={ [ circle, { depth: 0.1, bevelEnabled: false } ] }/>
				</mesh>
				<mesh
					position={ [ 14.95, -10, -10 ] }
					scale={ 1.5 }>
					<shapeGeometry args={ [ triangle ] }/>
					<meshBasicMaterial color={ "#F7E0A8" }/>
					<extrudeGeometry args={ [ square, { depth: 0.1, bevelEnabled: false } ] }/>
				</mesh>
				<Text
					position={ [ 0, -10, -3 ] }
					font={ telegraphRegular }
					fontSize={ 1.75 }
					textAlign='center'
				>
					As a‎‎‎‎‎designer, I create‎‎‎‎‎by‎‎‎‎‎.
				</Text>
				<Text
					position={ [ 0, 14, -3 ] }
					font={ telegraphRegular }
					fontSize={ 0.5 }
					textAlign='center'
				>
					Presents to you from Marthin Villar, Livie Lam, Jenny Pham. 
				</Text>
				<group position={ [ 0, -13, -3 ] }>
					<Text
						position={ [ 0, 0, 0.1 ] }
						font={ courierPrimeBold }
						fontSize={ 0.7 }
						textAlign="center"
						color="black"
					>
						Create
					</Text>
					<Center scale={ [ 0.025, -0.025, 0.025 ] }>
						<mesh
							onPointerDown={ () => {
								if ( promptNodes.current.every( node => node != null ) ) redirect()
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
				<mesh position={ [ 0, 0, -10 ] }>
					<planeGeometry args={ [ viewport.width, viewport.height ] }/>
					<meshBasicMaterial map={ backgroundTexture } toneMapped={ false } onUpdate={ () => {
						backgroundTexture.colorSpace = THREE.SRGBColorSpace
						backgroundTexture.needsUpdate = true
					} }/>
				</mesh>
				<Cursor/>
			</Suspense>
		</Physics>
	</> )
}

export default function Home() {
	return ( <>
		<Canvas
			id='canvas'
			orthographic
			camera={ { zoom: 30, near: -20 } }
		>
			<Scene/>
		</Canvas>
	</> )
}