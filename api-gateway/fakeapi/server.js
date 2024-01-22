const express=require('express')
const app=express()
const axios=require('axios')

app.use(express.json())
app.get('/fakeapi',(req,res,next)=>{
    res.send('Hello from fakeapi....')
})

app.post('/bogusapi',(req,res,next)=>{
    res.send('Hello from bogusapi....')
})

const PORT=process.env.PORT || 5002;
const HOST="localhost";
app.listen(PORT,()=>{
    axios({
        method : 'POST',
        url : 'http://localhost:5000/register',
        headers: {'Content-Type':'application/json'},
        data: {
            apiName: "testapi",
            protocol:"http",
            host: HOST,
            port: PORT,
        }
    })
    .then((response)=>{
       console.log(response.data);
   })
    console.log(`Fake api running on Port ${PORT}`);
})