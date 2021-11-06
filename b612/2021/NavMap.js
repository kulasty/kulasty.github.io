class NavMap{

    constructor(){
        this.maps = new Map();
    }

    getDestination(planet,angle){
        angle = MathEx.clampi(angle);
        let map = this.maps[planet];        
        if (map===undefined){
            return undefined;
        }
        let prev = undefined;
        for(let dst of map){
            if (dst.k>=angle){
                return prev;
            }
            prev = dst;
        }
        return undefined;
    }

    _spawn(actor,planet,angle){
        actor.spawnAtPlanet(planet,angle);
        actor.Update();
        return Oracle.getDestination(actor,10);
    }
    
    process(planets,who){
        console.log("map universe : enter");
        let t1 = perfmon.time;
        let planetindex = function(p){
            for(let i in planets){
                if (planets[i]===p) return i;
            }
            return -1;
        }

        for(let i in planets){            
            let p = planets[i];
            let k = 0;
            let map = [];
            let last = undefined;
            while(k<PI2){
                let dst = this._spawn(who,p,k);
                if (last===undefined || (last.dst!=dst.dst && last.steps!=dst.steps )){
                    map.push({...dst,k:k});
                }
                last = dst;
                //map.push({...dst,k:k});
                k+=PI2/1440;
                //k+=PI2/120;
            }
            last = {...map[0]};
            last.k = last.k+PI2;
            map.push(last);
            this.maps[p] = map;            
        }

        // HAXOR
        for(let p of planets){
            p.queue = []; 
        }
        let t2 = perfmon.time;
        console.log("map universe : exit",t2-t1);
    }

    getPaths(src,dst){
        let paths = [];
        let map = this.maps[src];
        if (map!==undefined){
            for(let i=0;i<map.length-1;i++){
                const hit = map[i].dst;
                if (hit===undefined || hit===dst){
                    paths.push([map[i].k,map[i+1].k]);
                }
            }
        }
        return paths;
    }
}
