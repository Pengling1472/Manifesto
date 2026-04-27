import { Node } from "./Node.models.tsx"
import Perlin from "./perlin.tsx"

import Matter from "matter-js"

export enum ShapeType {
	Circle,
	Square,
	Triangle,
}

const noise = new Perlin( 1 )

const rgb = ( r: number, g: number, b: number ) => {
	return `rgb( ${r}, ${g}, ${b} )`
}

const linearGradient = ( colors: [ r: number, g: number, b: number, d: number ][], value: number ) => {
	let rgb = [ 0, 0, 0 ]
	
	for ( let i = 1; i < colors.length; i++ ) {
		const c1 = colors[ i - 1 ]
		const c2 = colors[ i ]
		
		if ( value == c2[ 3 ] ) return c2.splice( 0, 3 )
		
		if ( c1[3] <= value && c2[3] > value ) {
			for ( let j = 0; j < 3; j++ ) {
				rgb[ j ] = ( ( c2[j] - c1[j] ) / ( c2[3] - c1[3] ) ) * ( value - c2[3] ) + c2[j]
			}
		}
	}
	
	return rgb
}

export class Shape extends Node {
	type: ShapeType
	text: string	
	targetX: number
	targetY: number 
	dx: number
	dy: number
	engine: Matter.Engine
	body: Matter.Body
	dragged: boolean
	scale: number
	constructor( x: number, y: number, type: ShapeType, text: string, engine: Matter.Engine ) {
		super( x, y )

		this.type = type
		this.text = text
		this.targetX = x
		this.targetY = y
		this.dx = 0
		this.dy = 0
		this.engine = engine
		this.dragged = false
		this.scale = 0
		this.body = Matter.Bodies.circle( this.x, this.y, 1 )
	}
	pressed( _x: number, _y: number ): boolean { return false }
	setVelocity( x: number, y: number ): void {
		this.targetX = x
		this.targetY = y
	}
}

export class Circle extends Shape {
	radius: number
	constructor( x: number, y: number, text: string, engine: Matter.Engine ) {
		super( x, y, ShapeType.Circle, text, engine )
		
		this.radius = 125
		this.body = Matter.Bodies.circle( this.x, this.y, this.radius )

		Matter.World.add( engine.world, this.body )
	}
	override draw( ctx: CanvasRenderingContext2D ) {
		const position = this.body.position
		const angle = this.body.angle

		ctx.save()

		ctx.translate( position.x, position.y )
		ctx.rotate( angle )
		ctx.scale( 1 + this.scale * 0.25, 1 + this.scale * 0.25 )
		ctx.translate( -position.x, -position.y )

		ctx.fillStyle = "#000"
		
		ctx.beginPath()
		ctx.arc( position.x, position.y, this.radius, 0, 2 * Math.PI )
		ctx.fill()

		ctx.font = "30px telegraf-bold"
		
		ctx.fillStyle = "#fff"
		ctx.textBaseline = "middle"
		ctx.textAlign = "center"
		
		const texts = this.text.split( "/" )
		const gap = 45

		for ( let i = 0; i < texts.length; i++ ) {
			ctx.fillText( texts[ i ], position.x, position.y + i * gap - gap * ( texts.length - 1 ) / 2 )
		}

		ctx.restore()
	}
	override process( canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, delta: number, nodes: Node[] ) {
		this.scale = Math.min( Math.max( ( this.dragged ? 0.01 : -0.01 ) * delta + this.scale, 0 ), 1 )

		this.draw( ctx )
	}
	override pressed( x: number, y: number ) {
		const position = this.body.position

		return ( Math.sqrt( Math.pow( x - position.x, 2 ) + Math.pow( y - position.y, 2 ) ) ) <= 100
	}
}

export class Square extends Shape {
	noiseIncrement: number
	width: number
	height: number
	constructor( x: number, y: number, text: string, engine: Matter.Engine ) {
		super( x, y, ShapeType.Square, text, engine )

		this.noiseIncrement = 0
		this.width = 250
		this.height = 250

		this.body = Matter.Bodies.rectangle( x, y, this.width, this.height )

		Matter.World.add( engine.world, this.body )
	}
	override draw( ctx: CanvasRenderingContext2D ) {
		const position = this.body.position
		const angle = this.body.angle

		ctx.save()
		ctx.translate( position.x, position.y )
		ctx.rotate( angle )
		ctx.scale( 1 + this.scale * 0.25, 1 + this.scale * 0.25 )
		ctx.translate( -position.x, -position.y )

		for ( let i = 0; i < this.width / 5; i++ ) {
			for ( let j = 0; j < this.height / 5; j++ ) {
				let noiseValue = Math.max( Math.min( noise.perlin3( i * 0.025, j * 0.015, this.noiseIncrement ) * 3, 1 ), 0 )
				let [ r, g, b ] = linearGradient( [ [ 209, 81, 36, 0 ], [ 39, 53, 60, 0.3 ], [ 39, 53, 60, 0.7 ], [ 244, 176, 42, 1 ] ], noiseValue )

				ctx.fillStyle = rgb( r, g, b )
				ctx.fillRect( position.x - this.width / 2 + i * 5, position.y - this.height / 2 + j * 5, 6, 6 )
			}
		}
		
		ctx.font = "30px telegraf-bold"

		ctx.fillStyle = "#fff"
		ctx.textBaseline = "middle"
		ctx.textAlign = "center"

		const texts = this.text.split( "/" )
		const gap = 45

		for ( let i = 0; i < texts.length; i++ ) {
			ctx.fillText( texts[ i ], position.x, position.y + i * gap - gap * ( texts.length - 1 ) / 2 )
		}
		ctx.restore()

	}
	override process( canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, delta: number, nodes: Node[] ) {
		this.noiseIncrement += 0.001
		this.scale = Math.min( Math.max( ( this.dragged ? 0.01 : -0.01 ) * delta + this.scale, 0 ), 1 )

		this.draw( ctx )
	}
}

export class Triangle extends Shape {
	width: number
	height: number
	constructor( x: number, y: number, text: string, engine: Matter.Engine ) {
		super( x, y, ShapeType.Triangle, text, engine )
		this.width = 250
		this.height = 250

		this.body = Matter.Bodies.fromVertices( x, y, [ [
			{ x: x, y: y - this.height / 1.5 },
			{ x: x + this.width / 1.5, y: y + this.height / 3 },
			{ x: x - this.width / 1.5, y: y + this.height / 3 }
		] ] )

		Matter.World.add( engine.world, this.body )
	}
	override draw( ctx: CanvasRenderingContext2D ) {
		const position = this.body.position
		const angle = this.body.angle

		ctx.fillStyle = "#000"

		ctx.save()
		
		ctx.translate( position.x, position.y )
		ctx.rotate( angle )
		ctx.scale( 1 + this.scale * 0.25, 1 + this.scale * 0.25 )
		ctx.translate( -position.x, -position.y )

		ctx.beginPath()
		ctx.moveTo( position.x, position.y - this.height / 1.5 )
		ctx.lineTo( position.x + this.width / 1.5, position.y + this.height / 3 )
		ctx.lineTo( position.x - this.width / 1.5, position.y + this.height / 3 )
		ctx.closePath()

		ctx.fill()

		ctx.font = "30px telegraf-bold"

		ctx.fillStyle = "#fff"
		ctx.textBaseline = "middle"
		ctx.textAlign = "center"

		const texts = this.text.split( "/" )
		const gap = 45

		for ( let i = 0; i < texts.length; i++ ) {
			ctx.fillText( texts[ i ], position.x, position.y + i * gap - gap * ( texts.length - 1 ) / 2 )
		}

		ctx.restore()

	}
	override process( canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, delta: number, nodes: Node[] ) {
		this.scale = Math.min( Math.max( ( this.dragged ? 0.01 : -0.01 ) * delta + this.scale, 0 ), 1 )

		this.draw( ctx )
	}
}