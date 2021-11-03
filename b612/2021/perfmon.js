"use strict";

class PerfMon {
    constructor(){
        this.reset();
    }
    watch(metric, t1){
        this.metrics[metric].push(this.time-t1);
    }
    reset(){
        this.metrics = {ph:[],rx:[],ts:[],gl:[]};
    }
    get time(){
        return performance.now();
    }

    static average(array){    
        if (!array.length) { return -1; }
        const accu = sum(array);
        return Math.round(accu*1000.0/array.length);
    }
    
    static sum(array){
        if (!array.length) { return -1; }
        let accu = 0;
        for(let a of array){
            accu+=a;
        }
        return accu;
    }

}