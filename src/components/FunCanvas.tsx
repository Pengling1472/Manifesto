import { useEffect, useRef } from 'react'
import { Shape, Circle, Square } from '../models/FunCanvas.models'
import { Node } from '../models/Node.models.tsx'

export default function FunCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>( null )
	const requestRef = useRef<number>( 0 )
	
	const delta = useRef<number>( 0 )
	const lastTime = useRef<number>( 0 )
	
	const components = useRef<Node[]>( [] )
	const draggingComponent = useRef<Shape>( null )
	
	const loop = ( timestamp: number ) => {
		const canvas = canvasRef.current
		
		if ( !canvas ) return
		
		const ctx = canvas.getContext( "2d" ) as CanvasRenderingContext2D
		
		delta.current = timestamp - lastTime.current
		lastTime.current = timestamp
		
		requestRef.current = requestAnimationFrame( loop )
		
		window.addEventListener( "pointerdown", event => {
			const rect = canvas.getBoundingClientRect()
			
			const x = ( event.clientX - rect.left ) * canvas.width / rect.width
			const y = ( event.clientY - rect.top ) * canvas.height / rect.height
			
			if ( x > 0 && x < canvas.width && y > 0 && y < canvas.height ) {
				for ( const component of components.current ) {
					if ( component instanceof Shape ) {
						if ( draggingComponent.current ) return
						if ( component.pressed( x, y ) ) draggingComponent.current = component
					}
				}
			}
		} )
		
		window.addEventListener( "pointermove", event => {
			const rect = canvas.getBoundingClientRect()
			
			const x = ( event.clientX - rect.left ) * canvas.width / rect.width
			const y = ( event.clientY - rect.top ) * canvas.height / rect.height
			
			if ( draggingComponent.current ) return draggingComponent.current.setVelocity( x, y )
		} )
		
		window.addEventListener( "pointerup", _ => {
			draggingComponent.current = null
		} )
		
		ctx.clearRect( 0, 0, canvas.width, canvas.height )
		
		for ( const component of components.current ) component.process( canvas, ctx, delta.current, components.current )
	}
	
	useEffect( () => {
		const canvas = canvasRef.current
		
		if ( !canvas ) return
		
		// const ctx = canvas.getContext( "2d" ) as CanvasRenderingContext2D
		
		components.current = []
		
		canvas.width = 1920
		canvas.height = 1080
		
		components.current.push( new Circle( canvas.width / 2, canvas.height / 2, "Rhythym" ) )
		components.current.push( new Square( canvas.width / 6, canvas.height / 2, "Making Changes" ) )
		
		requestRef.current = requestAnimationFrame( () => loop( lastTime.current ) )
		
		return () => {
			if ( requestRef.current ) cancelAnimationFrame( requestRef.current )
		}
	} )
	
	return (
		<canvas ref={ canvasRef } className='fun-canvas'></canvas>
	)
}