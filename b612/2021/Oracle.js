"use strict";

class Oracle {

    static getDestination(go,MAX_SECONDS = 2){
        let obj = new GameObject();
        obj.position = {...go.globalPosition};
        obj.radius = go.radius;
        go.radius = -1; // HAXOR
        obj.rotation = go.globalRotation;
        
        let beh = new BeaJump(obj,getPlanet(go),undefined);
        if (go.behaviour instanceof BeaJump){
            beh.v = {...go.behaviour.v};
        }

        try{
            const MAX_STEPS = MAX_SECONDS * (1000/time_step); 
            for(let step=0;step<MAX_STEPS;step++){
                let be = beh.Update(obj);
                if (be!==undefined && be!==beh && be instanceof BeaStand && be.planet !== go){
                    return {dst:be.planet,steps:step};
                }
            }
            //console.log('getDestination() exhausted!',MAX_STEPS);
            return {dst:undefined,steps:MAX_STEPS};
        }finally{
            go.radius = obj.radius;
        }
    }

    static getJumpPathPrediction(go,duration,dt){
        let obj = new GameObject();
        obj.position = {...go.globalPosition};
        obj.radius = go.radius;
        obj.rotation = go.globalRotation;
        
        let beh = new BeaJump(obj,getPlanet(go),undefined);
        if (go.behaviour instanceof BeaJump){
            beh.v = {...go.behaviour.v};
        }
        let step = 0, time = 0;
        let capture = [];
        while(duration>0){            
            duration-=time_step;
            step+=time_step;
            time+=time_step;
            let be = beh.Update(obj);            
            if (step>=dt){
                capture.push({p:obj.globalPosition, t:time})
                step-=dt;
            }                        
            if (be!==undefined && be!==beh && be.planet!==go){
                break;
            }
        }
        return capture;
    }

    static getOmniJumpPathPrediction(go,duration,dt){
        let capture = [];
        const NUM_RAD = 48;
        const planet = getPlanet(go);
        for(let i=0;i<NUM_RAD;i++){
            let tduration = duration;

            const k = (i*PI2)/NUM_RAD;
            const r = planet.radius + go.radius; 
            const x = planet.globalPosition.x+Math.cos(k)*r;
            const y = planet.globalPosition.y+Math.sin(k)*r;

            let obj = new GameObject();           
    
            obj.position = {x:x,y:y};
            obj.radius = go.radius;
            obj.rotation = k+PI05; // simulate BeaStand
            
            let beh = new BeaJump(obj,getPlanet(go),undefined);
            if (go.behaviour instanceof BeaJump){
                beh.v = {...go.behaviour.v};
            }
            let step = 0, time = 0;            
            while(tduration>0){            
                tduration-=time_step;
                step+=time_step;
                time+=time_step;
                let be = beh.Update(obj);            
                if (step>=dt){
                    capture.push({p:obj.globalPosition, t:time})
                    step-=dt;
                }                        
                if (be!==undefined && be!==beh && be.planet!==go){
                    break;
                }
            }
            
        }
        return capture;
   }
  
}