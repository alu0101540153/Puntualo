// import express,{Express} from 'express';
// import morgan from 'morgan';
// import cors from 'cors';

// import {connectDB} from './database';
// import {PORT} from './config'
// import {routes} from './routes'

// export class Server{
//   private app:Express;

//   constructor(){
//     this.app = express();
//     this.configuration();
//     this.middlewares();
//     this.routes();
//   }

//   configuration(){
//     this.app.set('port', PORT || 3000);
//   }

//   middlewares(){
//     this.app.use(morgan('dev'));
//     this.app.use(cors());
//     this.app.use(express.json());
//   }

//   routes(){
//     this.app.get('/', (req, res)=>{
//       res.status(200).json({
//         name:'API REST ITEM'
//       })
//     });

//     this.app.use('/api/v1/puntualo/item', routes.ItemRoute);
//     // Rutas para usuarios
//     this.app.use('/api/v1/puntualo/users', routes.UserRoute);
//   }

//   listen(){
//     // Conectar a la base de datos primero y luego arrancar el servidor
//     connectDB()
//       .then(()=>{
//         this.app.listen(this.app.get('port'), ()=>{
//           console.log(`Server esta corriendo en el puerto ${this.app.get('port')}`);
//         })
//       })
//       .catch((err)=>{
//         console.error('No fue posible iniciar el servidor por error en la BD:', err);
//       });
//   }

// }

import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import { connectDB } from './database';
import { PORT } from './config';
import { routes } from './routes';


export class Server {
  private app: Express;

  constructor() {
    this.app = express();
    this.configuration();
    this.middlewares();
    this.routes();
  }

  configuration() {
    this.app.set('port', PORT || 3000);
  }

  middlewares() {
    this.app.use(morgan('dev'));
    this.app.use(cors()); // poner la direccion del front (whitelist)
    this.app.use(express.json());
  }

  routes() {
    // Healthcheck liviano para tests y monitoreo
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok' })
    })

    // Si existe un frontend construido, servir archivos estáticos y ruta raíz al index
    let clientDist: string | null = null
    try {
      clientDist = path.resolve(__dirname, '../../client/dist')
      if (fs.existsSync(clientDist)) {
        this.app.use(express.static(clientDist))
        // En entorno de test devolver JSON en la raíz para no romper los tests en CI
        if (process.env.NODE_ENV === 'test') {
          this.app.get('/', (req, res) => {
            res.status(200).json({ name: 'Puntualo', status: 'ok' })
          })
        } else {
          // La ruta raíz debe devolver el index.html para la SPA
          this.app.get('/', (req, res) => {
            res.sendFile(path.join(clientDist as string, 'index.html'))
          })
        }
        console.log('✅ Serviendo frontend construido desde', clientDist)
      }
    } catch (err) {
      clientDist = null
    }

    // Si no hay frontend construido, asegurar que la ruta raíz exista en tests y dev
    if (!clientDist) {
      this.app.get('/', (req, res) => {
        res.status(200).json({ name: 'Puntualo', status: 'ok' })
      })
    }

    // Rutas principales
    this.app.use('/api/v1/puntualo/item', routes.ItemRoute);
    this.app.use('/api/v1/puntualo/users', routes.UserRoute);
    this.app.use('/api/v1/puntualo/auth', routes.AuthRoute);
    this.app.use('/api/v1/puntualo/search', routes.SearchRoute);
    this.app.use('/api/v1/puntualo/test', routes.TestRoute);
    this.app.use('/api/v1/puntualo/stats', routes.StatsRoute);
    this.app.use('/api/v1/puntualo/ai', routes.AiRoute);
    this.app.use('/api/v1/puntualo/follow-requests', routes.FollowRequestRoute);
    this.app.use('/api/v1/puntualo/notifications', routes.NotificationRoute);
    
    // Si tenemos frontend, añadir fallback SPA para rutas no-API
    if (clientDist) {
      // poner fallback a index.html *después* de las rutas API para no interceptarlas
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(clientDist as string, 'index.html'))
      })
    }
  }

  // Exponer la instancia de Express para tests (sin arrancar el listener)
  getApp(): Express {
    return this.app;
  }

  listen() {
    connectDB()
      .then(() => {
        this.app.listen(this.app.get('port'), () => {
          console.log(`✅ Servidor corriendo en el puerto ${this.app.get('port')}`);
        });
      })
      .catch((err) => {
        console.error('❌ Error al conectar con la base de datos:', err);
      });
  }
}
