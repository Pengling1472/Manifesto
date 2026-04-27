export default /* glsl */`
varying vec3 vPosition;

void main() {
	vPosition = position;

	// vec4 modelViewPosition = modelViewMatrix * vec4( position, 1.0 );
	// vec4 projectedPosition = projectionMatrix * modeViewPosition;

	// gl_Position = projectedPosition;

	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
}
`