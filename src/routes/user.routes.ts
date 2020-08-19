//Core
import { Router, Request, Response } from "express";
import { check } from "express-validator";

//Models
import UserModel from "../database/models/user.model";

//Utilities
import bcrypt from "bcryptjs";
import { sendError } from "./index.routes";
import {
  fieldsValidators,
  tokenValidator,
  isAdminValidator,
  isAdminValidatorAndNotEqual,
} from "../middlewares/middlewares";
import JWT from "../helpers/jwt.helper";

class UserRoutes {
  public router: Router;
  public URI = "/api/users";

  constructor() {
    this.router = this.setRoutes();
  }

  private setRoutes(): Router {
    let router = Router();
    router.get(this.URI, tokenValidator, this.getUsers);
    router.post(
      this.URI,
      [
        //Middlewares
        check("name", "El nombre es requerido").not().isEmpty(),
        check("password", "La contraseña es requerida").not().isEmpty(),
        check("email", "El email es requerido").not().isEmpty(),
        check("email", "Email inválido").isEmail(),
        fieldsValidators,
      ],
      this.postUsers
    );
    router.put(
      this.URI,
      [
        tokenValidator,
        isAdminValidatorAndNotEqual,
        check("uid", "El identificador de usuario es necesario")
          .not()
          .isEmpty(),
        check("email", "Email inválido").isEmail(),
        fieldsValidators,
      ],
      this.putUser
    );
    router.delete(
      `${this.URI}/:uid`,
      [
        tokenValidator,
        isAdminValidator,
        check("uid", "El identificador de usuario es necesario")
          .not()
          .isEmpty(),
        fieldsValidators,
      ],
      this.deleteUser
    );

    return router;
  }

  private async getUsers(req: Request, res: Response) {
    try {
      const reqUserUid = req["uid"];
      const skipFrom = Number(req.query["from"]) || 0;

      const [users, total] = await Promise.all([
        UserModel.find({}, "name role email img googleAuth")
          .skip(skipFrom)
          .limit(5),
        UserModel.count({}),
      ]);

      res.json({ users, reqUserUid, total });
    } catch (error) {
      sendError(res, error);
    }
  }

  private async postUsers(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const emailRegistered = (await UserModel.findOne({ email })) != null;

      if (emailRegistered) {
        res.status(400).json({ msg: "Email registrado" });
        return;
      }

      let user = new UserModel(req.body);

      const salt = bcrypt.genSaltSync();
      user["password"] = bcrypt.hashSync(password, salt);

      const newUser = await user.save();

      //Generating token
      const jwt = new JWT();
      const token = await jwt.generate(newUser.id);
      res.json({
        msg: "Usuario registrado satisfactoriamente",
        user: newUser,
        token,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  private async putUser(req: Request, res: Response) {
    try {
      delete req.body.password;
      const { uid, email } = req.body;

      const userExists = await UserModel.findById(uid);

      if (!userExists) {
        res.status(404).json({ msg: "El usuario a actualizar no existe" });
        return;
      }

      if (userExists["googleAuth"] && email != userExists["email"])
        return res.status(400).json({
          msg:
            "El correo de una persona autenticada con Google, no se puede modificar",
        });
      delete req.body.googleAuth;

      if (
        email &&
        email != userExists["email"] &&
        (await UserModel.findOne({ email })) != null
      ) {
        res
          .status(400)
          .json({ msg: "El email que intenta actualizar ya existe" });
        return;
      } else if (email === userExists["email"]) delete req.body.email;

      const updatedUser = await UserModel.findByIdAndUpdate(uid, req.body, {
        new: true,
      });
      res.json({ ok: true, updatedUser });
    } catch (error) {
      sendError(res, error);
    }
  }

  private async deleteUser(req: Request, res: Response) {
    try {
      const uidParam = req.params["uid"];
      if (uidParam) {
        const resp = await UserModel.findByIdAndDelete(uidParam);
        if (resp) res.json(resp);
        else
          res
            .status(404)
            .json({ msg: "El usuario que intenta eliminar no existe" });
      } else res.status(400).json({ msg: "Debe proporcionar un usuario" });
    } catch (error) {
      sendError(res, error);
    }
  }
}

const userRoutes = new UserRoutes();

export default userRoutes.router;
