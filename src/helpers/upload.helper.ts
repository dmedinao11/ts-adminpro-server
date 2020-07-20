//Core
import fs from "fs";

//Models
import UserModel from "../database/models/user.model";
import DoctorModel from "../database/models/doctor.model";
import HospitalModel from "../database/models/hospital.model";

import fileUpload from "express-fileupload";
import { v4 as uuidv } from "uuid";

export default class UploadHelper {
  private VALID_EXTENSIONS: string[];

  constructor() {
    this.VALID_EXTENSIONS = ["png", "jpg", "jpeg", "gif"];
  }
  public async save(
    file: fileUpload.UploadedFile,
    collection: string,
    id: string
  ): Promise<{ status: number; result: string; doc?: object }> {
    const cutName = file.name.split(".");
    const fileExtension = cutName[cutName.length - 1];

    if (!this.VALID_EXTENSIONS.includes(fileExtension))
      return {
        status: 400,
        result:
          "La imagen debe tener una extensión válida ('png', 'jpg', 'jpeg', 'gif')",
      };

    const newFileName = `${uuidv()}.${fileExtension}`;
    const savePath = `./uploads/${collection}/${newFileName}`;

    try {
      let doc = {};
      switch (collection) {
        case "users":
          const user = await UserModel.findById(id);
          if (!user) return { status: 400, result: "Usuario no encontrado" };

          const olderImgUser = user["img"];
          const olderPathUser = `src/uploads/${collection}/${olderImgUser}`;

          //Deleting stored older image
          if (olderImgUser && fs.existsSync(olderPathUser))
            fs.unlinkSync(olderPathUser);

          user["img"] = newFileName;
          doc = await user.save();
          break;

        case "doctors":
          const doctor = await DoctorModel.findById(id);
          if (!doctor) return { status: 400, result: "Usuario no encontrado" };

          console.log("No debería");

          const olderImgDoctor = doctor["img"];
          const olderPathDoctor = `src/uploads/${collection}/${olderImgDoctor}`;

          //Deleting stored older image
          if (olderImgDoctor && fs.existsSync(olderPathDoctor))
            fs.unlinkSync(olderPathDoctor);

          doctor["img"] = newFileName;
          doc = await doctor.save();
          break;

        case "hospitals":
          const hospital = await HospitalModel.findById(id);
          if (!hospital)
            return { status: 400, result: "Usuario no encontrado" };

          const olderImgHospital = hospital["img"];
          const olderPathHospital = `src/uploads/${collection}/${olderImgHospital}`;

          //Deleting stored older image
          if (olderImgHospital && fs.existsSync(olderPathHospital))
            fs.unlinkSync(olderPathHospital);

          hospital["img"] = newFileName;
          doc = await hospital.save();
          break;
      }

      const saveResult = await new Promise<string>((resolve, reject) => {
        file.mv(savePath, (err) => {
          if (err) {
            console.log(err);
            reject("Error al guardar archivo, revisar logs");
          }
          resolve();
        });
      });

      if (saveResult)
        return {
          result: saveResult,
          status: 500,
        };

      return { status: 200, result: "Imagen actualizada con éxito", doc };
    } catch (error) {
      console.log(error);
      return { result: "Error interno, revisar logs", status: 500 };
    }
  }
}
