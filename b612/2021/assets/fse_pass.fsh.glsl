
precision lowp float;

varying vec2 uv_bck;	
uniform sampler2D tex_bck;
uniform vec4 cmul;
uniform vec4 cadd;

uniform float ftime;

void main(){        
    vec3 c = texture2D(tex_bck,uv_bck).rgb;
    gl_FragColor = vec4(c,1);    
}
