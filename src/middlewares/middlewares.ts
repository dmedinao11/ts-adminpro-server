import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
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
    const token = req.header("token");
    if (!token) {
      res.status(401).json({ msg: "Se debe proporcionar un token" });
      return;
    }
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req["uid"] = data["uid"];
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token no válido" });
  }
};
