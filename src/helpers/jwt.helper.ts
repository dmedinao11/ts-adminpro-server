import jwt from "jsonwebtoken";

export default class JWT {
  public generate(uid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const payload = { uid };
        const secret = process.env.JWT_SECRET;

        jwt.sign(payload, secret, { expiresIn: "12h" }, (error, token) => {
          if (error) {
            throw Error("Un error ha ocurriodo al crear el token");
          }
          resolve(token);
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
}
