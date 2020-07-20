//Core
import { OAuth2Client } from 'google-auth-library';

//Models
import { IResponse } from '../models/http.models';
import UserModel from "../database/models/user.model";

//Utilities
import JWT from "../helpers/jwt.helper";


export const googleSignIn = async (token: string): Promise<IResponse> => {
    let result: IResponse = { msg: '', status: 500 };

    let name = '';
    let picture = '';
    let email = '';

    try {
        const client = new OAuth2Client(process.env['GOOGLE_ID']);

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env['GOOGLE_ID'],
        });
        const payload = ticket.getPayload();

        name = payload.name;
        picture = payload.picture;
        email = payload.email;

    } catch (error) {
        console.log(error)
        result.msg = 'Token de Google no válido';
        result.status = 400;
        return result;
    }

    try {
        let userInDB = await UserModel.findOne({ email });
        const jwt = new JWT();

        if (userInDB) {
            userInDB['googleAuth'] = true;
            userInDB['password'] = '###';
        } else
            userInDB = new UserModel({
                name,
                email,
                password: '###',
                img: picture,
                googleAuth: true
            });

        await userInDB.save();

        const token = await jwt.generate(userInDB.id);

        result.status = 200;
        result.msg = `Bienvenido ${userInDB['name']}`
        result.doc = { user: userInDB, token };
        return result;

    } catch (error) {
        console.log(error);
        result.status = 500;
        result.msg = 'Error al autenticar usuario con Google, revisar logs'
    }
}