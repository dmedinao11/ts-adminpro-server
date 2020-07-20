//Core
import { Router, Request, Response } from "express";
import { check } from "express-validator";

//Models
import UserModel from "../database/models/user.model";

//Utilities
import bcrypt from "bcryptjs";
import { sendError } from "./index.routes";
import { fieldsValidators } from "../middlewares/middlewares";
import JWT from "../helpers/jwt.helper";
import { googleSignIn } from '../helpers/login.helper';

class AuthRoutes {
  public router: Router;
  public URI = "/api/login";

  constructor() {
    this.router = this.setRoutes();
  }

  public setRoutes(): Router {
    let router = Router();

    router.post(
      this.URI,
      [
        check("password", "La contraseña es requerida").not().isEmpty(),
        check("email", "Email inválido").isEmail(),
        fieldsValidators,
      ],
      this.doLogin
    );
    router.post(
      `${this.URI}/google`,
      [
        check("token", "El token de Google es requerido").not().isEmpty(),
        fieldsValidators,
      ],
      this.doLoginGoogle
    );

    return router;
  }

  public async doLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      let user = await UserModel.findOne({ email });
      if (user) {
        const validPassword = bcrypt.compareSync(password, user["password"]);
        if (validPassword) {
          //Generating token
          const jwt = new JWT();
          const token = await jwt.generate(user["id"]);

          res.json({ msg: `Bienvenido ${user["name"]}`, user, token });
          return;
        }
      }

      res.status(400).json({ msg: "Correo o contraseña no válidos" });
    } catch (error) {
      sendError(res, error);
    }
  }

  public async doLoginGoogle(req: Request, res: Response): Promise<void> {
    const token = req.body['token'];
    let { msg, status, doc } = await googleSignIn(token);
    res.status(status).json({ msg, ...doc });
  }
}

const authRoutes = new AuthRoutes();

export default authRoutes.router;
