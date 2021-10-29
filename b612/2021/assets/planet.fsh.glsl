precision lowp float;

// texture coords computed in vertex shader
varying vec2 uv_bck;	
varying vec2 uv_lit;	

// textures
uniform sampler2D tex_bck;
uniform sampler2D tex_lit;

void main(){
    
    vec4 planet     = texture2D(tex_bck, uv_bck);
    vec4 lighting   = texture2D(tex_lit, uv_lit);
    //gl_FragColor = vec4(uv_bck,0,1);

    gl_FragColor = vec4(min(planet.rgb,lighting.rgb), planet.a);
    
}
