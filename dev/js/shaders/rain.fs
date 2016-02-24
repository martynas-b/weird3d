uniform vec3 color;
uniform float opacity;
uniform sampler2D texture;
void main() {
	vec4 texColor = texture2D( texture, gl_PointCoord );
	gl_FragColor = texColor * vec4( color, opacity );
}