export function DecalVertex() {
return /* glsl */`
varying vec2 vUv;

void main() {
    vUv = uv;

	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
}
`
}

export function DecalFragment() {
return /* glsl */`
precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uBackground;

varying vec2 vUv;

vec3 linearGradient( vec4 colors[ 2 ], float value ) {
	vec3 rgb = vec3( 0 );

	for ( int i = 1; i < 2; i++ ) {
		vec4 c1 = colors[ i - 1 ];
		vec4 c2 = colors[ i ];

		if ( value == c2[ 3 ] ) return c2.xyz;
		if ( c1[ 3 ] <= value && c2[ 3 ] > value ) {
			for ( int j = 0; j < 3; j++ ) {
				rgb[ j ] = ( ( c2[ j ] - c1[ j ] ) / ( c2[ 3 ] - c1[ 3 ] ) * ( value - c2[ 3 ] ) + c2[ j ] );
			}
		}
	}

	return rgb;
}

void main() {
    vec4 canvas = texture2D( uTexture, vUv );
    vec4 background = texture2D( uBackground, vUv );

    vec4 colors[ 2 ];

    colors[ 0 ] = vec4( 0.0, 0.0, 0.0, 0.0 );
    colors[ 1 ] = vec4( background.r, background.g, background.b, 1.0 );
    
    if ( canvas.r > 0.0 ) gl_FragColor = vec4( linearGradient( colors, canvas.r ), 1.0 );
	// gl_FragColor = vec4( background.rgb, 1.0 );
}
`
}