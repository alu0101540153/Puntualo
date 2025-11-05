import express from 'express' // sintaxis de ESM
import cors from 'cors'
import 'dotenv/config';
import router from './router';
import { connectDB } from './config/db';
import { corsConfig } from './config/cors';
connectDB()


const app = express();

// cors
app.use(cors(corsConfig))

// read form data
app.use(express.json())


app.use('/', router)  // 

export default app