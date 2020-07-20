import { Schema, model } from "mongoose";

const HospitalSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});

HospitalSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  return object;
});

export default model("Hospitals", HospitalSchema);
