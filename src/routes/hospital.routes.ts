//Core
import { Router, Request, Response } from "express";
import { check, validationResult } from "express-validator";

//Models
import HospitalModel from "../database/models/hospital.model";

//Utilities
import bcrypt from "bcryptjs";
import { sendError } from "./index.routes";
import { fieldsValidators, tokenValidator } from "../middlewares/middlewares";
import JWT from "../helpers/jwt.helper";

class HospitalRoutes {
  public router: Router;
  public URI = "/api/hospitals";

  constructor() {
    this.router = this.setRoutes();
  }

  private setRoutes(): Router {
    let router = Router();
    router.get(this.URI, tokenValidator, this.getHospitals);
    router.post(
      this.URI,
      [
        tokenValidator,
        check("name", "El nombre es requrido").not().isEmpty(),
        fieldsValidators,
      ],
      this.postHospitals
    );
    router.put(`${this.URI}/:uid`, [], this.putHospital);
    router.delete(`${this.URI}/:uid`, [], this.deleteHospital);

    return router;
  }

  private async getHospitals(req: Request, res: Response) {
    try {
      const hospitals = await HospitalModel.find().populate(
        "createdBy",
        "name"
      );
      res.json(hospitals);
    } catch (error) {
      sendError(res, error);
    }
  }

  private async postHospitals(req: Request, res: Response) {
    try {
      const uid = req["uid"];
      let hospital = new HospitalModel({ ...req.body, createdBy: uid });

      const newHospital = await hospital.save();

      res.json({
        msg: "Hospital registrado satisfactoriamente",
        hospital: newHospital,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  private async putHospital(req: Request, res: Response) {
    try {
    } catch (error) {
      sendError(res, error);
    }
  }

  private async deleteHospital(req: Request, res: Response) {
    try {
    } catch (error) {
      sendError(res, error);
    }
  }
}

const hospital = new HospitalRoutes();

export default hospital.router;
