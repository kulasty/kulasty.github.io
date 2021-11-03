"use strict";

class Oracle {

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

            const k = (i*Math.PI*2)/NUM_RAD;
            const r = planet.radius + go.radius; 
            const x = planet.globalPosition.x+Math.cos(k)*r;
            const y = planet.globalPosition.y+Math.sin(k)*r;

            let obj = new GameObject();           
    
            obj.position = {x:x,y:y};
            obj.radius = go.radius;
            obj.rotation = k+Math.PI*0.5;
            
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