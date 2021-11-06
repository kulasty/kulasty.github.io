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
        let that = params.that;
        let src = getTruePlanet(that);
        let dst = getTruePlanet(me.whom);

        if (src===undefined){
            //console.log("GcFollow",that.name,"empty src?!")
            return;
        }
        if (dst===undefined){
            //console.log("GcFollow",that.name,"empty dst?!",me.whom,me)
            return;
        }
        //console.log("GcFollow",that.name,src.hashid,"->",dst.hashid);
        if (src!==dst){
            //me.paths = astar.getPaths(src,dst);
            if (me.paths.length==0){
                let delay = Math.floor(MathEx.randRange(600,1600));
                //setTimeout(function(){ that.jump(); } ,delay);    
                //console.log("GcFollow",that.name,"must jump",)
                that.jump();
            }                
        }else{
            //console.log("GcFollow",that.name,"target reached",src.hashid,dst.hashid);
            me.paths = [];
        }
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
                paths = astar.getPaths(src,dst);                
                this.paths = paths;
            }
        }
        // ups, all blocked?
        if (paths.length==0){
            // ups?
            actor.jump();
            return;
        }

        // some paths here
        var angTarget = paths[0].k;
        var angActor = actor.rotation-PI05;
        let [d,a] = MathEx.angleDelta(angTarget,angActor);
        if (d<mind){
            mind = d;
        }
        if (d<0.01){
            actor.jump();
            this.paths = [];
        }
        
    }
}
