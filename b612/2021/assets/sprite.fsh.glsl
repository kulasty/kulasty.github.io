
precision lowp float;

varying vec2 uv_bck;	
uniform sampler2D tex_spr;
uniform vec4 cmul;
uniform vec4 cadd;

void main(){        
    gl_FragColor = texture2D(tex_spr,uv_bck)*cmul+cadd;
    //gl_FragColor = vec4(uv_bck,0,1);
}
