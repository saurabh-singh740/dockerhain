import express, { json } from "express"
import dotenv from "dotenv"
import connectdb from "./DB/db.js"
import mongoose from "mongoose"
import User from "./model/user.model.js"
import Redis from "ioredis"
import ratelimiter from "./middleware/ratelimit.js"
import emailQueue from "./queue.js"


dotenv.config()



const port =process.env.PORT || 5000


const app=express()

export const redis=new Redis(process.env.REDIS_URL)
app.use(express.json())

app.get('/',ratelimiter,(req,res)=>{
    res.status(200).json({
        message:"hello from level 3 "
    })
})

    

app.post('/create',async(req,res)=>{
    
    const{name,email,password}=req.body

    await redis.del("redis:all")

    const user= await User.create({

        name,email,password

    })
    return res.json(user)

})//without redis 115ms

app.get('/getdata',ratelimiter,async(req,res)=>{
    const user = await User.find({})
    await emailQueue.add("send-email",{email})
    return res.json(user)
})


app.get('/getredis',async(req,res)=>{
    const cached = await redis.get("redis:all")
    if (cached){
        const user=JSON.parse(cached)
        return res.json(user)
    }
    const user = await User.find({})
    await redis.set("redis:all",JSON.stringify(user))
    return res.json(user)
})



app.listen(port,()=>{
    connectdb()
    console.log("server is runnig on port 5000")
})