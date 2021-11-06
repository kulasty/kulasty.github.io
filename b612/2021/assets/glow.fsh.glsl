
precision lowp float;

varying vec2 uv_bck;	
uniform sampler2D tex_spr;
uniform sampler2D tex_prf;
uniform vec4 cmul;
uniform vec4 cadd;

uniform float ftime;
uniform float blur;

void main(){        

    // standard c*m+a*len(c.rgb)
    vec4 c = texture2D(tex_spr,uv_bck);
    float lum = length(c.rgb);
    c = c*cmul+cadd*lum;   
    
    // regular
    gl_FragColor = vec4(c.rgb,c.a*blur);

    // doublebuffer
    //vec2 uv = vec2(gl_FragCoord.x/1024.,1.-gl_FragCoord.y/1024.);
    //vec4 d = texture2D(tex_prf,uv);
    //gl_FragColor = vec4(mix(c.rgb,d.rgb,0.5),c.a*blur);
    
    
}
