import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";

dotenv.config();

const port=process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: `hello from ${process.env.SERVER_NAME}`
    })
})

app.use('/auth',proxy('http://auth:3000'))
app.use('/order',proxy('http://order:3001'))
app.use('/product',proxy('http://product:3002'))

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})



