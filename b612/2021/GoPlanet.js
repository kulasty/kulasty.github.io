"use strict";

class RenderPlanet {
    static instance = new RenderPlanet();

    constructor(){

        this.cmul = V4_SOLIDWHITE;
        this.cadd = V4_TRANSBLACK;

        // outer layers
        var num_lay = 1+Math.round(Math.random()*3);
        if (num_lay){
            var k =[];
            var df = (Math.PI)/num_lay;
            for(let i=0;i<num_lay;i++){
                let f=(PI2*i)/num_lay - df*0.5 + Math.random()*df;
                k.push(f);            
            }        
            this.lay_out = k;
        }

        // inner layers
        var num_lay = Math.round(Math.random()*4);
        if (num_lay){
            var k =[];
            var df = (Math.PI)/num_lay;
            for(let i=0;i<num_lay;i++){
                let f=(PI2*i)/num_lay - df*0.5 + Math.random()*df;
                k.push(f);
            }
            this.lay_in = k;
        }

        this.tex = undefined;
    }
    
    Render(go){
        if (this.tex===undefined){
            this.tex = xgl_createTexture(renderContext.gx,_bakePlanet(this));
            return;
        }
        renderContext.RenderQuad2(
            [this.tex, renderContext.texas.light],
            {...go.globalPosition,_z: go.z_1},
            go.scale,
            [go.globalRotation,go.lightRotation],
            this.cmul,this.cadd,this.blur,
            BLEND_NORMAL
        );

    }
}

class BhPlanet {
    static instance = new BhPlanet();

    constructor(){
        this.k = 0;//MathEx.randomAngle();         
        let ksign = Math.random()>0.5?-1.0:1.0;
        this.kv = (1.0+Math.random())*0.01*ksign; 
        this.ks = ksign;
        this.kkick = 0;        
    }

    Update(go){                
        this.k+=this.kv;
        const sk = (perfmon.time - this.kkick)/1000.0*PI2;
        const s = Math.sin(sk*20)*1.0/Math.exp(sk);
        go.scale = go.orgScale * (1+s*0.1);
        go.radius = go.orgRadius * (1+s*0.1);
        go.rotation = this.k;
        return this;
    }

    kick(){
        this.kkick = perfmon.time;
    }
}


class GoPlanet extends GameObject {
    constructor(seed,px,py){        
        super();
        Math.seedrandom(seed);        
        this.position = {x:px, y:py};
        this.radius = MathEx.randRange(110-50,110)*0.5;
        this.orgScale = this.radius/110.0;
        this.orgRadius = this.radius;
        this.scale = this.orgScale;
        this.renderer = new RenderPlanet();
        this.behaviour = new BhPlanet();
        this.lightRotation = 0;

        this.eventHandlers[GameEvent.TOUCHDOWN] = [
            function(that){
                that.kick();
            }
        ];
        this.eventHandlers[GameEvent.JUMP] = [
            function(that){
                that.kick();
            }
        ];

        // initial setup
        this.Update();
    }
    kick(){
        this.behaviour.kick();
    }        
}

