import express from "express";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import fs, { readFileSync } from "fs"
import e from "express";
import { PDFParse } from "pdf-parse";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import {QdrantVectorStore} from "@langchain/qdrant"
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters"
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;



const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.2,
  maxRetries: 3,
})



const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});
const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "grocery store",
});

const upload=async()=>{
  const pdfpath="./grocery.pdf"
  const buffer=fs.readFileSync(pdfpath)
  const pdfresult=new PDFParse({data:buffer})
  const result= await pdfresult.getText()
  const text=result.text
  const spilitters=new RecursiveCharacterTextSplitter({
    chunkSize:1000
  })
  const docs=await spilitters.createDocuments([text])
  console.log(docs)
  vectorStore.addDocuments(docs)

}

app.post("/ai", async (req, res) => {
  const { input } = req.body;
  const docs= await vectorStore.similaritySearch(input,5)
  const context=docs.map((d)=>d.pageContent).join("/n")
  const response=await llm.invoke([
   new SystemMessage(`you are a rag ai assistant
    Strict Rules:
    -Answer only from context
    - do not use outside knowledge
    - if answer not found say i dont know from uploaded pdf
    context:${context}
    `),
    new HumanMessage(input)
  ])
  return res.status(200).json({ai: response.content});
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
