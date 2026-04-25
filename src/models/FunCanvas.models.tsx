import { Node } from "./Node.models.tsx"

export enum ShapeType {
	Circle,
	Square,
	Triangle,
}

function Collide( x1: number, y1: number, dx1: number, dy1: number, x2: number, y2: number, dx2: number, dy2: number ) {
	let nx: number = x2 - x1
	let ny: number = y2 - y1
	let vx: number = dx1 - dx2
	let vy: number = dy1 - dy2
	
	let k: number = ( vx * nx + vy * ny ) / ( Math.pow( nx, 2 ) + Math.pow( ny, 2 ) )
	
	let fx1 = dx1 - k * nx
	let fy1 = dy1 - k * ny
	let fx2 = dx2 - k * nx
	let fy2 = dy2 - k * ny
	
	return [ fx1, fy1, fx2, fy2 ]
}

export class Shape extends Node {
	type: ShapeType
	text: string
	targetX: number
	targetY: number 
	constructor( x: number, y: number, type: ShapeType, text: string ) {
		super( x, y )

		this.type = type
		this.text = text
		this.targetX = x
		this.targetY = y
	}
	pressed( _x: number, _y: number ): boolean { return false }
	setVelocity( x: number, y: number ): void {
		this.targetX = x
		this.targetY = y
	}
}

export class Circle extends Shape {
	dx: number
	dy: number
	constructor( x: number, y: number, text: string ) {
		super( x, y, ShapeType.Circle, text )
		
		this.dx = 0
		this.dy = 0
	}
	override draw( ctx: CanvasRenderingContext2D ) {
		ctx.fillStyle = "#fff"
		
		ctx.beginPath()
		ctx.arc( this.x, this.y, 100, 0, 2 * Math.PI )
		ctx.fill()

		ctx.font = "30px telegraf-bold"
		
		ctx.fillStyle = "#111"
		ctx.textBaseline = "middle"
		ctx.textAlign = "center"
		
		const texts = this.text.split( "/" )
		const gap = 45

		for ( let i = 0; i < texts.length; i++ ) {
			ctx.fillText( texts[ i ], this.x, this.y + i * gap - gap * ( texts.length - 1 ) / 2 )
		}
	}
	override process( canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, delta: number, nodes: Node[] ) {
		this.x
		this.y
		this.dx
		this.dy
		
		if ( ( Math.sqrt( Math.pow( this.targetX - this.x, 2 ) + Math.pow( this.targetY - this.y, 2 ) ) ) > 0.5 ) {
			let dx = ( this.targetX - this.x ) / 100
			let dy = ( this.targetY - this.y ) / 100
			
			this.x += dx * delta
			this.y += dy * delta
		}

		this.draw( ctx )
	}
	override pressed( x: number, y: number ) {
		return ( Math.sqrt( Math.pow( x - this.x, 2 ) + Math.pow( y - this.y, 2 ) ) ) <= 100
	}
}

export class Square extends Shape {
	constructor( x: number, y: number, text: string ) {
		super( x, y, ShapeType.Square, text )
	}
	override draw( ctx: CanvasRenderingContext2D ) {
		ctx.fillStyle = "#ffffff"
		
		ctx.fillRect( this.x - 100, this.y - 100, 200, 200 )

		ctx.font = "30px telegraf-bold"

		ctx.fillStyle = "#111"
		ctx.textBaseline = "middle"
		ctx.textAlign = "center"

		const texts = this.text.split( "/" )
		const gap = 45

		for ( let i = 0; i < texts.length; i++ ) {
			ctx.fillText( texts[ i ], this.x, this.y + i * gap - gap * ( texts.length - 1 ) / 2 )
		}
	}
	override process( canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, delta: number, nodes: Node[] ) {
		if ( ( Math.sqrt( Math.pow( this.targetX - this.x, 2 ) + Math.pow( this.targetY - this.y, 2 ) ) ) > 0.5 ) {
			let dx = ( this.targetX - this.x ) / 100
			let dy = ( this.targetY - this.y ) / 100
			
			this.x += dx * delta
			this.y += dy * delta
		}

		this.draw( ctx )
	}
	override pressed( x: number, y: number ) {
		return x > this.x - 100 && x < this.x + 100 && y > this.y - 100 && y < this.y + 100
	}
}

export class Triangle extends Shape {
	constructor( x: number, y: number, text: string ) {
		super( x, y, ShapeType.Triangle, text )
	}
	override draw( ctx: CanvasRenderingContext2D ) {
		ctx.fillStyle = "#ffffff"
		
		ctx.beginPath()
		ctx.moveTo( this.x, this.y - 250 / 2 )
		ctx.lineTo( this.x + 250 / 2, this.y + 150 / 2 )
		ctx.lineTo( this.x - 250 / 2, this.y + 150 / 2 )
		ctx.closePath()

		ctx.fill()

		ctx.font = "30px telegraf-bold"

		ctx.fillStyle = "#111"
		ctx.textBaseline = "middle"
		ctx.textAlign = "center"

		const texts = this.text.split( "/" )
		const gap = 45

		for ( let i = 0; i < texts.length; i++ ) {
			ctx.fillText( texts[ i ], this.x, this.y + i * gap - gap * ( texts.length - 1 ) / 2 )
		}
	}
	override process( canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, delta: number, nodes: Node[] ) {
		if ( ( Math.sqrt( Math.pow( this.targetX - this.x, 2 ) + Math.pow( this.targetY - this.y, 2 ) ) ) > 0.5 ) {
			let dx = ( this.targetX - this.x ) / 100
			let dy = ( this.targetY - this.y ) / 100
			
			this.x += dx * delta
			this.y += dy * delta
		}

		this.draw( ctx )
	}
	override pressed( x: number, y: number ) {
		return x > this.x - 100 && x < this.x + 100 && y > this.y - 100 && y < this.y + 100
	}
}