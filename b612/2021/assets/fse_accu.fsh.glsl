
precision lowp float;

varying vec2 uv_bck;	
uniform sampler2D tex_bck; //tex0
uniform sampler2D tex_lit; //tex1
uniform vec4 cmul;
uniform vec4 cadd;

uniform float ftime;

void main(){            
    vec3 c0 = texture2D(tex_lit,vec2(uv_bck.x,1.-uv_bck.y)).rgb;
    vec3 c1 = texture2D(tex_bck,uv_bck).rgb;
    vec3 c = mix(c0,c1,uv_bck.x);
    gl_FragColor = vec4(c,1.);
}
