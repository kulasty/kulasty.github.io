
// vertex structure
attribute vec3 vp;
attribute vec2 uv;

// program parameters
uniform vec2 rot_bck;
uniform vec2 scale;
uniform vec2 pos;

// output
varying vec2 uv_bck;


void main(void){
    uv_bck = uv;
    vec2 p = vp.xy*scale.xy;
    gl_Position = vec4(dot(p.xy,rot_bck.xy)+pos.x,dot(vec2(-p.x,p.y),rot_bck.yx)+pos.y,0.,1.);
}
