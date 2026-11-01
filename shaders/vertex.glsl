
attribute vec3 aYaw;
attribute vec3 aBladeOrigin;

varying vec3 vColor;
uniform float uBladeWidth;
uniform sampler2D  grassMap;
uniform sampler2D noiseMap;
uniform sampler2D terrainNoiseMap;

uniform float uHeightNoiseAmplitude;
uniform float uMaxBladeHeight;
uniform float time;

void main()
{
    vec3 transformed = position;
    vec3 offset = vec3(0.0, texture2D(terrainNoiseMap, vec2(uv.x, uv.y)).r*0.0, 0.0);

    //modify transformed to correct grass mesh
    transformed.y += color.g*.1;
    float factor = (color.r == 0.1) ? 1.0 : (color.b == 0.1) ? -1.0 : 0.0;
    float heightModifier = ((texture2D(noiseMap, vec2(uv.x, uv.y)).r + texture2D(noiseMap, vec2(uv.x, uv.y)).g + texture2D(noiseMap, vec2(uv.x, uv.y)).b) * uMaxBladeHeight) * uHeightNoiseAmplitude;
    float width = smoothstep(0.5, 1.0, heightModifier * 2.0) * uBladeWidth;
    transformed.y += heightModifier* color.g;
    transformed += (width / 2.0) * factor;
    transformed += aYaw * (width / 2.0) * factor;

    if(color.g > 0.3){
        transformed.x = position.x + sin(time*texture2D(grassMap, vec2(uv.x, uv.y)).r*1.3);
        transformed.z = position.z + cos(time*texture2D(grassMap, vec2(uv.x, uv.y)).r*1.3);
    }

    //vColor = vec3(0, 1, 0);
    vColor = texture2D(grassMap, vec2(uv.x, uv.y)).rgb;
    gl_Position = projectionMatrix* viewMatrix* modelMatrix * vec4(transformed+offset, 1.0);
}