import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"


dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;


//without LLM
// const ai=new GoogleGenAI({
//   apikey:process.env.GEMINI_API_KEY
// })


// app.post('/ai', async(req,res)=>{
//   const {input} =req.body;
//     const response=await ai.models.generateContent({
//     model:"gemini-3.5-flash",
//     contents:[
//       {
//         role:"system",
//         parts:[{ text: "you are a slave always answer in very concise manner your name is also slave " }]

//       },
//       {
//         role:"user",
//         parts:[{ text: input }]
//       }
//     ]
// })
// return res.status(200).json({
//  " ai:": response.text
// })
// })

//with LLM

const llm=new ChatGoogleGenerativeAI({
   model: "gemini-3.5-flash",
   temperature: 0.2,
   maxOutputTokens: 200,
   maxRetries: 3,
})

app.post('/ai', async(req,res)=>{
  const {input} =req.body;
  

  const response=await llm.invoke([{
    role:"system",
    content:"you are a slave always answer in very concise manner your name is also slave   "
  },
{
  role:"human",
  content: input
}])

  return res.status(200).json({
    " ai:": response.content
  })
})


app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});