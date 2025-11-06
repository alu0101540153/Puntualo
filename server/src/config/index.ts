import {config} from 'dotenv'

if(process.env.NODE_ENV !== 'production'){
  config();
}

export const PORT = process.env.PORT;
// Por defecto conecta al localhost si no se provee MONGO_URI en el .env
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';