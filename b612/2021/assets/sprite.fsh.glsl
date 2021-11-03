
precision lowp float;

varying vec2 uv_bck;	
uniform sampler2D tex_spr;
uniform vec4 cmul;
uniform vec4 cadd;

uniform float ftime;

void main(){        
    //gl_FragColor = texture2D(tex_spr,uv_bck)*cmul+cadd;
    //gl_FragColor = vec4(uv_bck,0,1);

    vec4 c = texture2D(tex_spr,uv_bck);
    float lum = length(c.rgb);
    gl_FragColor = c*cmul+cadd*lum;    
    
    /*
    float blik= cos((uv_bck.x-0.5)*3.1415926 + cadd.x*4. - 3.1415926*0.5);
    blik = max(0.,blik);
    blik = pow(blik,5.) * cadd.x;
    
    vec4 c = texture2D(tex_spr,uv_bck);
    float lum = length(c.rgb);
    gl_FragColor = c*cmul+vec4(blik,blik,blik,0.)*lum;    
    */
    
}
