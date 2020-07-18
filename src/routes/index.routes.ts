import { Router, Response } from "express";

//Routes
import userRoutes from "./user.routes"; // --> api/users
import authRoutes from "./auth.routes"; // --> api/login

//Constants

class IndexRoutes {
  public routes: Router[];

  constructor() {
    this.routes = this.setRoutes();
  }

  public setRoutes(): Router[] {
    let mainRouter = Router();

    mainRouter.get("/", (req, res) => res.json({ data: "Hola" }));

    return [mainRouter, userRoutes, authRoutes];
  }
}

export function sendError(res: Response, error: any): void {
  res.status(500).json({ msg: "Error interno, revisar logs", error });
  throw Error("[ERROR]");
}

const routes = new IndexRoutes();
export default routes.routes;
