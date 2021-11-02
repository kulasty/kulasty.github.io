"use strict;"

//
// LittlePrince JS
// (c) Damian Adamowicz
// damian.adamowicz@gmail.com
//
// RendererWebGL
//

///////////////////////////////////////////////////////////////////////////////////////////////////////////
function _createGraphics3d(width, height){
    width = 200;
    height = 200;
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
    
     /*
	let gl = canvas.getContext("webgl2",{
        antialias: true,
        premultipliedAlpha: false,
    });
    */

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
    
        let tx_bck = xgl_createTexture(gl,txr2d.planet);
        this.texas["planet"] = tx_bck;
        let tx_lit = xgl_createTexture(gl,txr2d.light);
        this.texas["prince"] = xgl_createTexture(gl,txr2d.prince2);    
        this.texas["rose"]   = xgl_createTexture(gl,txr2d.rose);    
        this.texas["fox"]    = xgl_createTexture(gl,txr2d.fox);    
        this.texas["sheep"]  = xgl_createTexture(gl,txr2d.sheep);    
        this.texas["star"]   = xgl_createTexture(gl,txr2d.star);    
        this.texas["box"]   = xgl_createTexture(gl,txr2d.box);    
        this.texas["retro"]   = xgl_createTexture(gl,txr2d.retro);    
        this.texas["bg"]   = xgl_createTexture(gl,txr2d.bg);    
        this.texas["scarf"]   = xgl_createTexture(gl,txr2d.scarf);    
        this.texas["bush"]   = xgl_createTexture(gl,txr2d.bush);    

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
        let gl = this.gx;
        gl.clear(gl.COLOR_BUFFER_BIT);	
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
        gl.uniform4f(prog.cmul,cmul[0],cmul[1],cmul[2],cmul[3]);
        gl.uniform4f(prog.cadd,cadd[0],cadd[1],cadd[2],cadd[3]);        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        perfmon.watch("gl",t1);
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    _RenderStar(star){       
        let gl = this.gx;
        var prog = this.progs.sprite;                
        gl.useProgram(prog.prog);

        var tex = this.texas["star"];        
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, tex.tex);

        var f = star.globalRotation;
        
        var p = star.globalPosition;
        var [px,py] = [p.x,p.y];
        
        const itemsize = star.globalScale*0.5; // as .cf{x,y} is only half of the viewport
        gl.uniform2f(prog.rot_bck, Math.cos(f), Math.sin(f));
        gl.uniform2f(prog.pos, px*this.cfx-1.,1-py*this.cfy);
        gl.uniform2f(prog.scale,tex.width*this.cfx*itemsize,tex.height*this.cfy*itemsize);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);      
        
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    RenderPlanet(planet,tx){
        const t1 = perfmon.time;
        let gl = this.gx;
        var prog = this.progs.planet;
        gl.useProgram(prog.prog);

        // set planetoid texture "as-backed"
        gl.activeTexture(gl.TEXTURE0);
        /*
        const hash = planet.planet.hash;
        var tx = this.$texas["planet-"+hash]
        if (tx===undefined){
            tx = this.texas["planet"];
            this.$texas["planet-"+hash] = xgl_createTexture(gl,_bakePlanet(planet.planet));
        }*/
        //var tx = this.texas["planet"];
        gl.bindTexture(gl.TEXTURE_2D, tx.tex);
        
        
        //let sk = planet.k-planet.kick;
        //let s = Math.sin(sk*20.0)*0.15*1.0/Math.exp(sk*2);
        //var r = (1+planet.r)*0.15*(1+s);
        //var fx = 256*this.cfx*r;
        //var fy = 256*this.cfy*r;
        
        const itemsize = planet.scale;
        gl.uniform2f(prog.scale,tx.width*this.cfx*itemsize,tx.height*this.cfy*itemsize);
        
    
        //var k = planet.k*planet.ks;

        //var px = planet.p.x + Math.cos(s*Math.PI*10)*3;
        //var py = planet.p.y  + Math.sin(s*Math.PI*10)*3;

        //var klight=Math.PI*0.7+Math.atan2(mouse.y-planet.p.y,mouse.x-planet.p.x);


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
        /*
        var prog = this.progs.sprite;
        gl.useProgram(prog.prog);
        

        // for items use always TEXTURE2
        gl.activeTexture(gl.TEXTURE2);

        const itemsize = 0.8;

        for(let i in planet.items){

            let o = planet.items[i];
            let tex = this.texas[o[0]];
            gl.bindTexture(gl.TEXTURE_2D, tex.tex);    
            var f = o[1]+k
                
            let ix = px + (r*105+tex.height*0.5*itemsize)*Math.cos(f);
            let iy = py + (r*105+tex.height*0.5*itemsize)*Math.sin(f);
            ix = ix*this.cfx-1.;
            iy = 1.-iy*this.cfx;
            
            gl.uniform2f(prog.rot_bck, Math.cos(f+Math.PI*0.5), Math.sin(f+Math.PI*0.5));
            gl.uniform2f(prog.pos, ix, iy);
            gl.uniform2f(prog.scale,tex.width*this.cfx*itemsize,tex.height*this.cfy*itemsize);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);      
        
        }
        */

    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    EndScene(){

    }
}
