uniform float radiusX;
uniform float radiusZ;
uniform float size;
uniform float scale;
uniform float height;
uniform float elapsedTime;
uniform float speedH;
uniform float speedV;
void main() {
	vec3 pos = position;
	pos.x += cos((elapsedTime + position.z) * 0.25 * speedH) * radiusX;
	pos.y = mod(pos.y - elapsedTime * speedV, height);
	pos.z += sin((elapsedTime + position.x) * 0.25 * speedH) * radiusZ;
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_PointSize = size * ( scale / length( mvPosition.xyz ) );
	gl_Position = projectionMatrix * mvPosition;
}