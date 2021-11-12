"use strict";

class GameObjectController extends GameObject {
    Update(actor){

    }
}

class GocFollow extends GameObjectController{
    constructor(whom){
        super();
        this.whom = whom;
        //this.addHandler(GameEvent.TOUCHDOWN, this.on_touchdown);

        this.paths = [];
        this.triggerTick = 0;
    }
        
    on_touchdown(me,params){
        let actor = params.that;
        let src = getTruePlanet(actor);
        let dst = getTruePlanet(me.whom);
    }

    Update(actor){
        // if not standing - nothing to do, apparently flying already
        if (actor.behaviour instanceof BeaStand === false){
            return;
        }

        if (this.triggerTick>0 && perfmon.time>this.triggerTick){
            this.triggerTick = 0;
            actor.jump();
            return;
        }

        let src = getTruePlanet(actor);
        let dst = getTruePlanet(this.whom);
        if (dst===src){
            return;
        }

        let paths = this.paths;
        // look for paths a.k.a lazy init
        if (paths.length==0){
            if (src!==undefined && dst!==undefined){
                let astar = actor.navMap;
                for(let tries = 0; tries<3; tries++){
                    paths = astar.getPaths(src,dst);
                    if (paths.length!=0){
                        break;
                    }
                    const planets = Game.currentGame.planets;
                    dst = planets[Math.floor(MathEx.randRange(0,planets.length))];
                }
                this.paths = paths;
            }
        }
        // ups, still blocked?
        if (paths.length==0){
            // ups? jump? wait?
            //actor.jump();
            this.triggerTick = perfmon.time + Math.random()*500+100;
            return;
        }

        // some paths here
        var angActor = MathEx.clampi(actor.rotation-PI05);
        for(let seg of paths){
            let [k1,k2] = seg;
            if (angActor>k1 && angActor<k2){
                actor.jump();
                this.paths = [];
            }
        }
    }
}
