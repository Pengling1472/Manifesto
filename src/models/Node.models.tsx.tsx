export class Node {
    x: number
    y: number
    constructor( x: number, y: number ) {
        this.x = x
        this.y = y
    }
    draw( _ctx: CanvasRenderingContext2D, _delta: number ): void {}
    process( _canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, _delta: number, _nodes: Node[] ): void {}
}