export function ShapeVertex() {
return /* glsl */`
varying vec3 vPosition;

void main() {
	vPosition = position;

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

vec3 linearGradient( vec4 colors[ 3 ], float value ) {
	vec3 rgb = vec3( 0 );

	for ( int i = 1; i < 3; i++ ) {
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
	vec4 colors[ 3 ];

	if ( id == 0 ) {
		// TRIANGLE
		colors[ 0 ] = vec4( 236.0, 54.0, 132.0, 0.0 ); //2
		colors[ 1 ] = vec4( 206.0, 255.0, 52.0, 0.99 ); //1
		colors[ 2 ] = vec4( 206.0, 255.0, 52.0, 1.0 ); //1
	} else if ( id == 1 ) {
		// CIRCLE
		colors[ 0 ] = vec4( 47.0, 71.0, 159.0, 0.0 ); //1
		colors[ 1 ] = vec4( 216.0, 117.0, 143.0, 0.5 ); //3
		colors[ 2 ] = vec4( 248.0, 192.0, 125.0, 1.0 ); // 2
	} else {
		// SQUARE
		colors[ 0 ] = vec4( 60.0, 9.0, 109.0, 0.0 ); //2
		colors[ 1 ] = vec4( 226.0, 167.0, 223.0, 0.99 ); //3
		colors[ 2 ] = vec4( 226.0, 167.0, 223.0, 1.0 ); //3
	}
	
	float noiseValue = clamp( pnoise( vec3( vPosition.x * 2.5, vPosition.y * 1.5, uTime * 0.2 ) ) * 5.0, 0.0, 1.0 );
	vec3 gradient = linearGradient( colors, noiseValue );

	gl_FragColor = vec4( gradient.xyz / 255.0, 1 );
}
`
}