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
}