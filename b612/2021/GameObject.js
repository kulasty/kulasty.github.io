"use strict";

const V4_SOLIDWHITE = [1,1,1,1];
const V4_TRANSBLACK = [0,0,0,0];

class Effect {
    static instance = new Effect();
    Apply(go){
        go.renderer.cmul = V4_SOLIDWHITE;
        go.renderer.cadd = V4_TRANSBLACK;
    }
}

class GameEvent {
    static TOUCHDOWN = "touchdown";
    static JUMP = "jump";
}

class GameObject {

    static RenderAll(collection){
        for(let go of collection){
            go.Render();
        }
    }

    static UpdateAll(collection){
        for(let go of collection){
            go.Update();
        }
    }

    constructor(){
        this.scale = 1;
        this.position = {x:0,y:0};
        this.rotation = 0;
        this.z_1 = 1;
        this.relativeRotation = 0;
        this.radius = -1;        
        this.eventHandlers = {}
        this.effect = Effect.instance;
        this.queue = []
    }

    get globalScale(){
        return this.scale;
    }

    get globalPosition(){
        // fixme: copy
        let p = {x:this.position.x, y:this.position.y};
        return p;
    }

    get globalRotation(){
        return this.rotation;
    }

    Schedule(event_type, event_params){
        this.queue.push([event_type,event_params]);
    }

    DispatchAll(){
        while(this.queue.length){
            let [event_type,event_params] = this.queue.shift();
            this.Handle(event_type, event_params);
        }
    }

    Handle(event_type, event_params){
        let eventHandler = this.eventHandlers[event_type];
        if (eventHandler === undefined){
            return;
        }
        if (eventHandler instanceof Array){
        }else{
            eventHandler = [eventHandler];
        }
        for(let eh of eventHandler){
            try{
                eh(this,event_params);
            }catch(e){
                console.log(event_type,eh,e)
            }
        }
    }

    addHandler(event_type, foo){
        let eventHandler = this.eventHandlers[event_type];
        if (eventHandler === undefined){
            this.eventHandlers[event_type] = [foo];
        }else{
            eventHandler.push(foo);
        }        
    }

    Update(){        
        if (this.behaviour!==undefined){
            const new_behaviour = this.behaviour.Update(this);
            if (new_behaviour!==undefined && new_behaviour!==this.behaviour){                
                this.behaviour = new_behaviour;                
            }
        }
    }

    Render(){        
        if (this.renderer!==undefined){
            if (this.effect!==undefined){
                this.effect.Apply(this);
            }
            this.renderer.Render(this);
        }
    }
}
