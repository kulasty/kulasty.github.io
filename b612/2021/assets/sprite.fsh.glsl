
precision lowp float;

varying vec2 uv_bck;	
uniform sampler2D tex_spr; 
uniform sampler2D tex_prf; // tex5, previous frame
uniform vec4 cmul;
uniform vec4 cadd;

uniform float ftime;
uniform float blur;
uniform vec2 uv_ofs; // offset for movement

void main(){            
    //gl_FragColor = texture2D(tex_spr,uv_bck)*cmul+cadd;
    //gl_FragColor = vec4(uv_bck,0,1);    

    //* good
    vec4 c = texture2D(tex_spr,uv_bck);
    float lum = length(c.rgb);
    gl_FragColor = c*cmul+cadd*lum;    
    /**/

    /* with blur
    vec4 c = texture2D(tex_spr,uv_bck);
    float lum = length(c.rgb);
    c = c*cmul+cadd*lum;    

    vec2 uv = vec2(gl_FragCoord.x/1024.,1.-gl_FragCoord.y/1024.);//-(uv_ofs*0.0001);
    vec4 d = texture2D(tex_prf,uv);
    gl_FragColor = vec4(mix(c.rgb,d.rgb,blur),c.a);    
    
    /**/
    
    
}
