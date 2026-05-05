import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'	
import { Text } from "@react-three/drei" 
import { CuboidCollider, Physics, RapierRigidBody, RigidBody } from '@react-three/rapier'

import telegraphRegular from "../assets/fonts/Telegraf_Regular.otf"
import telegraphBold from "../assets/fonts/Telegraf_Bold.otf"

import { ShapeFragment, ShapeVertex } from "../shaders/Shape.tsx"
import type { ShaderMaterial } from 'three'

import * as THREE from "three"
import { useNavigate } from 'react-router-dom'

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

function Shape( { id, text, position, rotation, scale, onAction }: shapeProps ) {
	const rigidBodyRef = useRef<RapierRigidBody>( null )
	const materialRef = useRef<ShaderMaterial>( null )
	const meshRef = useRef<THREE.Mesh>( null )

	useFrame( ( { clock } ) => {
		if ( meshRef.current ) {
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
					textAlign='center'>
					{ text.replace( /\\n/g, '\n' ) }
				</Text>
				<mesh
					scale={ 3 }
					onPointerDown={ () => {
						if ( rigidBodyRef.current ) onAction( id, rigidBodyRef.current )
					} }
				>
					{ [
						<shapeGeometry args={ [ square ] }/>,
						<shapeGeometry args={ [ circle ] }/>,
						<shapeGeometry args={ [ triangle ] } />
					][ id % 3 ] }
					<shaderMaterial
						ref={ materialRef }
						vertexShader={ ShapeVertex() }
						fragmentShader={ ShapeFragment() }
						uniforms={ { uTime: { value: 0 }, id: { value: id % 3 } } }
					/>
					<extrudeGeometry
						args={
							[ [ square, circle, triangle ][ id % 3 ], { depth: 1, bevelEnabled: false } ]
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

interface WrapperProps {}

function Wrapper( { children }: React.PropsWithChildren<WrapperProps> ) {
	// const { viewport } = useThree()

	// const scale = viewport.width / 55

	return ( <>
		<group>
			{ children }
		</group>
	</> )
}

function Scene() {
	const promptCoordinates = useRef<number[][]>( [ [ -11.35, -12 ], [ 7.9, -12 ], [ 15.2, -12 ] ] )
	const selectedNode = useRef<RapierRigidBody>( null )
	const isDragging = useRef<boolean>( false )
	const nodeID = useRef<number>( 0 )
	const navigate = useNavigate()
	const [ promptNodes, setPromptNodes ] = useState<( { id: number, node: RapierRigidBody } | null )[]>( [ null, null, null ] )
	const [ shapes, setShapes ] = useState<shapeDataStructure[]>( [
		{ id: 0, type: PMCTypes.Motion,    text: "Bringing\nit to Life", position: { x: -18,   y: -3.3  }, rotation: 0  , scale: 1, isDragging: false },
		{ id: 1, type: PMCTypes.Motion,    text: "Rhythm",               position: { x: -8.9,  y: 2.36  }, rotation: 15 , scale: 1, isDragging: false },
		{ id: 2, type: PMCTypes.Motion,    text: "Fluid",                position: { x: -14,   y: 8.1   }, rotation: 45 , scale: 1, isDragging: false },
		{ id: 3, type: PMCTypes.Community, text: "Making\nChanges",      position: { x: 0.03,  y: 6.9   }, rotation: 15 , scale: 1, isDragging: false },
		{ id: 4, type: PMCTypes.Community, text: "Diversity",            position: { x: 5.3,   y: -1.6  }, rotation: 0  , scale: 1, isDragging: false },
		{ id: 5, type: PMCTypes.Community, text: "Colla-\nborative",     position: { x: -3.16, y: -4.43 }, rotation: -35, scale: 1, isDragging: false },
		{ id: 6, type: PMCTypes.Play,      text: "Outside\nof the Grid", position: { x: 14.7,  y: -2.3  }, rotation: 15 , scale: 1, isDragging: false },
		{ id: 7, type: PMCTypes.Play,      text: "Surprises",            position: { x: 17,    y: 6.43  }, rotation: -25, scale: 1, isDragging: false },
		{ id: 8, type: PMCTypes.Play,      text: "Fearless",             position: { x: 9.29,  y: 9.6   }, rotation: -50, scale: 1, isDragging: false }
	] )

	const redirect = () => {
		let choices = [ 0, 0, 0 ]

		for ( const item of promptNodes ) if ( item ) {
			const { id } = item

			choices[ shapes[ id ].type ]++
		}

		const [ play, motion, community ] = choices

		console.log( play, motion, community )

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

			setShapes( current => {
				const newShapes = [ ...current ]

				newShapes[ id ].scale = 1.1
				newShapes[ id ].isDragging = true
				
				return newShapes
			} )
		}
	}

	const handlePointerUp = () => {
		if ( selectedNode.current ) {
			const position = selectedNode.current.translation()

			for ( const [ index, [ x2, y2 ] ] of promptCoordinates.current.entries() ) {
				if ( promptNodes[ index ] != null ) continue

				const distance = Math.sqrt( ( x2 - position.x ) ** 2 + ( y2 - position.y ) ** 2 )
				const node = selectedNode.current

				if ( distance < 3 ) {
					setPromptNodes( current => {
						const newPromptNodes = [ ...current ]
						
						newPromptNodes[ index ] = { id: nodeID.current, node }
						shapes[ nodeID.current ].scale = 0.5

						if ( newPromptNodes.every( node => node != null ) ) redirect()

						return newPromptNodes
					} )
					setShapes( current => {
						const newShapes = [ ...current ]

						newShapes[ nodeID.current ].rotation = 0
						newShapes[ nodeID.current ].scale = 0.5
						newShapes[ nodeID.current ].isDragging = false

						return newShapes
					} )

					selectedNode.current.setTranslation( { x: position.x, y: position.y, z: -10 }, true )

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

	useFrame( ( { mouse, viewport } ) => {
		for ( const [ index, item ] of promptNodes.entries() ) {
			if ( item && shapes[ item.id ].isDragging ) promptNodes[ index ] = null 
			if ( item && !shapes[ item.id ].isDragging ) {
				const [ targetX, targetY ] = promptCoordinates.current[ index ]
				const { node } = item

				const position = node.translation()

				const dx = ( targetX - position.x ) * 4
				const dy = ( targetY - position.y ) * 4

				node.setLinvel( { x: dx, y: dy, z: 0 }, true )
				node.setRotation( { x: 0, y: 0, z: 0, w: 0 }, true )
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
		window.addEventListener( "pointerup", handlePointerUp )

		return () => window.removeEventListener( "pointerup", handlePointerUp )
	}, [ handlePointerUp ] )

	return ( <>
		<Physics gravity={ [ 0, 0, 0 ] }>
			<Border/>
			<Wrapper>
				<Suspense fallback={ null }>
					{ shapes.map( shape =>
						<Shape 
							id={ shape.id }
							text={ shape.text }
							position={ shape.position }
							rotation={ Math.PI / 180 * shape.rotation }
							scale={ shape.scale }
							isDragging={ shape.isDragging }
							onAction={ onPointerDown }
						/>
					) }
					{/* <mesh
						position={ [ -11.30, -12.25, -6 ] }
						scale={ 1 }>
						<shapeGeometry args={ [ triangle ] }/>
						<shaderMaterial
							vertexShader={ ShapeVertex() }
							fragmentShader={ ShapeFragment() }
							uniforms={ { uTime: { value: 0 }, id: { value: 2 } } }
						/>
						<extrudeGeometry args={ [ triangle, { depth: 1, bevelEnabled: false } ] }/>
					</mesh> */}
					<Text
						position={ [ 0, -12, -3 ] }
						font={ telegraphRegular }
						fontSize={ 1.75 }
						textAlign='center'>
						As a [       ] designer, I create [       ] by [       ]
					</Text>
					<Text
						position={ [ 0, -14, -3 ] }
						font={ telegraphRegular }
						fontSize={ 0.75 }
						textAlign='center'>
						P.S: You can't have them all
					</Text>
				</Suspense>
			</Wrapper>
		</Physics>
	</> )
}

export default function Home() {
	return ( <>
		<Canvas
			id='canvas'
			orthographic
			camera={ { zoom: 35, near: -20 } } >
			{/* <ambientLight intensity={ 10 }/> */}
			{/* <OrbitControls/> */}
			{/* <gridHelper args={ [ 40, 20 ] } rotation-x={ Math.PI / 2 }/> */}
			<Scene/>
			{/* <mesh
				position={ [ 15.2, -12, 0 ] }
			>
				<boxGeometry args={ [ 1, 1, 1 ] }/>
			</mesh> */}
		</Canvas>
	</> )
}


// import { Shape, Circle, Square, Triangle } from '../models/FunCanvas.models'
// import { Node } from '../models/Node.models.tsx'

// import Matter, { MouseConstraint, Render } from 'matter-js'


	// const canvasRef = useRef<HTMLCanvasElement>( null )
	// const engineRef = useRef<Matter.Engine>( Matter.Engine.create() )
	// const requestRef = useRef<number>( 0 )

	// const eventsRef = useRef<Matter.Events[]>( [] )
	
	// const delta = useRef<number>( 0 )
	// const lastTime = useRef<number>( 0 )
	
	// const bodyRef = useRef<Node>( null )
	// const components = useRef<Node[]>( [] )
	
	// const tick = ( timestamp: number ) => {
	// 	const canvas = canvasRef.current
		
	// 	if ( !canvas ) return
		
	// 	const ctx = canvas.getContext( "2d" ) as CanvasRenderingContext2D
		
	// 	delta.current = timestamp - lastTime.current
	// 	lastTime.current = timestamp
		
	// 	requestRef.current = requestAnimationFrame( tick )

	// 	Matter.Engine.update( engineRef.current )
		
	// 	ctx.clearRect( 0, 0, canvas.width, canvas.height )
		
	// 	for ( const component of components.current ) component.process( canvas, ctx, delta.current, components.current )
	// }
	
	// useEffect( () => {
	// 	const canvas = canvasRef.current
		
	// 	if ( !canvas ) return

	// 	renderer.current.render( scene, camera )

	// 	const engine = engineRef.current

	// 	Matter.Composite.clear( engine.world, false )

	// 	const render = Render.create( {
	// 		element: document.body,
	// 		engine: engine,
	// 		canvas: canvas
	// 	} )
	// 	const canvasMouse = Matter.Mouse.create( render.canvas )
	// 	const canvasMouseConstraint = MouseConstraint.create( engine, {
	// 		mouse: canvasMouse,
	// 		constraint: {
	// 			stiffness: 0,
	// 			// damping: 0.8,
	// 			render: {
	// 				visible: true
	// 			}
	// 		}
	// 	} )
		
	// 	Matter.World.add( engine.world, canvasMouseConstraint )
		
	// 	render.mouse = canvasMouse

	// 	Render.run( render )

	// 	components.current = []
		
	// 	// canvas.width = 1920
	// 	// canvas.height = 1080

	// 	engine.gravity.scale = 0
		
	// 	Matter.World.add( engine.world, Matter.Bodies.rectangle( canvas.width/2, -100, canvas.width + 200, 200, { isStatic: true } ) )
	// 	Matter.World.add( engine.world, Matter.Bodies.rectangle( -100, canvas.height/2, 200, canvas.height + 200, { isStatic: true } ) )
	// 	Matter.World.add( engine.world, Matter.Bodies.rectangle( canvas.width + 100, canvas.height/2, 200, canvas.height + 200, { isStatic: true } ) )
	// 	Matter.World.add( engine.world, Matter.Bodies.rectangle( canvas.width/2, canvas.height + 100, canvas.width + 200, 200, { isStatic: true } ) )
		
	// 	components.current.push( new Circle( canvas.width * 0.25, canvas.height * 0.25, "Rhythym", engine ) )
	// 	components.current.push( new Circle( canvas.width * 0.5, canvas.height * 0.25, "Diversity", engine ) )
	// 	components.current.push( new Circle( canvas.width * 0.75, canvas.height * 0.25, "Surpises", engine ) )

	// 	components.current.push( new Square( canvas.width * 0.25, canvas.height * 0.5, "Making/Changes", engine ) )
	// 	// components.current.push( new Square( canvas.width * 0.5, canvas.height * 0.5, "Bringing/it to life", engine ) )
	// 	// components.current.push( new Square( canvas.width * 0.75, canvas.height * 0.5, "Outside/of the grid", engine ) )

	// 	components.current.push( new Triangle( canvas.width * 0.25, canvas.height * 0.75, "Fluid", engine ) )
	// 	components.current.push( new Triangle( canvas.width * 0.5, canvas.height * 0.75, "Fearless", engine ) )
	// 	components.current.push( new Triangle( canvas.width * 0.75, canvas.height * 0.75, "Colla-/borative", engine ) )
		
	// 	requestRef.current = requestAnimationFrame( () => tick( lastTime.current ) )

	// 	if ( eventsRef.current.length == 0 ) {
	// 		// setTimeout(() => {
	// 		// 	components.current.push( new Test( canvas.width * 0.75, canvas.height * 0.75, engine ) )
	// 		// }, 100 );


	// 		eventsRef.current.push( Matter.Events.on( canvasMouseConstraint, 'startdrag', event => {
	// 			if ( bodyRef.current ) return 

	// 			const index = components.current.findIndex( component => {
	// 				if ( component instanceof Shape ) return component.body == event.source.body
	// 			} )

	// 			if ( index >= 0 ) {
	// 				bodyRef.current = components.current[ index ]

	// 				const node = components.current.splice( index, 1 )[ 0 ]

	// 				if ( node instanceof Shape ) {
	// 					node.body.isSensor = true
	// 					node.dragged = true
	// 				}
	
	// 				components.current.push( node )
	// 			}
	// 		} ) )
	
	// 		eventsRef.current.push( Matter.Events.on( canvasMouseConstraint, 'enddrag', () => {
	// 			if ( bodyRef.current ) {
	// 				if ( bodyRef.current instanceof Shape ) {
	// 					bodyRef.current.body.isSensor = false
	// 					bodyRef.current.dragged = false
	// 				}
	// 				bodyRef.current = null
	// 			}
	// 		} ) )
	
	// 		eventsRef.current.push( Matter.Events.on( engine, 'beforeUpdate', () => {
	// 			if ( bodyRef.current && bodyRef.current instanceof Shape ) {
	// 				const body = bodyRef.current.body
	// 				const position = bodyRef.current.body.position
	// 				const mouseX = canvasMouseConstraint.mouse.position.x
	// 				const mouseY = canvasMouseConstraint.mouse.position.y

	// 				const dx = mouseX - position.x
	// 				const dy = mouseY - position.y

	// 				Matter.Body.setVelocity( body, { x: dx * 0.05, y: dy * 0.05 });
	// 			}
	// 		} ) )
	// 	}

		
	// 	return () => {
	// 		if ( requestRef.current ) cancelAnimationFrame( requestRef.current )
	// 	}
	// } )