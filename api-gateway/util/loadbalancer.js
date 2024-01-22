const loadbalancer={}



loadbalancer.round_robin=(service)=>{
    // while (service.index<service.instances.length) {
    //     service.index++;
    // }
    const newIndex=++service.index >=service.instances.length?0:service.index
    service.index=newIndex
    return newIndex
}



module.exports=loadbalancer;