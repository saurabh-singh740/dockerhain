import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  Annotation,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { ChatGroq } from "@langchain/groq";
import e from "express";

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
const tool = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

const tools = [tool];
const toolnode = new ToolNode(tools);

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.2,
  maxRetries: 3,
}).bindTools(tools);

// app.post('/ai', async(req,res)=>{
//   const {input} =req.body;

const callLLM = async (State) => {
  const response = await llm.invoke([
    {
      role: "system",
      content: `You are Aurora. You MUST call the search tool for EVERY question without exception. Never answer from memory. Always search first, then respond in plain text only. No markdown, no bold, no symbols`,
    },
    ...State.messages,
  ]);
  console.log("response", response.tool_calls);
  return { messages: [response] };
};
// return res.status(200).json({
//   " ai:": response.content
// })
//}

const ShouldContinue = (state) => {
  const lastmessage = state.messages[state.messages.length - 1];
  if (lastmessage.tool_calls.length > 0) {
    return "tools";
  } else {
    return "__end__";
  }
};

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", callLLM)
  .addNode("tools", toolnode)
  .addEdge("__start__", "agent")
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", ShouldContinue)
  .compile();

app.post("/ai", async (req, res) => {
  const { input } = req.body;
  const response = await graph.invoke({
    messages: [
      {
        role: "human",
        content: input,
      },
    ],
  });
  console.log("response", response);
  return res.status(200).json({
    ai: response.messages[response.messages.length - 1].content,
  });
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
