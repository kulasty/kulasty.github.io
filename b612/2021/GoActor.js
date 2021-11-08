"use strict";

//const JUMP_STRENGTH = 3;
const JUMP_STRENGTH = 6;
const DUMP_VELOCITY = 0.999;
//const DUMP_VELOCITY = 0.998;

const CLR_SHADOW = [0x37/256.0, 0x18/256.0, 0x42/256.0];


class EfShadow extends Effect {
    static instance = new EfShadow();
    Apply(go){

        // haxor workaround
        if (go.behaviour instanceof BeaJump){
            super.Apply(go);
            go.renderer.blur = 0.6;
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
            go.renderer.blur = 0.;
        }

        // once standing on another actor - steal its look
        if (planet instanceof GoActor){
            go.renderer.cmul = planet.renderer.cmul;
            go.renderer.cadd = planet.renderer.cadd;
            go.renderer.blur = 0.;
        }
    }
}

class EfBlink extends Effect {
    Apply(go){        
        let c = Math.cos(go.globalRotation);
        c = Math.pow(c,100);//*0.5;
        //go.renderer.cmul = [1-c,1-c,1-c,1];
        go.renderer.cmul = [1,1,1,1];
        go.renderer.cadd = [c,c,c,0];
    }
}

class BeaStand {
    constructor(actor,planet,angle){
        //log("BeaStand",planet);
        this.angle = angle;
        this.planet = planet;

        planet.Schedule(GameEvent.TOUCHDOWN,{msg:"as_planet"});
        actor.Schedule(GameEvent.TOUCHDOWN,{msg:"as_actor"});
    }
    Update(go){
        const planet = this.planet;
        const k = planet.globalRotation+this.angle;
        const r = planet.radius + go.radius; 
        const x = planet.globalPosition.x+Math.cos(k)*r;
        const y = planet.globalPosition.y+Math.sin(k)*r;
        go.position = {x:x,y:y};
        go.rotation = k+PI05;
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

class BeaJump {
    constructor(actor,p1,p2){        
        this.p1 = p1;
        this.p2 = p2;
        const k = actor.globalRotation-PI05; // "restore" actual rotation in space
        this.v = {x:Math.cos(k)*JUMP_STRENGTH, y:Math.sin(k)*JUMP_STRENGTH};

        actor.Schedule(GameEvent.JUMP);
        let planet = getPlanet(actor)
        //if (planet instanceof GoPlanet) planet.Schedule(GameEvent.JUMP);
        if (planet !== undefined) planet.Schedule(GameEvent.JUMP);
    }
    get planetLocation(){
        return this.p1;
    }    
    Update(go){        
        const p = go.globalPosition

        // compute new position based on velocity
        let x = p.x+this.v.x*0.5;
        let y = p.y+this.v.y*0.5;
        if (x>800) x-=800; else if (x<0) x+=800;
        if (y>800) y-=800; else if (y<0) y+=800;
        go.position = {x:x,y:y};

        let line = MathEx.vector(p,(this.p2||this.p1).globalPosition);
        let dist = MathEx.vlength(line);
        let f = {x:line.x/dist, y:line.y/dist};
        let cf = this.p2?0.1:0.05; // WTF, how this works??
        this.v.x = this.v.x*DUMP_VELOCITY + f.x*cf;
        this.v.y = this.v.y*DUMP_VELOCITY + f.y*cf;
        if (this.p2!==undefined){
            let angle = Math.atan2(line.y,line.x) - PI05
            const r1 = MathEx.clampi(go.rotation);
            const r2 = MathEx.clampi(angle);
            const r2a = r2+PI2;
            const r2b = r2-PI2;
            const d = Math.abs(r2-r1);
            const da = Math.abs(r2a-r1);
            const db = Math.abs(r2b-r1);
            let rd = r2;
            if (da<d || db<d){
                rd = da<db  ? r2a : r2b;
            }
            go.rotation = MathEx.lerp(r1, rd, 0.05);
        }
        
        let min_d = dist;
        for (let g of Game.currentGame.objects.solid){
            if (g.radius<0) continue;
            if (g===go) continue;            
            let line = MathEx.vector(g.globalPosition,go.globalPosition);
            let dist = MathEx.vlength(line);
            if (dist<=go.radius+(g.orgRadius||g.radius) && (g instanceof GoPlanet || g.behaviour instanceof BeaStand) ){
                let angle = Math.atan2(line.y,line.x);                
                return new BeaStand(go,g,angle-g.globalRotation);
            }
            if (g!==this.p1 && g instanceof GoPlanet && dist<min_d && dist<=(go.radius+g.radius)*2){
            //if (g!==this.p1 && g instanceof GoPlanet && dist<min_d){ // player controll a bit too inconvenient
                min_d = dist
                this.p2 = g;
            }
        }
        
    }
}

class BeaJump2 {
    constructor(actor,p1,p2){
        this.p1 = p1;
        this.p2 = p2;
        const k = actor.globalRotation-PI05;
        this.v = {x:Math.cos(k)*JUMP_STRENGTH, y:Math.sin(k)*JUMP_STRENGTH};
        if (p1 instanceof GoPlanet) p1.kick();
    }
    get planetLocation(){
        return this.p1;
    }    
    Update(go){
        const v = this.v;
        const p = go.globalPosition

        // compute position based on velocity
        let x = p.x+v.x*0.5;
        let y = p.y+v.y*0.5;
        if (x>800) x-=800;
        if (x<0) x+=800;
        if (y>800) y-=800;
        if (y<0) y+=800;
        go.position = {x:x,y:y};

        // compute acceleration based on position
        let line = MathEx.vector(go.globalPosition,(this.p2||this.p1).globalPosition);
        let dist = MathEx.vlength(line);
        let f = {x:line.x/dist, y:line.y/dist};
        let cf = (this.p2===undefined)?0.1:0.05;
        this.v.x = this.v.x*DUMP_VELOCITY + f.x*cf;
        this.v.y = this.v.y*DUMP_VELOCITY + f.y*cf;

        // compute orientation based on target
        if (this.p2!==undefined){
            let angle = Math.atan2(line.y,line.x) - PI05;
            const r1 = MathEx.clampi(go.rotation);
            const r2 = MathEx.clampi(angle);
            const r2a = r2+PI2;
            const r2b = r2-PI2;
            const d = Math.abs(r2-r1);
            const da = Math.abs(r2a-r1);
            const db = Math.abs(r2b-r1);
            let rd = r2;
            if (da<d || db<d){
                rd = da<db ? r2a : r2b;
            }            
            go.rotation = MathEx.lerp(r1, rd, 0.05);
        }


        // find future acceleration        
        let min_d = dist;   
        let target_angle = undefined;
        for (let g of Game.currentGame.objects.solid){
            // ignore objects with radius below 0
            if (g.radius<0) continue;
            // ignore objects that are that particular that we are moving
            if (g===go) continue;

            let line = MathEx.vector(g.globalPosition,go.globalPosition);
            let dist = MathEx.vlength(line) - (g.orgRadius||g.radius);

            // check if we have touchdown
            if (dist<=go.radius && (g instanceof GoPlanet || g.behaviour instanceof BeaStand) ){
                let angle = Math.atan2(line.y,line.x);                
                return new BeaStand(go,g,angle-g.globalRotation);
            }

            // check if this is new acceleration source
            if (g!==this.p1 && g instanceof GoPlanet && dist<min_d){
                min_d = dist
                this.p2 = g;
            }
        }
        
    }
}

class GoActor extends GameObject {
    constructor(name){
        super();        
        this.name = name;
        this.renderer = new RenderSprite(name);        
        this.scale = 0.7;
        this.height = renderContext.texas[name].height*this.scale; // FIXME
        this.radius = this.height*0.5;
        this.effect = EfShadow.instance;
    }
    spawnAtPlanet(planet,angle){        
        this.behaviour = new BeaStand(this,planet,angle);
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
