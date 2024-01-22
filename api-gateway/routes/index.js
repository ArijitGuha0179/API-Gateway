const express=require('express');
const router=express.Router();
const axios=require('axios')
const registry=require('./registry.json')
const fs=require('fs');
const loadbalancer=require('../util/loadbalancer.js');

router.all('/:apiName/:path',(req,res) => {
    // console.log(req.params.apiName);
    // console.log(registry.services[req.params.apiName].url+req.params.path);
    const service=registry.services[req.params.apiName]
    if(service){
        const newIndex=loadbalancer[service.strategy]
        (service)
        const url=service.instances[newIndex].url;
        console.log(url);
        axios({
            method : req.method,
            url : url+req.params.path,
            headers: req.headers,
            body: req.body
        })
        .then((response)=>{
        res.send(response.data)
       }).catch((error)=>{
        res.send("")
       })
    }else{
        res.send("API Name doesn't exsist....")
    }  
    
})

router.post('/register',(req,res)=>{
    const registrationinfo=req.body;
    registrationinfo.url=registrationinfo.protocol+"://"+registrationinfo.host+":"+registrationinfo.port+"/";
    if(apialreadyexsist(registrationinfo)){
        //return something
        res.send("Already Registered..."+registrationinfo.url+"\n");
    }else{
        registry.services[registrationinfo.apiName].push({...registrationinfo })
     
        fs.writeFile('./routes/registry.json',JSON.stringify(registry),(error)=>{
            if(error){
                res.send(`Could not register..+${registrationinfo.apiName}`+error);
            }else{
                res.send(`Registration successful for ${registrationinfo.apiName}`);
            }
        });
    }
    
})
router.post('/unregister',(req,res)=>{
    const registrationinfo=req.body;
    if(apialreadyexsist(registrationinfo)){
        const index=registry.services[registrationinfo.apiName].findIndex((instance)=>{
            return registrationinfo.url===instance.url
        })
        registry.services[registrationinfo.apiName].splice(index,1);
        fs.writeFile('./routes/registry.json',JSON.stringify(registry),(error)=>{
            if(error){
                res.send(`Could not unregister..+${registrationinfo.apiName}`+error);
            }else{
                res.send(`Unregistration successful for ${registrationinfo.apiName}`);
            }
        });

    }else{
        res.send("API doesn't exsists...")
    }
})

const apialreadyexsist=(registrationinfo)=>{
    let flag=false;
    registry.services[registrationinfo.apiName].forEach(instance => {
        if(instance.url===registrationinfo.url){
            flag=true;
            return;//basically works like a break
        }
    });
    return flag;
}
module.exports=router;