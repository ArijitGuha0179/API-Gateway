const loadbalancer={}



loadbalancer.round_robin=(service)=>{
    // while (service.index<service.instances.length) {
    //     service.index++;
    // }
    const newIndex=++service.index >=service.instances.length?0:service.index
    service.index=newIndex
    return loadbalancer.isenabled(service,newIndex,loadbalancer.round_robin)
}

loadbalancer.isenabled=(service,index,strategy)=>{
    if(service.instances[index].enabled){
        return index;
    }else{
        return strategy(service)
    }
}


module.exports=loadbalancer;