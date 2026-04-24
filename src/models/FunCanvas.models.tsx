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
	constructor( x: number, y: number, type: ShapeType, text: string ) {
		super( x, y )

		this.type = type
		this.text = text
	}
	pressed( _x: number, _y: number ): boolean { return false }
	setVelocity( x: number, y: number ): void {
		let dx = ( x - this.x ) / 3000
		let dy = ( y - this.y ) / 3000
		
		this.x += dx
		this.y += dy
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
		
		ctx.fillText( this.text, this.x, this.y )
	}
	override process( canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, delta: number, nodes: Node[] ) {
		this.x
		this.y
		this.dx
		this.dy
		
		this.draw( ctx )
	}
	override pressed( x: number, y: number ) {
		const distance = Math.sqrt( Math.pow( x - this.x, 2 ) + Math.pow( y - this.y, 2 ) )
		
		return distance <= 100
	}
}

export class Square extends Shape {
	dx: number
	dy: number
	constructor( x: number, y: number, text: string ) {
		super( x, y, ShapeType.Square, text )
		
		this.dx = 0
		this.dy = 0
	}
	override draw( ctx: CanvasRenderingContext2D ) {
		ctx.fillStyle = "#ffffff"
		
		ctx.fillRect( this.x - 100, this.y - 100, 200, 200 )

		ctx.font = "30px telegraf-bold"

		ctx.fillStyle = "#111"
		ctx.textBaseline = "middle"
		ctx.textAlign = "center"

		ctx.fillText( this.text, this.x, this.y )
	}
	override process( canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, delta: number, nodes: Node[] ) {
		this.draw( ctx )
	}
	override pressed( x: number, y: number ) {
		return x > this.x - 100 && x < this.x + 100 && y > this.y - 100 && y < this.y + 100
	}
}