//Core
import { Router, Request, Response } from "express";
import { check } from "express-validator";

//Models
import UserModel from "../database/models/user.model";

//Utilities
import bcrypt from "bcryptjs";
import { sendError } from "./index.routes";
import { fieldsValidators, tokenValidator } from "../middlewares/middlewares";
import JWT from "../helpers/jwt.helper";
import { googleSignIn } from "../helpers/login.helper";
import { getUserMenu } from "../helpers/menu-front";

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
    router.get(`${this.URI}/renew`, [tokenValidator], this.renewToken);

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

          res.json({
            msg: `Bienvenido ${user["name"]}`,
            user,
            token,
            menu: getUserMenu(user["role"]),
          });
          return;
        }
      }

      res.status(400).json({ msg: "Correo o contraseña no válidos" });
    } catch (error) {
      sendError(res, error);
    }
  }

  public async doLoginGoogle(req: Request, res: Response): Promise<void> {
    const token = req.body["token"];
    let { msg, status, doc } = await googleSignIn(token);
    res.status(status).json({ msg, ...doc });
  }

  public async renewToken(req: Request, res: Response): Promise<void> {
    const uid = req["uid"];
    const jwt = new JWT();

    const [token, user] = await Promise.all([
      jwt.generate(uid),
      UserModel.findById(uid),
    ]);

    res.json({ token, user, menu: getUserMenu(user["role"]) });
  }
}

const authRoutes = new AuthRoutes();

export default authRoutes.router;
