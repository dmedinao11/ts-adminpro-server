//Core
import { Router, Request, Response } from "express";
import { check } from "express-validator";

//Models
import DoctorModel from "../database/models/doctor.model";
import HospitalModel from "../database/models/hospital.model";

//Utilities
import bcrypt from "bcryptjs";
import { sendError } from "./index.routes";
import { fieldsValidators, tokenValidator } from "../middlewares/middlewares";
import JWT from "../helpers/jwt.helper";

class DoctorRoutes {
  public router: Router;
  public URI = "/api/doctors";

  constructor() {
    this.router = this.setRoutes();
  }
  private setRoutes(): Router {
    let router = Router();
    router.get(this.URI, tokenValidator, this.getDoctors);
    router.post(
      this.URI,
      [
        tokenValidator,
        check("name", "El nombre del médico es requrido").not().isEmpty(),
        check(
          "hospital",
          "La identificación del hospital es inválida"
        ).isMongoId(),
        fieldsValidators,
      ],
      this.postDoctors
    );
    router.put(`${this.URI}/:id`, [
      tokenValidator,
      check("name", "El nombre del médico es requrido").not().isEmpty(),
      check(
        "hospital",
        "La identificación del hospital es inválida"
      ).isMongoId(),
      fieldsValidators,
    ], this.putDoctor);
    router.delete(`${this.URI}/:id`, [tokenValidator], this.deleteDoctor);

    return router;
  }

  private async getDoctors(req: Request, res: Response) {
    try {
      const doctors = await DoctorModel.find()
        .populate("createdBy", "name")
        .populate("hospital", "name");
      res.json(doctors);
    } catch (error) {
      sendError(res, error);
    }
  }

  private async postDoctors(req: Request, res: Response) {
    try {
      const uid = req["uid"];
      const huid = req.body.hospital;

      const validHospital =
        (await HospitalModel.findById(huid).catch((error) =>
          console.log(error)
        )) != null;
      if (!validHospital)
        return res
          .status(400)
          .json({ msg: "El hospital especificado no se ha encontrado" });

      let doctor = new DoctorModel({ ...req.body, createdBy: uid });

      const newDoctor = await doctor.save();

      res.json({
        msg: "Doctor registrado satisfactoriamente",
        doctor: newDoctor,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  private async putDoctor(req: Request, res: Response) {
    try {
      const uid = req["uid"];
      const id = req.params['id'];
      const hospitalId = req.body.hospital;

      const hospital = await HospitalModel.findById(hospitalId);
      if (!hospital) return res.status(400).json({ msg: 'Hospital no encontrado' });

      const doctor = await DoctorModel.findById(id);
      if (!doctor) return res.status(400).json({ msg: 'Doctor no encontrado' });


      const toUpdate = {
        createdBy: uid,
        ...req.body
      };

      const updatedHospital = (await DoctorModel.findByIdAndUpdate(id, toUpdate, { new: true }));

      res.json(updatedHospital);
    } catch (error) {
      sendError(res, error);
    }
  }

  private async deleteDoctor(req: Request, res: Response) {
    try {
      const id = req.params['id'];
      const doctor = await DoctorModel.findById(id);

      if (!doctor) return res.status(400).json({ msg: 'Doctor no encontrado' });

      const deletedDoctor = await DoctorModel.findByIdAndDelete(id);

      res.json(deletedDoctor);
    } catch (error) {
      sendError(res, error);
    }
  }
}

const doctor = new DoctorRoutes();

export default doctor.router;
