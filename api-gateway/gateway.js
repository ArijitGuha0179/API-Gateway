const express=require("express");
const app=express();
const routes=require("./routes");
const helmet=require('helmet')


app.use(express.json());
app.use('/',routes);
app.use(helmet());
const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server running on Port ${PORT}`);
})