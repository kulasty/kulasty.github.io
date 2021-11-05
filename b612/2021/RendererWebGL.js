"use strict";

//
// LittlePrince JS
// (c) Damian Adamowicz
// damian.adamowicz@gmail.com
//
// RendererWebGL
//

///////////////////////////////////////////////////////////////////////////////////////////////////////////
function _createGraphics3d(width, height){
	let canvas = document.getElementById("display");    
    canvas.width = width;
    canvas.height = height;

    let gl = undefined;
    var names=["webgl3", "webgl2", "webgl","experimental-webgl","webkit-3d","moz-webgl"];
    for(const name of names){
        try{
            let gx = canvas.getContext(name);
            console.log("[i]","WebGl",name,gx);
            if (gx!==null){
                gl = gx;
                break;
            }
        }catch(e){
            console.log("[!]",name,e);
        }
    }     
    
    gl.viewport(0,0,width,height);    

    return gl;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
function xgl_makeProgram(gl,vsh,fsh){
    var sh = gl.createShader(gl.VERTEX_SHADER);   
    gl.shaderSource(sh,vsh);
    gl.compileShader(sh);
    console.log("vs:",gl.getShaderInfoLog(sh));
    const vs = sh;

    var sh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(sh,fsh);
    gl.compileShader(sh);
    console.log("fs:",gl.getShaderInfoLog(sh));
    const ps = sh;

    var prog = gl.createProgram();    
    let params = { prog:prog };
    gl.attachShader(prog, vs);
    gl.attachShader(prog, ps);
    gl.linkProgram(prog);
    console.log("pg:",gl.getProgramInfoLog(prog));
    // vertex structure
    params.vp = gl.getAttribLocation(prog,"vp");
    gl.enableVertexAttribArray(params.vp);
    params.uv = gl.getAttribLocation(prog,"uv");
    gl.enableVertexAttribArray(params.uv);

    // program parameters
    params.rot_bck = gl.getUniformLocation(prog,"rot_bck");
    params.rot_lit = gl.getUniformLocation(prog,"rot_lit");
    params.scale = gl.getUniformLocation(prog,"scale");
    params.pos = gl.getUniformLocation(prog,"pos");
    params.cmul = gl.getUniformLocation(prog,"cmul");
    params.cadd = gl.getUniformLocation(prog,"cadd");
    params.ftime = gl.getUniformLocation(prog,"ftime");

    let tex_bck = gl.getUniformLocation(prog,"tex_bck"); // always TEXTURE0
    let tex_lit = gl.getUniformLocation(prog,"tex_lit"); // always TEXUTRE1
    let tex_spr = gl.getUniformLocation(prog,"tex_spr"); // always TEXTURE2

    gl.useProgram(prog);
    gl.uniform1i(tex_bck, 0);        
    gl.uniform1i(tex_lit, 1);    
    gl.uniform1i(tex_spr, 2);

    return params;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
function xgl_createTexture(gl,img){
    let tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);    

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // turn off mimaps
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    // turn on mimaps
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);   
    gl.generateMipmap(gl.TEXTURE_2D);  

    gl.bindTexture(gl.TEXTURE_2D, null);                
    return {tex:tex, width:img.width, height:img.height};
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
class RendererWebGL {
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(sx,sy){   
        this.progs = {}
        this.texas = {}    
        this.sx = sx;
        this.sy = sy;     
        this.cfx = 2.0/sx;
        this.cfy = 2.0/sy;
        let gl = _createGraphics3d(sx,sy);
        this.gx = gl;
        //gl.clearColor(0xaa/0xff,0xbb/0xff,1,1);
        gl.clearColor(0,0,0,1);
        gl.disable(gl.DEPTH_TEST);        

        for(let txr in txr2d){
            console.log(`WebGL.TXR(${txr})`);
            this.texas[txr] = xgl_createTexture(gl,txr2d[txr]);
        }
        let tx_bck = this.texas.planet;
        let tx_lit = this.texas.light;   
    
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tx_bck.tex);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tx_lit.tex);
        
        this.$texas = {}
        this.valid = false;

        this.camera = new Camera();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    prepstage(vsh,fsh,svsh,sfsh){
        let gl = this.gx;
        this.progs.planet = xgl_makeProgram(gl,vsh,fsh);
        this.progs.sprite = xgl_makeProgram(gl,svsh,sfsh);

        // simple quad for sprite
        let vcs =[
            -0.5, -0.5, 0.0,    0.0, 1.0,
            -0.5,  0.5, 0.0,    0.0, 0.0,
            0.5, -0.5, 0.0,    1.0, 1.0,
            0.5,  0.5, 0.0,    1.0, 0.0
        ];

        gl.useProgram(this.progs.planet.prog);

        let vb = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vb);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vcs), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.progs.planet.vp, 3, gl.FLOAT, false, 20, 0);            
        gl.vertexAttribPointer(this.progs.planet.uv, 2, gl.FLOAT, false, 20, 12);

        gl.enable(gl.BLEND);        
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); 
        
        console.log("prepstage.done");
        this.valid = true;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    BeginScene(){
        if (!this.valid){
            return false;
        }
        let gl = this.gx;
        gl.clear(gl.COLOR_BUFFER_BIT);	
        this.ftime = perfmon.time*0.001;
        return true;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    RenderSprite(sprite,tex,cmul,cadd){       
        const t1 = perfmon.time;
        let gl = this.gx;
        var prog = this.progs.sprite;                
        gl.useProgram(prog.prog);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, tex.tex);

        const f = sprite.globalRotation;        
        const p = sprite.globalPosition;
        const [camx,camy] = [this.camera.ox * sprite.z_1, this.camera.oy * sprite.z_1];
        const [px,py] = [p.x + camx, p.y + camy];        
        
        const itemsize = sprite.globalScale;
        //gl.uniform2f(prog.rot_bck, Math.cos(f), Math.sin(f));
        gl.uniform2f(prog.rot_bck, f, f);
        gl.uniform2f(prog.pos, px,py )//px*this.cfx-1., 1.-py*this.cfy);
        gl.uniform2f(prog.scale,tex.width*this.cfx*itemsize,tex.height*this.cfy*itemsize);
        gl.uniform4f(prog.cmul,cmul[0],cmul[1],cmul[2],cmul[3]*this.camera.opacity);
        gl.uniform4f(prog.cadd,cadd[0],cadd[1],cadd[2],cadd[3]);        
        gl.uniform1f(prog.ftime,this.ftime);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        perfmon.watch("gl",t1);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    RenderPlanet(planet,tex,cmul,cadd){
        const t1 = perfmon.time;

        let gl = this.gx;
        var prog = this.progs.planet;
        gl.useProgram(prog.prog);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex.tex);      
        
        const itemsize = planet.scale;
        gl.uniform2f(prog.scale,tex.width*this.cfx*itemsize,tex.height*this.cfy*itemsize);
        gl.uniform4f(prog.cmul,cmul[0],cmul[1],cmul[2],cmul[3]*this.camera.opacity);
        gl.uniform4f(prog.cadd,cadd[0],cadd[1],cadd[2],cadd[3]);        
        
        var k1 = planet.globalRotation;
        var k2 = planet.lightRotation;
        const p = planet.globalPosition;
        const [camx,camy] = [this.camera.ox*planet.z_1, this.camera.oy*planet.z_1];
        p.x+=camx;
        p.y+=camy;
                
        gl.uniform2f(prog.rot_bck, Math.cos(k1), Math.sin(k1));
        gl.uniform2f(prog.rot_lit, Math.cos(k2), Math.sin(k2));
        gl.uniform2f(prog.pos, p.x*this.cfx-1.,1-p.y*this.cfy);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);  

        perfmon.watch("gl",t1);

        return;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    EndScene(){

    }
}
