"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Core
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
//Routes
const index_routes_1 = __importDefault(require("./routes/index.routes"));
//DB
const connection_db_1 = require("./database/connection.db");
class Server {
    constructor() {
        dotenv_1.config(); //Using dotenv package for launch enviroment variables
        this.app = express_1.default();
        this.config(); //Set server's configuration
    }
    config() {
        //Settings
        this.app.set("port", process.env.PORT || 3000); //Setting port
        this.app.use(morgan_1.default("dev")); //Using morgan for restart server
        this.app.use(express_1.default.json());
        this.app.use(express_fileupload_1.default());
        this.app.use(express_1.default.urlencoded({ extended: false }));
        this.app.use(cors_1.default()); //Using cors for allow all domain connections
        //DB
        connection_db_1.DB.connect(process.env.DB_CNN)
            .then(() => console.log("[DB] Is Connected"))
            .catch((error) => {
            console.error(error);
            throw new Error("[DB] Error in database connection");
        });
        //Routes
        this.app.use(index_routes_1.default);
    }
    start() {
        this.app.listen(this.app.get("port"), () => console.log("Server on port: " + this.app.get("port")));
    }
}
const server = new Server();
server.start(); //Starting server
