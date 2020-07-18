//Core
import express from "express";
import morgan from "morgan";
import { config as launchENV } from "dotenv";
import cors from "cors";

//Routes
import IndexRoutes from "./routes/index.routes";

//DB
import { DB } from "./database/connection.db";

class Server {
  //Using express instance
  public app: express.Application;

  constructor() {
    this.app = express();
    launchENV(); //Using dotenv package for launch enviroment variables
    this.config(); //Set server's configuration
  }

  config() {
    //Settings
    this.app.set("port", process.env.PORT || 3000); //Setting port

    this.app.use(morgan("dev")); //Using morgan for restart server
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors()); //Using cors for allow all domain connections

    //DB
    DB.connect(process.env.DB_CNN)
      .then(() => console.log("[DB] Is Connected"))
      .catch((error) => {
        console.error(error);
        throw new Error("[DB] Error in database connection");
      });
    //Routes
    this.app.use(IndexRoutes);
  }

  start() {
    this.app.listen(this.app.get("port"), () =>
      console.log("Server on port: " + this.app.get("port"))
    );
  }
}

const server = new Server();
server.start(); //Starting server
