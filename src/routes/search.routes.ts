//Core
import { Router, Request, Response } from "express";

//Models
import UserModel from "../database/models/user.model";
import DoctorModel from "../database/models/doctor.model";
import HospitalModel from "../database/models/hospital.model";

//Utilities
import { sendError } from "./index.routes";
import { tokenValidator } from "../middlewares/middlewares";

class SearchRoutes {
  public router: Router;
  public URI_SEARCH = "/api/search";
  public URI_COLLECTION = "/api/search-by-collection";

  constructor() {
    this.router = this.setRoutes();
  }

  public setRoutes(): Router {
    let router = Router();

    router.get(`${this.URI_SEARCH}/:term`, [tokenValidator], this.search);
    router.get(
      `${this.URI_COLLECTION}/:collection/:term`,
      [tokenValidator],
      this.searchByCollection
    );

    return router;
  }

  public async search(req: Request, res: Response) {
    try {
      const term = RegExp(req.params["term"], "i");
      const [users, doctors, hospitals] = await Promise.all([
        UserModel.find({ name: term, email: term }),
        DoctorModel.find({ name: term }),
        HospitalModel.find({ name: term }),
      ]);

      res.json({ users, doctors, hospitals });
    } catch (error) {
      sendError(res, error);
    }
  }
  public async searchByCollection(req: Request, res: Response) {
    try {
      const term = RegExp(req.params["term"], "i");
      const collection = req.params["collection"];

      let results: Object[];

      switch (collection) {
        case "users":
          results = await UserModel.find({ name: term, email: term });
          break;
        case "doctors":
          results = await DoctorModel.find({ name: term });
          break;
        case "hospitals":
          results = await HospitalModel.find({ name: term });
          break;
        default:
          return res.status(400).json({
            msg:
              'El parámetro colección debe ser "users", "doctors" o "hospitals"',
          });
          break;
      }

      res.json(results);
    } catch (error) {
      sendError(res, error);
    }
  }
}

const authRoutes = new SearchRoutes();

export default authRoutes.router;
