//Core
import express from 'express';
import morgan from 'morgan';


class Server {

    //Using express instance
    public app: express.Application;

    constructor(){
        this.app = express();
        this.config(); //Set server's configuration
    }

    config() {

        //Settings
        this.app.set('port', process.env.PORT || 3000); //Setting port
        
        this.app.use(morgan('dev')); //Using morgan for restart server
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
    }

    start() {
        this.app.listen(this.app.get('port'), () => console.log('Server on port: ' + this.app.get('port')));
    }
}

const server = new Server();
server.start() //Starting server