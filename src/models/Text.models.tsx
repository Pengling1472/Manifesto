import { Node } from "./Node.models.tsx.tsx"

export class Text extends Node {
    text: string
    font: string
    size: number
    color: string
    constructor ( text: string, x: number, y: number, { color = "#111", font = "telegraph", size = 30 } ) {
        super( x, y )

        this.text = text
        this.font = font
        this.size = size
        this.color = color
    }
    override draw( ctx: CanvasRenderingContext2D ) {
        ctx.font = `${this.size}px ${this.font}`

        ctx.fillStyle = "#111"
		ctx.textBaseline = "middle"
		ctx.textAlign = "center"
		
		ctx.fillText( this.text, this.x, this.y )
    }
    override process( canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, delta: number, nodes: Node[] ) {
        this.draw( ctx )
    }
}