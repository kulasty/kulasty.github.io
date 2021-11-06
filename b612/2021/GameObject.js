"use strict";

const V4_SOLIDWHITE = [1,1,1,1];
const V4_TRANSBLACK = [0,0,0,0];

class Effect {
    static instance = new Effect();
    constructor(){        
        this.cmul = V4_SOLIDWHITE;
        this.cadd = V4_TRANSBLACK;
        this.blur = 0.;
    }
    Apply(go){
        go.renderer.cmul = this.cmul;
        go.renderer.cadd = this.cadd;
        go.renderer.blur = this.blur;
    }
}

class GameEvent {
    static TOUCHDOWN = "touchdown";
    static JUMP = "jump";
}

let GLOBAL_HASHID = 0;

class GameObject {

    toString(){
        return this.hashid 
    }

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
        GLOBAL_HASHID+=1;
        this.hashid = this.constructor.name + GLOBAL_HASHID;
        this.scale = 1;
        this.position = {x:0,y:0};
        this.rotation = 0;
        this.z_1 = 1;
        this.relativeRotation = 0;
        this.radius = -1;        
        this.eventHandlers = {}
        this.effect = Effect.instance;
        this.queue = []
        this.controller = undefined;
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
            if (this.controller!==undefined){
                this.controller.Handle(event_type,{that:this, ep:event_params});
            }
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
                console.log("HandleEvent:",event_type,"Handler:",eh,"Exception:",e)
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
        if (this.controller!==undefined){
            this.controller.Update(this);
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
