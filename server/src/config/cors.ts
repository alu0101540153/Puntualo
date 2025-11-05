import { CorsOptions } from "cors";

export const corsConfig : CorsOptions = {
    origin: function(origin, callback){
        const whitelist = [process.env.FRONTEND_URL]
        if(process.argv[2] === '--api'){ // If the API is running, allow undefined origin for local testing
            whitelist.push(undefined)
        }

        if(whitelist.includes(origin)){
            callback(null, true);
        }else{
            callback(new Error('No permitido por CORS'));
        }
    }
}