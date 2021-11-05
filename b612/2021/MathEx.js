"use strict";

const PI2 = Math.PI*2.0;
const PI05 = Math.PI*0.5;

class MathEx {  

    static vector(p1,p2){    
        return {x:p2.x-p1.x, y:p2.y-p1.y};
    }
    
    static vlengthSq(v){
        return v.x*v.x+v.y*v.y;
    }
    
    static vlength(v){
        return Math.sqrt(v.x*v.x+v.y*v.y);
    }
    
    static clampi(r){
        return (r%PI2+PI2)%PI2;
    }
    
    static lerp(a,b,c){
        return a*(1.0-c)+b*c;
    }

    static randomAngle(){
        return Math.random()*PI2;
    }

    static randRange(x1,x2){
        return Math.random()*(x2-x1)+x1;
    }

    static angleDelta(a1,a2){
        const r1 = MathEx.clampi(a1);
        const r2 = MathEx.clampi(a2);
        const r2a = r2+PI2;
        const r2b = r2-PI2;
        let d = Math.abs(r2-r1);
        const da = Math.abs(r2a-r1);
        const db = Math.abs(r2b-r1);
        let rd = r2;
        if (da<d || db<d){
            rd = da<db  ? r2a : r2b;
            d = da<db ? da: db;
        }
        return [d,rd];
    }
}

