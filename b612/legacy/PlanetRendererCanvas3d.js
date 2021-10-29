//https://gist.github.com/1224052


var WEB_GL_NULL = {toString : function(){ return "WEB_GL_NULL;" } };

var txr3d = { planet: null, prince: null, rose: null };
var prog = null;
var disp = { };

function CreateGraphics3d()
{
    var cv = $("#display3d");
	var canvas = cv[0];	
	var cx = parseInt(cv.css('width'));
	var cy = parseInt(cv.css('height'));
	disp.sx = cx;
	disp.sy = cy;
	canvas.width = cx;
	canvas.height = cy;
	debug("Canvas3d: "+cx+"x"+cy);

	var names=["webgl","experimental-webgl","webkit-3d","moz-webgl"];
	for(var i in names) try { var gx = canvas.getContext(names[i],  { antialias: true, premultipliedAlpha: false }); if (gx!=null) { debug("WebGl: " + names[i]); 
	
        var gl = gx;
	    gl.clearColor(0xaa/0xff,0xbb/0xff,1,1);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.TEXTURING);
        gl.enable(gl.TEXTURE_2D);
        gl.viewport(0,0,cx,cy);        
        
		var vs = MakeShader(gl, ''
		    +''
            +'attribute vec3 aPos;'
            +'attribute vec2 aTex;'
            +'uniform vec3 uScale;'
            +'uniform vec3 uView;'
            +'uniform vec3 uPos;'
            +'uniform vec3 uRot;'
            +'varying vec2 tex0;'
            +'void main(void) {'
            +'  vec3 v = aPos;'
            +'  v *= uScale;'
            +'  v = vec3(v.x*uRot.x+v.y*uRot.y,-v.x*uRot.y+v.y*uRot.x,0);'
            +'  v *= uView;'
            +'	gl_Position = vec4(v+uPos, 1.0);'
            +'	tex0 = aTex;'
            +'}'
		, gl.VERTEX_SHADER);
		
		var fs = MakeShader(gl, ''
		    +'precision highp float;'
		    +'varying vec2 tex0;'		
		    +'uniform sampler2D uSampler;'
		    +'void main(){ gl_FragColor = texture2D(uSampler, vec2(tex0.s, tex0.t)); }'		    
		, gl.FRAGMENT_SHADER);
		
		prog = MakeProgram(gl,
		    {sh:vs, a:["aPos", "aTex"], u:["uScale", "uPos", "uRot", "uView"]},
		    {sh:fs, u:["uSampler"]});		
        
	return gx; }} catch(e) { debug(""+names[i]+" -> "+e); }
	debug("WebGl not supported?!");
	return WEB_GL_NULL;
}


function MakeShader(gl, src, type)
{
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    debug("MakeShader["+type+"].status = '" + gl.getShaderInfoLog(sh)+"'");
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
        sh = "";
    }
    return sh;
}

function BindAttribs(gl, prog, ta)
{
    if (!ta) return;
    for(var i=0;i<ta.length;i++)
    {
        var n = ta[i];
        var a = gl.getAttribLocation(prog, n);
        gl.enableVertexAttribArray(a);
        debug("attribute["+n+"] => " + a);
        prog[n] = a;
    }
}

function BindUniform(gl, prog, tu)
{   
    if (!tu) return;
    for(var i=0;i<tu.length;i++)
    {        
        var n = tu[i];
        var u = gl.getUniformLocation(prog, n);            
        debug("uniform["+n+"] => " + u);
        prog[n] = u;
    }
}

function MakeProgram(gl, v, f)
{       
    var prog = gl.createProgram();
    gl.attachShader(prog, v.sh);
    gl.attachShader(prog, f.sh);
    gl.linkProgram(prog);

    debug("MakeProgram.Log = " + gl.getProgramInfoLog(prog));

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        prog = null;    
    }       
    
    BindAttribs(gl,prog,v.a);
    BindUniform(gl,prog,v.u);
    BindAttribs(gl,prog,f.a);
    BindUniform(gl,prog,f.u);
    
    debug("MakeProgram.Prog = " + prog);
    return prog;
}

var vb = null;
var vcs =
[
    -0.5, -0.5, 0.0,    0.0, 0.0,
    -0.5,  0.5, 0.0,    0.0, 1.0,
     0.5, -0.5, 0.0,    1.0, 0.0,
     0.5,  0.5, 0.0,    1.0, 1.0
];

function CreateTexture(gl, img)
{		    
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);  
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);  
    gl.generateMipmap(gl.TEXTURE_2D);  
    gl.bindTexture(gl.TEXTURE_2D, null);                
    debug("CreateTexture => " + tex);
    return tex;
}


var PlanetRendererCanvas3d = 
{
	gx : null,
	GetContext : function(){
		var that = PlanetRendererCanvas3d;
		if (that.gx == null) that.gx = CreateGraphics3d();		
		return that.gx;
	},
	BeginScene : function(){
		var that = PlanetRendererCanvas3d;
		var gl = that.GetContext();
		if (gl == WEB_GL_NULL) return;	
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	
		    
		if (txr3d.planet == null && txr2d.planet.loaded == true)
		    txr3d.planet = CreateTexture(gl, txr2d.planet);
		if (txr3d.prince == null && txr2d.prince2.loaded == true)
		    txr3d.prince = CreateTexture(gl, txr2d.prince2);
		if (txr3d.rose == null && txr2d.rose2.loaded == true)
		    txr3d.rose = CreateTexture(gl, txr2d.rose2);
		
		if (vb == null)
		{
		    vb = gl.createBuffer();
		    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
		    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vcs), gl.DYNAMIC_DRAW);		                  
        }
        
	},
	UpdateSprite : function (o, what, tx, ty){
		var that = PlanetRendererCanvas3d;
		var gx = that.GetContext();
		if (gx == WEB_GL_NULL) return;
		
		var ps = prog;		    
		var gl = gx;
        
        if (ps!=null)
        {
            gl.useProgram(ps);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, vb);
            gl.vertexAttribPointer(ps.aPos, 3, gl.FLOAT, false, 20, 0);            
            gl.vertexAttribPointer(ps.aTex, 2, gl.FLOAT, false, 20, 12);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, txr3d[what]);
            gl.uniform1i(ps.uSampler, 0);
            
            var w = o.Radius*4;
            
            gl.uniform3f(ps.uView, (w/disp.sx), -(w/disp.sy), 0);
            gl.uniform3f(ps.uScale, tx, ty, 0);
            gl.uniform3f(ps.uPos, (o.World.X*2)/disp.sx-1, 1-(o.World.Y*2)/disp.sy, 0);
            var r = -o.Rotation-Math.PI/2;
            gl.uniform3f(ps.uRot, Math.cos(r), Math.sin(r), 0);
                       
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);           
            
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            
        }
	}
};


debug("LoadLib: Renderer.Canvas3d");
