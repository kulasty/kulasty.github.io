class GameObjectController extends GameObject {
    Update(actor){

    }
}

class GocFollow extends GameObjectController{
    constructor(whom){
        super();
        this.whom = whom;
        this.addHandler(GameEvent.TOUCHDOWN, this.on_touchdown);

        this.paths = [];
    }
        
    on_touchdown(me,params){
        let actor = params.that;
        let src = getTruePlanet(actor);
        let dst = getTruePlanet(me.whom);
    }

    Update(actor){
        if (actor.behaviour instanceof BeaStand == false){
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
                let astar = staratlas[actor.name];
                for(let tries = 0; tries<3; tries++){
                    paths = astar.getPaths(src,dst);
                    if (paths.length!=0){
                        break;
                    }
                    dst = planets[Math.floor(MathEx.randRange(0,planets.length))];
                }
                this.paths = paths;
            }
        }
        // ups, still blocked?
        if (paths.length==0){
            // ups? jump? wait?
            actor.jump();
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
