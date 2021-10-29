function _randomAngle(){
    return Math.random()*Math.PI*2
}


class Effect {
    static instance = new Effect();
    Apply(go){
        go.renderer.cmul = [1,1,1,1];
        go.renderer.cadd = [0,0,0,0];
    }
}

class GameObject {

    static collection = []

    static RenderAll(){
        for(let go of GameObject.collection){
            go.Render();
        }
    }

    static UpdateAll(){
        for(let go of GameObject.collection){
            go.Update();
        }
    }

    constructor(){
        //this.parent = undefined;
        this.scale = 1;
        this.position = {x:0,y:0};
        this.rotation = 0;
        this.zorder = 0;
        this.relativeRotation = 0;
        this.radius = -1;
        GameObject.collection.push(this);
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
        let r = this.rotation;
        if (this.parent!==undefined){
            r+=this.parent.globalRotation;
        }
        return r;
    }

    Update(){        
        if (this.behaviour!==undefined){
            const new_behaviour = this.behaviour.Update(this);
            if (new_behaviour!==undefined){
                this.behaviour = new_behaviour
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
