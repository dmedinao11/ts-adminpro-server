import mongoose from "mongoose";

export class DB {
  static connect(uri: string | undefined): Promise<typeof mongoose> {
    return mongoose.connect(uri as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}
