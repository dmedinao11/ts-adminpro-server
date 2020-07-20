//Core
import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";

//Utilities
import { sendError } from "./index.routes";
import {
  tokenValidator,
  hasImgValidator,
  collectionValidator,
  fieldsValidators,
} from "../middlewares/middlewares";
import fileUpload from "express-fileupload";
import UploadHelper from "../helpers/upload.helper";
import { check } from "express-validator";

class SearchRoutes {
  public router: Router;
  public URI = "/api/upload/:collection/:id";

  constructor() {
    this.router = this.setRoutes();
    this.router.use(fileUpload());
  }

  public setRoutes(): Router {
    let router = Router();

    router.put(
      this.URI,
      [
        tokenValidator,
        collectionValidator,
        hasImgValidator,
        check("id", "Debe proveer un id de entidad válido").isMongoId(),
        fieldsValidators,
      ],
      this.upload
    );
    router.get(this.URI, [collectionValidator], this.download);

    return router;
  }

  public async upload(req: Request, res: Response) {
    try {
      const collection = req.params["collection"];
      const id = req.params["id"];

      const file: fileUpload.UploadedFile = req.files[
        "img"
      ] as fileUpload.UploadedFile;

      const uploader = new UploadHelper();
      const { msg, doc, status } = await uploader.save(file, collection, id);

      res.status(status).json({ msg, entity: doc });
    } catch (error) {
      sendError(res, error);
    }
  }
  public async download(req: Request, res: Response) {
    try {
      const collection = req.params["collection"];
      const imgUri = req.params["id"];

      let pathImage = path.join(
        __dirname,
        `../../uploads/${collection}/${imgUri}`
      );

      if (!fs.existsSync(pathImage))
        pathImage = path.join(__dirname, "../../uploads/no-img.jpg");

      res.sendFile(pathImage);
    } catch (error) {
      sendError(res, error);
    }
  }
}

const authRoutes = new SearchRoutes();

export default authRoutes.router;
