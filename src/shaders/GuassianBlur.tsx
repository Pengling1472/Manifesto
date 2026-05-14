export function GuassianBlurVertex() {
return /* glsl */`
varying vec2 vUv;
varying vec3 vPosition;

void main() {
	vUv = uv;
	vPosition = position;

	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
}
`
}

export function GuassianBlurFragment() {
return /* glsl */`
float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

vec3 rgb2hsl( in vec3 c ){
	float cMin = min(c.r, min(c.g, c.b));
	float cMax = max(c.r, max(c.g, c.b));
	float delta = cMax - cMin;

	float l = (cMax + cMin) / 2.0;
	float s = 0.0;
	float h = 0.0;

	if (delta > 0.0) {
		s = l < 0.5 ? delta / (cMax + cMin) : delta / (2.0 - cMax - cMin);

		if (c.r == cMax) {
			h = (c.g - c.b) / delta + (c.g < c.b ? 6.0 : 0.0);
		} else if (c.g == cMax) {
			h = (c.b - c.r) / delta + 2.0;
		} else {
			h = (c.r - c.g) / delta + 4.0;
		}
		h /= 6.0;
	}

	return vec3(h, s, l);
}

vec3 hsl2rgb( in vec3 c )
{
	vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

	return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

precision mediump float;

varying vec2 vUv;
varying vec3 vPosition;

uniform sampler2D uTexture;
uniform float uOpacity;
uniform vec2 uvStride;

void main() {
	vec4 screenTexture = texture2D( uTexture, vUv );

	float radius = 5.0;
	float kernal = 0.0;
	vec4 color = vec4( 0.0 );

	for ( float x = -radius; x <= radius; x++ ) {
		for ( float y = -radius; y <= radius; y++ ) {
			vec2 offset = vec2( x, y );
			vec4 cell = texture2D( uTexture, vUv + offset * uvStride * 0.03 ) * 0.4;

			float sigma = 2.5;
			float weight = exp( -0.5 * ( x * x + y * y ) / ( sigma * sigma ) );

			color += cell * weight;
			kernal += weight;
		}
	}

	vec4 result = color / kernal;

	vec3 hslColor = rgb2hsl( result.rgb );
	vec3 newColor = hsl2rgb( vec3( hslColor.x, hslColor.y, hslColor.z - noise( vPosition.xy * 32.0 ) * 0.0015 ) );
	
	gl_FragColor = vec4( newColor, uOpacity );

	#include <colorspace_fragment> 
}
`
}