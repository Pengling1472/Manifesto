import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'	
import { Text, type TextProps } from "@react-three/drei" 
import { CuboidCollider, Physics, RapierRigidBody, RigidBody } from '@react-three/rapier'

import telegraphRegular from "../assets/fonts/Telegraf_Regular.otf"
import telegraphBold from "../assets/fonts/Telegraf_Bold.otf"

import fragment from "../shaders/Fragment.tsx"
import vertex from "../shaders/Vertex.tsx"
import type { ShaderMaterial } from 'three'

import * as THREE from "three"

interface shapeProps {
	id: number
	text: string
	position: { x: number, y: number }
	rotation: number
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

function Shape( { id, text, position, rotation }: shapeProps ) {
	const rigidBodyRef = useRef<RapierRigidBody>( null )
	const meshRef = useRef<THREE.Mesh>( null )
	const textRef = useRef<TextProps>( null )
	const materialRef = useRef<ShaderMaterial>( null )
	const isDraggingRef = useRef( false )

	useFrame( ( { mouse, viewport, clock } ) => {
		const time = clock.getElapsedTime()

		if ( meshRef.current && textRef.current ) {
			const targetScale = isDraggingRef.current ? 3.5 : 3 

			meshRef.current.scale.lerp(
				new THREE.Vector3( targetScale, targetScale, targetScale ),
				0.05
			)
		}
		if ( materialRef.current ) materialRef.current.uniforms.uTime.value = time
		if ( rigidBodyRef.current && isDraggingRef.current ) {
			const targetX = ( mouse.x * viewport.width ) / 2
			const targetY = ( mouse.y * viewport.height ) / 2

			const position = rigidBodyRef.current.translation()

			const dx = ( targetX - position.x ) * 4
			const dy = ( targetY - position.y ) * 4
			
			rigidBodyRef.current.setLinvel( { x: dx, y: dy, z: 0 }, true )
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

	return (
		<RigidBody
			ref={ rigidBodyRef }
			enabledTranslations={ [ true, true, false ] }
			enabledRotations={ [ false, false, true ] }
			linearDamping={ 3 }
			angularDamping={ 2 }
			position={ [ position.x, position.y, -2 ] }
			rotation={ [ 0, 0, rotation ] }
			colliders="hull">
			<Text
				ref={ textRef }
				position={ [ 0, 0, 3.5 ] }
				font={ telegraphBold }
				fontSize={ 0.75 }
				textAlign='center'>
				{ text.replace( /\\n/g, '\n' ) }
			</Text>
			<mesh
				ref={ meshRef }
				scale={ 3 }
				onPointerDown={ () => {
					isDraggingRef.current = true
				} }>
				{ id == 0 ?
					<shapeGeometry args={ [ square ] }/> :
					id == 1 ? <shapeGeometry args={ [ circle ] }/> :
					<shapeGeometry args={ [ triangle ] }/>
				}
				<shaderMaterial
					ref={ materialRef }
					vertexShader={ vertex }
					fragmentShader={ fragment }
					uniforms={ { uTime: { value: 0 }, id: { value: id } } }
				/>
				<extrudeGeometry args={ [ id == 0 ?
					square :
					id == 1 ? circle :
					triangle, { depth: 1, bevelEnabled: false } ] }/>
			</mesh>
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

export default function Home() {
	return ( <>
		{/* <canvas ref={ canvasRef } className='fun-canvas'></canvas> */}
		<Canvas orthographic camera={ { zoom: 35 } }>
			{/* <OrbitControls/> */}
			{/* <ambientLight intensity={ 10 }/>	 */}
			<Physics gravity={ [ 0, 0, 0 ] }>
				<Border/>
				<Shape id={ 0 } text="Bringing\nit to Life" position={ { x: -18, y: -4.3 } } rotation={ 0 }/>
				<Shape id={ 1 } text="Rhythm" position={ { x: -8.9, y: 1.36 } } rotation={ Math.PI / 180 * 15 }/>
				<Shape id={ 2 } text="Fluid" position={ { x: -14, y: 7.1 } } rotation={ Math.PI / 180 * 45 }/>
				<Shape id={ 0 } text="Making\nChanges" position={ { x: 0.03, y: 5.9 } } rotation={ Math.PI / 180 * 15 }/>
				<Shape id={ 1 } text="Diversity" position={ { x: 5.3, y: -2.6 } } rotation={ 0 }/>
				<Shape id={ 2 } text="Colla-\nborative" position={ { x: -3.16, y: -5.43 } } rotation={ Math.PI / 180 * -35 }/>
				<Shape id={ 0 } text="Outside\nof the Grid" position={ { x: 14.7, y: -3.3 } } rotation={ Math.PI / 180 * 15 }/>
				<Shape id={ 1 } text="Surprises" position={ { x: 17, y: 5.43 } } rotation={ Math.PI / 180 * -25 }/>
				<Shape id={ 2 } text="Fearless" position={ { x: 9.29, y: 8.6 } } rotation={ Math.PI / 180 * -50 }/>
			</Physics>
			<Text
				position={ [ 0, -12, 4 ] }
				font={ telegraphRegular }
				fontSize={ 1.75 }
				textAlign='center'>
				As a [   ] designer, I create [   ] by [   ]
			</Text>
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