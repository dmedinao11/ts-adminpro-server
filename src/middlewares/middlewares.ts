import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import UserModel from "../database/models/user.model";
import jwt from "jsonwebtoken";

export const fieldsValidators = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    res.status(400).json(validationErrors.array());
    return;
  }
  next();
};

export const tokenValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("token"); //Tomando el token del header
    if (!token) {
      res.status(401).json({ msg: "Se debe proporcionar un token" });
      return;
    }
    const data = jwt.verify(token, process.env.JWT_SECRET); //Verificando el token

    req["uid"] = data["uid"]; //Si el token es valido entra aquí
    next();
  } catch (error) {
    //Si se llega aquí el token es inválido (no es correcto o expiró)
    res.status(401).json({ msg: "Token no válido" });
  }
};

export const hasImgValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files || Object.keys(req.files).length === 0)
    return res.status(400).send("Debe subir algún archivo válido");

  next();
};

export const collectionValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const collection = req.params["collection"];
  const validCollections = ["users", "doctors", "hospitals"];

  if (!validCollections.includes(collection))
    return res.status(400).json({
      msg: "Entidad no válida, debe ser 'users', 'doctors' o 'hospitals'",
    });

  next();
};

export const isAdminValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uid = req["uid"];

  try {
    const userDB = await UserModel.findById(uid);
    if (!userDB) {
      res.status(400).json({ msg: "Usuario no encontrado" });
      return;
    }
    if (userDB["role"] != "ADMIN_ROLE") {
      res
        .status(403)
        .json({ msg: "No cuenta con autorización para realizar la acción" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ msg: "Error interno, revisar logs" });
  }
};

export const isAdminValidatorAndNotEqual = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uid = req["uid"];
  const requestId = req.body["uid"];
  console.log(uid, requestId);
  try {
    const userDB = await UserModel.findById(uid);
    if (!userDB) {
      res.status(400).json({ msg: "Usuario no encontrado" });
      return;
    }
    if (userDB["role"] != "ADMIN_ROLE" && userDB["id"] != requestId) {
      res
        .status(403)
        .json({ msg: "No cuenta con autorización para realizar la acción" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ msg: "Error interno, revisar logs" });
  }
};
