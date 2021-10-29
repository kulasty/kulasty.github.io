
function _createGraphics2d(width, height)
{
	var canvas = document.getElementById("display");    
    canvas.width = width;
    canvas.height = height;
	return canvas.getContext("2d");;	
}

function _createTexture(filename){
    var img = new Image();
    img.onload = function(){ this.loaded = true; }
    img.src = "./assets/"+filename;
    return img;
}

function _bakePlanet(planet){
    const tx = txr2d.planet;
    const width = tx.width;
    const height = tx.height;
	let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
	let gx = canvas.getContext("2d");
                
    px = width/2;
    py = height/2;

    //gx.fillStyle = "#f00";//"#abf";
    //gx.fillRect(0,0,width,height);
    canvas.loaded = true;

    for(let i in planet.lay_out){
        let k = planet.lay_out[i];
        _renderTexture(gx,txr2d.planet,k,1,px,py);
    }
    
    for(let i in planet.lay_in){
        let k = planet.lay_in[i];
        _renderTexture(gx,txr2d.details,k,1,px,py);
    }

    return canvas;
}

function _renderTexture(gx,tex,k,s,ox,oy){
    if (!tex.loaded){
        return;
    }    
    let sx = tex.width*s;
    let sy = tex.height*s;
    gx.save();    
    gx.translate(ox,oy);
    gx.rotate(k);
    gx.translate(-sx/2,-sy/2)
    gx.drawImage(tex,0,0,tex.width,tex.height,0,0,sx,sy);
    gx.restore();
}


class RendererCanvas {

    constructor(sx,sy){
        this.gx = _createGraphics2d(sx,sy);
        this.sx = sx;
        this.sy = sy;
        console.log(this.gx);
        this.klight = 0;
        this.cache = {};
    }

    _renderItem(ox,oy,k,r,item){
        let tx = {
            "prince":   txr2d.prince,
            "rose":     txr2d.rose,
            "fox":      txr2d.fox,
            "sheep":    txr2d.sheep
        }
        let t = tx[item[0]];

        let f = k+item[1];
        let tr = (125*r)+t.height/4*0.5;
        let x = Math.cos(f)*tr+ox;
        let y = Math.sin(f)*tr+oy;        

        _renderTexture(this.gx, t, f+Math.PI*0.5, 0.5, x, y);
    }

    BeginScene(){
        this.gx.fillStyle = "#000";//"#abf";
        this.gx.fillRect(0,0,this.sx,this.sy);		            
    }

    RenderPlanet(planet){
        let gx = this.gx;

        gx.globalCompositeOperation = "source-over";

        let sk = planet.k-planet.kick;
        let s = Math.sin(sk*20.0)*0.15*1.0/Math.exp(sk*2);
        let r = ((1.0+planet.r)*.15)*(1+s);
        let px = planet.p.x + Math.cos(s*Math.PI*10)*3;
        let py = planet.p.y + Math.sin(s*Math.PI*10)*3;

        this.klight=Math.PI*0.7+Math.atan2(mouse.y-py,mouse.x-px);        
                
        let pk = planet.k * planet.ks;

        /*

        for(let i in planet.lay_out){
            let k = planet.lay_out[i]+pk;
            _renderTexture(gx,txr2d.planet,k,r,px,py);
        }
        
        for(let i in planet.lay_in){
            let k = planet.lay_in[i]+pk;
            _renderTexture(gx,txr2d.details,k,r,px,py);
        }

        */

        let tc = this.cache[planet.hash];
        if (tc===undefined){
            tc = _bakePlanet(planet)
            this.cache[planet.hash] = tc;
        }

        _renderTexture(gx,tc,pk,r,px,py);

        gx.globalCompositeOperation = "darken";
        _renderTexture(gx,txr2d.light,this.klight,r,px,py);
        gx.globalCompositeOperation = "source-over";

        for(let i in planet.items){
            this._renderItem(px,py,pk,r,planet.items[i]);
        }

    }


    EndScene(){

    }
}