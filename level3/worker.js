import { Queue, Worker } from "bullmq";
import  Redis  from "ioredis"
import sendemail from "./DB/sendemail.js";

const connection=new Redis(process.env.REDIS_URL,{
    maxRetriesPerRequest:null
})

const worker=new Worker("emailQueue",async(job)=>{
    const email=job.data.email
    await sendemail(email)

},{connection})