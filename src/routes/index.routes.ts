import { Router } from "express";

class IndexRoutes {
  public router: Router;

  constructor() {
    this.router = this.setRoutes();
  }

  public setRoutes(): Router {
    let routes = Router();

    routes.get("/", (req, res) => res.json({ data: "Hola" }));

    return routes;
  }
}

const routes = new IndexRoutes();
export default routes.router;
