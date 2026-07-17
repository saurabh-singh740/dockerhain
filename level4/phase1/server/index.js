import express from "express"
import dotenv from "dotenv"

dotenv.config()

const port=process.env.PORT || 3000

const app=express()

app.get('/',(req,res)=>{
    res.status(200).json({
        message :`hello from ${process.env.SERVER_NAME} server`
    })
})

app.listen(port,()=>{
    console.log("server is running on port 3000")
})