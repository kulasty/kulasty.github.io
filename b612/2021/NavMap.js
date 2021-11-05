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
        for(let dst of map){
            if (dst.k>=angle){
                return dst;
            }
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
            while(k<PI2){
                let dst = this._spawn(who,p,k);
                map.push({...dst,k:k});
                k+=PI2/720;
            }
            this.maps[p] = map;
        }
        let t2 = perfmon.time;
        console.log("map universe : exit",t2-t1);
    }

    getPaths(src,dst){
        let paths = [];
        let map = this.maps[src];
        if (map!==undefined){
            for(let p of map){
                let target = p.dst;
                // are there anything in that direction
                if (target===undefined) continue
                // is that what we want?
                if (target!==dst) continue;
                // yeah!
                paths.push(p);
            }
        }
        return paths;
    }
}
