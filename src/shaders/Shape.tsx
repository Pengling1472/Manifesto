export function ShapeVertex() {
return /* glsl */`
varying vec3 vPosition;

void main() {
	vPosition = position;

	// vec4 modelViewPosition = modelViewMatrix * vec4( position, 1.0 );
	// vec4 projectedPosition = projectionMatrix * modeViewPosition;

	// gl_Position = projectedPosition;

	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
}
`
}

export function ShapeFragment() {
return /* glsl */`
#define PI 3.14159265358979
#define MOD3 vec3(.1031,.11369,.13787)

vec3 hash33(vec3 p3) {
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}

float pnoise(vec3 p) {
    vec3 pi = floor(p);
    vec3 pf = p - pi;
    vec3 w = pf * pf * (3. - 2.0 * pf);
    return 	mix(
        		mix(
                	mix(dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))),
                        dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))),
                       	w.x),
                	mix(dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))),
                        dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))),
                       	w.x),
                	w.z),
        		mix(
                    mix(dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))),
                        dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))),
                       	w.x),
                   	mix(dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))),
                        dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
                       	w.x),
                	w.z),
    			w.y);
}

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

precision mediump float;

uniform float uTime;
uniform int id;

varying vec3 vPosition;

void main() {
	vec4 colors[ 2 ];

	if ( id == 0 ) {
		// SQUARE
		colors[ 0 ] = vec4( 209.0, 81.0, 36.0, 0.0 );
		colors[ 1 ] = vec4( 244.0, 176.0, 42.0, 1.0 );
	} else if ( id == 1 ) {
		// CIRCLE
		colors[ 0 ] = vec4( 0.0, 105.0, 119.0, 0.0 );
		colors[ 1 ] = vec4( 192.0, 198.0, 102.0, 1.0 );
	} else {
		// TRIANGLE
		colors[ 0 ] = vec4( 248.0, 145.0, 0.0, 0.0 );
		colors[ 1 ] = vec4( 0.0, 105.0, 119.0, 1.0 );
	}

	float noiseValue = clamp( pnoise( vec3( vPosition.x * 2.5, vPosition.y * 1.5, uTime * 0.2 ) ) * 5.0, 0.0, 1.0 );
	vec3 gradient = linearGradient( colors, noiseValue );

	gl_FragColor = vec4( gradient.xyz / vec3( 255.0 ), 1 );
}
`
}