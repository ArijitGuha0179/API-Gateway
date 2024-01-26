const express=require("express");
const app=express();
const routes=require("./routes");
const helmet=require('helmet')
const registry=require('./routes/registry.json');
const PORT=process.env.PORT || 5000;

app.use(express.static('public'))
app.set('view engine','ejs')
app.use(express.json());
app.use(helmet());
//authentication
const auth=(req,res,next)=>{
    const url=req.protocol+'://'+req.hostname+':'+PORT+'/'+req.path;
    const authstring=Buffer.from(req.headers.authorization,'base64').toString('utf-8');//'name:password'
    const arr=authstring.split(":");
    const username=arr[0];
    const password=arr[1];
    console.log(username+':'+password);
    const user=registry.auth.users[username]
    if(user){
        if(user.username===username && user.password===password){
                next()
        }else{
            res.send({authenticated:false,path:url,message:`Incorrect Password`});
        }
    }else{
        //authenticated,path,message
        res.send({authenticated:false,path:url,message:`Authentication Unsuccessful :${username} doesn't exsists` });
    }
   
}
app.get('/',(req,res)=>{
    res.render('index',{services:registry.services});
})
app.use(auth);
app.use('/',routes);



app.listen(PORT,()=>{
    console.log(`Server running on Port ${PORT}`);
})