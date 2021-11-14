
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
    gl_Position = vec4(vp.x*2.,vp.y*-2.,0.,1.);
}
