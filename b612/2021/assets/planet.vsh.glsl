
// vertex structure
attribute vec3 vp;
attribute vec2 uv;

// shader parameters
uniform vec2 rot_bck;  // rotation of main planetoid body
uniform vec2 rot_lit;  // rotation of the lighting
uniform vec2 scale;    // scale of the planetoid
uniform vec2 pos;      // position of the planetoid (viewport)

varying vec2 uv_bck;   // result uv for body, to be used in fragment shader
varying vec2 uv_lit;   // result uv for lighting, to be used in fragment shader

void main(void){
    vec2 st = uv - vec2(0.5);
    uv_bck = vec2(dot(st.xy,rot_bck.xy), dot(vec2(-st.x,st.y),rot_bck.yx) ) + vec2(0.5);
    uv_lit = vec2(dot(st.xy,rot_lit.xy), dot(vec2(-st.x,st.y),rot_lit.yx) ) + vec2(0.5);
    gl_Position = vec4(vp.xy*scale.xy + pos.xy,0,1);
     
}
