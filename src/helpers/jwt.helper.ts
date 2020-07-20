import jwt from "jsonwebtoken";


//Esta clase implementa JWT

export default class JWT {
  //Generando token
  public generate(uid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const payload = { uid }; //Aquí se crea un objeto con la información que se serializa en el token
        const secret = process.env.JWT_SECRET; //Clave o firma secreta del token

        jwt.sign(payload, secret, { expiresIn: "12h" }, (error, token) => {
          if (error) {
            //Aquí ocurría un error interno del módulo jsonwebtoken
            throw Error("Un error ha ocurriodo al crear el token");
          }
          //Si no hay error y entra aquí se cre un token válido
          resolve(token);
        });
      } catch (error) {
        console.log(error);
        reject(error);
        throw Error("Un error ha ocurriodo al crear el token");
      }
    });
  }
}
