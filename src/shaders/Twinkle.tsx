export function TwinkleVertex() {
return /* glsl */`
// varying vec3 vPosition;
varying vec2 vUv;

void main() {
	// vPosition = position;
    vUv = uv;

	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
}
`
}

export function TwinkleFragment() {
return /* glsl */`
#define PI 3.14159265358979

precision mediump float;

uniform float uTime;

varying vec2 vUv;

void main() {
    vec2 center = vec2( 0.5, 0.5 );
    float dist = distance( vUv, center );
    float brightness = sin( uTime );

    brightness = ( brightness + 1.0 ) / 2.0;

    float shape = 1.0 - smoothstep( 0.1, 0.5, dist );
    float glow = shape * brightness;

	gl_FragColor = vec4( 1.0, 1.0, 1.0, glow );
}
`
}