"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Core
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
class Server {
    constructor() {
        this.app = express_1.default();
        this.config(); //Set server's configuration
    }
    config() {
        //Settings
        this.app.set('port', process.env.PORT || 3000); //Setting port
        this.app.use(morgan_1.default('dev')); //Using morgan for restart server
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: false }));
    }
    start() {
        this.app.listen(this.app.get('port'), () => console.log('Server on port: ' + this.app.get('port')));
    }
}
const server = new Server();
server.start(); //Starting server
