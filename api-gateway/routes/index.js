const express=require('express');
const router=express.Router();
const axios=require('axios')
const registry=require('./registry.json')
const fs=require('fs');
const loadbalancer=require('../util/loadbalancer.js');

router.post('/enable/:apiName',(req,res)=>{
    const apiName=req.params.apiName;
    const requestbody=req.body;
    const instances=registry.services[apiName].instances;
    const Index=instances.findIndex((inst)=>{
        return inst.url===requestbody.url
    });
    if(Index==-1){
        res.send(`Couldn't find the index for ${requestbody.url} for service ${apiName}`);
    }else{
        instances[Index].enabled=requestbody.enabled;
        fs.writeFile('./routes/registry.json',JSON.stringify(registry),(error)=>{
            if(error){
                res.send(`Could not enable/disable for url ${requestbody.url} for service ${apiName}`+error);
            }else{
                res.send(`Enabled/disabled for url ${requestbody.url} for service ${apiName}`);
            }
        });

    }
})

router.all('/:apiName/:path',(req,res) => {
    // console.log(req.params.apiName);
    // console.log(registry.services[req.params.apiName].url+req.params.path);
    const service=registry.services[req.params.apiName]
    if(service){
        if(!service.strategy){
            service.strategy='round_robin';
            fs.writeFile('./routes/registry.json',JSON.stringify(registry),(error)=>{
                if(error){
                    res.send(`Could write loadbalancer strategy`+error);
                }
            });
        }
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
        registry.services[registrationinfo.apiName].instances.push({...registrationinfo })
     
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
        const index=registry.services[registrationinfo.apiName].instances.findIndex((instance)=>{
            return registrationinfo.url===instance.url
        })
        registry.services[registrationinfo.apiName].instances.splice(index,1);
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
    registry.services[registrationinfo.apiName].instances.forEach(instance => {
        if(instance.url===registrationinfo.url){
            flag=true;
            return;//basically works like a break
        }
    });
    return flag;
}
module.exports=router;