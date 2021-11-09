
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

    /* static eff1 (should be backed)
    float pix = 1./512.;
    vec2 uv = uv_bck;
    vec2 uv1 = uv+vec2(pix,0);
    vec2 uv2 = uv+vec2(0,pix);
    
    vec4 d1 = texture2D(tex_spr,uv1);
    vec4 d2 = texture2D(tex_spr,uv2);    
    vec4 d = texture2D(tex_spr,uv);
    float h = length(d.rgb);
    float h1 = length(d1.rgb);
    float h2 = length(d2.rgb);

    float cf = -0.1;
    uv = uv_bck + vec2(h1-h,h2-h)*cf;
    vec4 c = texture2D(tex_spr,uv);
    float lum = length(c.rgb);
    gl_FragColor = c*cmul+cadd*lum;
    /**/
    
    /* eff1
    float pix = 1./512.;
    vec2 uv = uv_bck;
    vec2 uv1 = uv+vec2(pix,0);
    vec2 uv2 = uv+vec2(0,pix);
    
    vec4 d1 = texture2D(tex_spr,uv1);
    vec4 d2 = texture2D(tex_spr,uv2);    
    vec4 d = texture2D(tex_spr,uv);
    float h = length(d.rgb);
    float h1 = length(d1.rgb);
    float h2 = length(d2.rgb);

    float cf = sin(ftime)*0.2;
    uv = uv_bck + vec2(h1-h,h2-h)*cf;
    vec4 c = texture2D(tex_spr,uv);
    gl_FragColor = c;
    /**/

    /* eff1 but rotated?
    float pix = 1./100.;
    vec2 uv = uv_bck;
    vec2 uv1 = uv+vec2(pix,0);
    vec2 uv2 = uv+vec2(0,pix);
    
    vec4 d1 = texture2D(tex_spr,uv1);
    vec4 d2 = texture2D(tex_spr,uv2);    
    vec4 d = texture2D(tex_spr,uv);
    float h = length(d.rgb);
    float h1 = length(d1.rgb);
    float h2 = length(d2.rgb);

    uv = vec2(h1-h,h2-h)*0.1;
    float sa = sin(ftime);
    float ca = cos(ftime);
    uv = uv_bck+vec2(uv.x*ca+uv.y*sa,-uv.x*sa+uv.y*ca)*4.;
    vec4 c = texture2D(tex_spr,uv);
    //gl_FragColor = vec4(uv.xy,0.,1.);

    gl_FragColor = vec4(mix(d.rgb,c.rgb,0.2)*1.5,c.a);
    //gl_FragColor = vec4(length(d.rgb),length(c.rgb),0.,1.);
    /**/
}
