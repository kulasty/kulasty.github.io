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
    params.blur = gl.getUniformLocation(prog,"blur");
    params.uv_ofs = gl.getUniformLocation(prog,"uv_ofs");

    let tex_bck = gl.getUniformLocation(prog,"tex_bck"); // always TEXTURE0
    let tex_lit = gl.getUniformLocation(prog,"tex_lit"); // always TEXUTRE1
    let tex_spr = gl.getUniformLocation(prog,"tex_spr"); // always TEXTURE2
    let tex_prf = gl.getUniformLocation(prog,"tex_prf"); // always TEXTURE5

    gl.useProgram(prog);
    gl.uniform1i(tex_bck, 0);        
    gl.uniform1i(tex_lit, 1);    
    gl.uniform1i(tex_spr, 2);
    gl.uniform1i(tex_prf, 5);

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

        let gl = _createGraphics3d(sx,sy);
        this.gx = gl;        

        for(let txr in txr2d){
            console.log(`WebGL.TXR(${txr})`);
            this.texas[txr] = xgl_createTexture(gl,txr2d[txr]);
        }

        this.$texas = {}
        this.valid = false;

        this.camera = new Camera();

        // backbuffer
        // https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html        
        
        let fbs = [];
        for(let i=0;i<3;i++){
            let tx = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tx);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);    
        
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);   
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            let fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx, 0);

            fbs.push({fb:fb, tx:tx, vp:{sx:1024,sy:1024}});
        }        

        this.rt_screen = {fb:null, tx:null, vp:{sx:sx, sy:sy}};
        this.rt_this = fbs[0];
        this.rt_prev = fbs[1];
        this.rt_outp = fbs[2];
       
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    prepstage(programs){
        let gl = this.gx;
        for(let [name,vsh,fsh] of programs){
            this.progs[name] = xgl_makeProgram(gl,vsh,fsh);
        }        

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
        // why it works called only for single program??
        gl.vertexAttribPointer(this.progs.planet.vp, 3, gl.FLOAT, false, 20, 0);            
        gl.vertexAttribPointer(this.progs.planet.uv, 2, gl.FLOAT, false, 20, 12);
       
        console.log("prepstage.done");
        this.valid = true;
    }

    _setRenderTarget(gl,target){
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
        gl.viewport(0,0,target.vp.sx,target.vp.sy);
        gl.clearColor(0,0,0,1);	
        gl.clear(gl.COLOR_BUFFER_BIT);        
}

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    BeginScene(){
        if (!this.valid){
            return false;
        }        
        
        this.ftime = perfmon.time*0.001;

        let gl = this.gx;

        gl.disable(gl.DEPTH_TEST);
        this.cfx = 2.0/this.sx;
        this.cfy = 2.0/this.sy;

        this._setRenderTarget(gl,this.rt_this);

        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, this.rt_prev.tx);
        
        return true;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    EndScene(){        

        let gl = this.gx;
        let target = this.rt_this.fb

        if (target!==null){            

            
            // compose effects
            {
                this._setRenderTarget(gl,this.rt_outp);
                this.RenderFullScreen(this.progs.fse_pass, [this.rt_this.tx, this.rt_prev.tx], V4_SOLIDWHITE,V4_TRANSBLACK);
            }
            let tmp = this.rt_prev;
            this.rt_prev = this.rt_outp;
            this.rt_outp = tmp;
            
            // dump to screen
            {
                this._setRenderTarget(gl,this.rt_screen);
                this.RenderFullScreen(this.progs.fse_pass, [this.rt_prev.tx],V4_SOLIDWHITE,V4_TRANSBLACK);
            }

        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    RenderFullScreen(prog,texs,cmul,cadd){
        const t1 = perfmon.time;
        let gl = this.gx;
        gl.useProgram(prog.prog);
        let txi = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3];
        for(let i in texs){
            gl.activeTexture(txi[i]);
            gl.bindTexture(gl.TEXTURE_2D, texs[i]);
        }
        gl.uniform4f(prog.cmul,cmul[0],cmul[1],cmul[2],cmul[3]);
        gl.uniform4f(prog.cadd,cadd[0],cadd[1],cadd[2],cadd[3]);        
        gl.disable(gl.BLEND);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        perfmon.watch("gl",t1);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    RenderSprite(sprite,tex,cmul,cadd,blur){       
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
        gl.uniform2f(prog.pos, px*this.cfx-1., 1.-py*this.cfy);
        gl.uniform2f(prog.scale,tex.width*this.cfx*itemsize,tex.height*this.cfy*itemsize);
        gl.uniform4f(prog.cmul,cmul[0],cmul[1],cmul[2],cmul[3]*this.camera.opacity);
        gl.uniform4f(prog.cadd,cadd[0],cadd[1],cadd[2],cadd[3]);        
        gl.uniform1f(prog.ftime,this.ftime);
        gl.uniform1f(prog.blur,blur);

        try{
            const uvx = sprite.behaviour.v.x;
            const uvy = sprite.behaviour.v.y;
            gl.uniform2f(prog.uv_ofs,uvx,uvy);
            //cmul = [1,0,0,1];
            gl.uniform4f(prog.cmul,cmul[0],cmul[1],cmul[2],cmul[3]*this.camera.opacity);
        }catch(e){
            gl.uniform2f(prog.uv_ofs,0.,0.);
        }

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); 
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        perfmon.watch("gl",t1);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    RenderGlow(sprite,tex,cmul,cadd,blur){       
        const t1 = perfmon.time;
        let gl = this.gx;
        var prog = this.progs.glow;
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
        gl.uniform1f(prog.blur,blur);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        perfmon.watch("gl",t1);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    RenderPlanet(planet,tex,cmul,cadd){
        const t1 = perfmon.time;

          
        let gl = this.gx;

        let tx_bck = this.texas.planet;
        let tx_lit = this.texas.light;   
    
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tx_bck.tex);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tx_lit.tex);
        
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

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); 
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);  

        perfmon.watch("gl",t1);

        return;
    }

}
