class RenderPlanet {
    static instance = new RenderPlanet();

    constructor(){
        // outer layers
        var num_lay = 1+Math.round(Math.random()*3);
        if (num_lay){
            var k =[];
            var df = (Math.PI)/num_lay;
            for(let i=0;i<num_lay;i++){
                let f=(Math.PI*2.0*i)/num_lay - df*0.5 + Math.random()*df;
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
                let f=(Math.PI*2.0*i)/num_lay - df*0.5 + Math.random()*df;
                k.push(f);
            }
            this.lay_in = k;
        }

        this.tex = undefined;
    }
    
    Render(go){
        if (this.tex===undefined){
            this.tex = xgl_createTexture(rx.gx,_bakePlanet(this));
        }
        rx.RenderPlanet(go,this.tex);
    }
}

class BhPlanet {
    static instance = new BhPlanet();

    constructor(){
        this.k = _randomAngle();         
        let ksign = Math.random()>0.5?-1.0:1.0;
        this.kv = (1.0+Math.random())*0.01*ksign; 
        this.ks = ksign;
        this.kkick = 0;
    }

    Update(go){                
        this.k+=this.kv;
        const sk = (getTime() - this.kkick)/1000.0*Math.PI*2;
        const s = Math.sin(sk*20)*1.0/Math.exp(sk);
        go.scale = go.orgScale * (1+s*0.1);
        go.radius = go.orgRadius * (1+s*0.1);
        go.rotation = this.k;
        return this;
    }

    kick(){
        this.kkick = getTime();
    }
}


class GoPlanet extends GameObject {
    constructor(seed,px,py){        
        super();
        Math.seedrandom(seed);        
        this.position = {x:px, y:py};
        this.radius = randRange(110-50,110)*0.5;
        this.orgScale = this.radius/110.0;
        this.orgRadius = this.radius;
        this.scale = this.orgScale;
        this.renderer = new RenderPlanet();
        this.behaviour = new BhPlanet();
        this.lightRotation = 0;
    }
    kick(){
        this.behaviour.kick();
    }        
}

