import { useEffect, useRef } from 'react'
import { Shape, Circle, Square, Triangle } from '../models/FunCanvas.models'
import { Node } from '../models/Node.models.tsx'

import Matter, { MouseConstraint, Render } from 'matter-js'

export default function FunCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>( null )
	const engineRef = useRef<Matter.Engine>( Matter.Engine.create() )
	const requestRef = useRef<number>( 0 )

	const eventsRef = useRef<Matter.Events[]>( [] )
	
	const delta = useRef<number>( 0 )
	const lastTime = useRef<number>( 0 )
	
	const bodyRef = useRef<Node>( null )
	const components = useRef<Node[]>( [] )
	
	const tick = ( timestamp: number ) => {
		const canvas = canvasRef.current
		
		if ( !canvas ) return
		
		const ctx = canvas.getContext( "2d" ) as CanvasRenderingContext2D
		
		delta.current = timestamp - lastTime.current
		lastTime.current = timestamp
		
		requestRef.current = requestAnimationFrame( tick )

		Matter.Engine.update( engineRef.current )
		
		ctx.clearRect( 0, 0, canvas.width, canvas.height )
		
		for ( const component of components.current ) component.process( canvas, ctx, delta.current, components.current )
	}
	
	useEffect( () => {
		const canvas = canvasRef.current
		
		if ( !canvas ) return

		const engine = engineRef.current

		Matter.Composite.clear( engine.world, false )

		const render = Render.create( {
			element: document.body,
			engine: engine,
			canvas: canvas
		} )
		const canvasMouse = Matter.Mouse.create( render.canvas )
		const canvasMouseConstraint = MouseConstraint.create( engine, {
			mouse: canvasMouse,
			constraint: {
				stiffness: 0,
				// damping: 0.8,
				render: {
					visible: true
				}
			}
		} )
		
		Matter.World.add( engine.world, canvasMouseConstraint )
		
		render.mouse = canvasMouse

		Render.run( render )

		components.current = []
		
		canvas.width = 1920
		canvas.height = 1080

		engine.gravity.scale = 0
		
		Matter.World.add( engine.world, Matter.Bodies.rectangle( canvas.width/2, -100, canvas.width + 200, 200, { isStatic: true } ) )
		Matter.World.add( engine.world, Matter.Bodies.rectangle( -100, canvas.height/2, 200, canvas.height + 200, { isStatic: true } ) )
		Matter.World.add( engine.world, Matter.Bodies.rectangle( canvas.width + 100, canvas.height/2, 200, canvas.height + 200, { isStatic: true } ) )
		Matter.World.add( engine.world, Matter.Bodies.rectangle( canvas.width/2, canvas.height + 100, canvas.width + 200, 200, { isStatic: true } ) )
		
		components.current.push( new Circle( canvas.width * 0.25, canvas.height * 0.25, "Rhythym", engine ) )
		components.current.push( new Circle( canvas.width * 0.5, canvas.height * 0.25, "Diversity", engine ) )
		components.current.push( new Circle( canvas.width * 0.75, canvas.height * 0.25, "Surpises", engine ) )

		components.current.push( new Square( canvas.width * 0.25, canvas.height * 0.5, "Making/Changes", engine ) )
		components.current.push( new Square( canvas.width * 0.5, canvas.height * 0.5, "Bringing/it to life", engine ) )
		components.current.push( new Square( canvas.width * 0.75, canvas.height * 0.5, "Outside/of the grid", engine ) )

		components.current.push( new Triangle( canvas.width * 0.25, canvas.height * 0.75, "Fluid", engine ) )
		components.current.push( new Triangle( canvas.width * 0.5, canvas.height * 0.75, "Fearless", engine ) )
		components.current.push( new Triangle( canvas.width * 0.75, canvas.height * 0.75, "Colla-/borative", engine ) )
		
		requestRef.current = requestAnimationFrame( () => tick( lastTime.current ) )

		if ( eventsRef.current.length == 0 ) {
			eventsRef.current.push( Matter.Events.on( canvasMouseConstraint, 'startdrag', event => {
				if ( bodyRef.current ) return 

				const index = components.current.findIndex( component => {
					if ( component instanceof Shape ) return component.body == event.source.body
				} )

				if ( index >= 0 ) {
					bodyRef.current = components.current[ index ]

					const node = components.current.splice( index, 1 )[ 0 ]

					if ( node instanceof Shape ) {
						node.body.isSensor = true
						node.dragged = true
					}
	
					components.current.push( node )
				}
			} ) )
	
			eventsRef.current.push( Matter.Events.on( canvasMouseConstraint, 'enddrag', () => {
				if ( bodyRef.current ) {
					if ( bodyRef.current instanceof Shape ) {
						bodyRef.current.body.isSensor = false
						bodyRef.current.dragged = false
					}
					bodyRef.current = null
				}
			} ) )
	
			eventsRef.current.push( Matter.Events.on( engine, 'beforeUpdate', () => {
				if ( bodyRef.current && bodyRef.current instanceof Shape ) {
					const body = bodyRef.current.body
					const position = bodyRef.current.body.position
					const mouseX = canvasMouseConstraint.mouse.position.x
					const mouseY = canvasMouseConstraint.mouse.position.y

					const dx = mouseX - position.x
					const dy = mouseY - position.y

					Matter.Body.setVelocity( body, { x: dx * 0.05, y: dy * 0.05 });
				}
			} ) )
		}

		
		return () => {
			if ( requestRef.current ) cancelAnimationFrame( requestRef.current )
		}
	} )
	
	return (
		<canvas ref={ canvasRef } className='fun-canvas'></canvas>
	)
}