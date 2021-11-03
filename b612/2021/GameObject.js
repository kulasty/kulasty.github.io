"use strict";

class Effect {
    static instance = new Effect();
    Apply(go){
        go.renderer.cmul = [1,1,1,1];
        go.renderer.cadd = [0,0,0,0];
    }
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
