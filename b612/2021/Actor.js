//const JUMP_STRENGTH = 3;
const JUMP_STRENGTH = 6;
const DUMP_VELOCITY = 0.999;

const CLR_SHADOW = [0x37/256.0, 0x18/256.0, 0x42/256.0];


class EfShadow extends Effect {
    static instance = new EfShadow();
    Apply(go){

        // haxor workaround
        if (go.behaviour instanceof BeaJump){
            super.Apply(go);
            return;
        }

        const planet = getPlanet(go);

        // once standing on planet - compute its shadow
        if (planet instanceof GoPlanet){
            let c = Math.cos(go.rotation-planet.lightRotation+Math.PI*0.2);
            c = c*0.5+0.5; // arbitrary
            let c1 = 1.0-c;
            go.renderer.cmul = [c,c,c,1];
            go.renderer.cadd = [CLR_SHADOW[0]*c1,CLR_SHADOW[1]*c1,CLR_SHADOW[2]*c1,0];
        }

        // once standing on another actor - steal its look
        if (planet instanceof GoActor){
            go.renderer.cmul = planet.renderer.cmul;
            go.renderer.cadd = planet.renderer.cadd;
        }
    }
}

class EfBlink extends Effect {
    Apply(go){        
        let c = Math.cos(go.globalRotation);
        c = Math.pow(c,100)*0.5;
        //go.renderer.cmul = [1-c,1-c,1-c,1];
        go.renderer.cmul = [1,1,1,1];
        go.renderer.cadd = [c,c,c,0];
    }
}

class BeaStand {
    constructor(planet,angle){
        //log("BeaStand",planet);
        this.angle = angle;
        this.planet = planet;
        if (planet instanceof GoPlanet) planet.kick();
    }
    Update(go){
        const planet = this.planet;
        const k = planet.globalRotation+this.angle;
        const r = planet.radius + go.radius; 
        const x = planet.globalPosition.x+Math.cos(k)*r;
        const y = planet.globalPosition.y+Math.sin(k)*r;
        go.position = {x:x,y:y};
        go.rotation = k+Math.PI*0.5;        
        if (planet instanceof GoActor){
            if (getPlanet(planet)===go){
                return new BeaJump(go,planet,undefined);
            }
        }
    }
    get planetLocation(){
        return this.planet;
    }    
}

function vector(p1,p2){    
    return {x:p2.x-p1.x, y:p2.y-p1.y};
}

function lenSq(v){
    return v.x*v.x+v.y*v.y;
}

const PI2 = Math.PI*2;
function clampi(r){
    return (r%PI2+PI2)%PI2;
}

class BeaJump {
    constructor(actor,p1,p2){
        //console.log("BeaJump",actor,p1,p2);
        this.p1 = p1;
        this.p2 = p2;
        const k = actor.globalRotation-Math.PI*0.5;
        this.v = {x:Math.cos(k)*JUMP_STRENGTH, y:Math.sin(k)*JUMP_STRENGTH};

        let line = vector(p1.globalPosition,actor.globalPosition);
        let angle = Math.atan2(line.y,line.x);
        //console.log("jump:",clampi(angle),"k:",clampi(k),"agr:",clampi(actor.globalRotation));
        if (p1 instanceof GoPlanet) p1.kick();
    }
    get planetLocation(){
        return this.p1;
    }    
    Update(go){
        const v = this.v;
        const p = go.globalPosition
        let x = p.x+v.x*0.5;
        let y = p.y+v.y*0.5;
        //if (y>800 || y<0 || x<0 || x>800){
        //    return new BeaStand(this.p1,_randomAngle());
        //}
        if (x>800) x-=800;
        if (x<0) x+=800;
        if (y>800) y-=800;
        if (y<0) y+=800;
        go.position = {x:x,y:y};
        let dist = vector(go.globalPosition,(this.p2||this.p1).globalPosition);
        let d = Math.sqrt(lenSq(dist))
        let f = {x:dist.x/d, y:dist.y/d};
        let cf = this.p2?0.1:0.05;
        this.v.x = this.v.x*DUMP_VELOCITY + f.x*cf;
        this.v.y = this.v.y*DUMP_VELOCITY + f.y*cf;
        
        let min_d = 100000;
        let target_angle = undefined;
        for (let g of GameObject.collection){
            if (g.radius<0) continue;
            if (g===go) continue;            
            let line = vector(g.globalPosition,go.globalPosition);
            let dist = Math.sqrt(lenSq(line));
            if (dist<=go.radius+(g.orgRadius||g.radius) && (g instanceof GoPlanet || g.behaviour instanceof BeaStand) ){
                let angle = Math.atan2(line.y,line.x);
                //console.log("stand:",clampi(angle));
                return new BeaStand(g,angle-g.globalRotation);
            }
            if (g!==this.p1 && g instanceof GoPlanet && dist<min_d && dist<=(go.radius+g.radius)*2){
                min_d = dist
                this.p2 = g;
                let angle = Math.atan2(line.y,line.x);
                target_angle = angle + Math.PI*0.5; //-g.globalRotation-Math.PI*2;
                //console.log("---",g);
            }
        }
        if (target_angle!==undefined){
            let r1 = clampi(go.rotation);
            let r2 = clampi(target_angle);
            let d1 = r2-r1;
            let d2 = r2-Math.PI*2-r1;
            let rd = Math.abs(d1)<Math.abs(d2)?r2:(r2-Math.PI*2);
            go.rotation = lerp(r1, rd, 0.05);
        }
        
    }
}

function lerp(a,b,c){
    return a*(1.0-c)+b*c;
}

class GoActor extends GameObject {
    constructor(name){
        super();        
        this.renderer = new RenderSprite(name);
        this.scale = 0.7;
        this.height = rx.texas[name].height*this.scale;
        this.radius = this.height*0.5;
        this.effect = EfShadow.instance;
    }
    spawnAtPlanet(planet,angle){        
        this.behaviour = new BeaStand(planet,angle);
    }
    jump(){ 
        this.jumpTo(undefined);
    }
    jumpTo(planet){
        if (this.behaviour instanceof BeaJump){

        }else{
            this.behaviour = new BeaJump(this,this.behaviour.planetLocation,planet);
        }
    }

}
