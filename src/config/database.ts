import mongoose from "mongoose";

const dbConnection = async () => {
  const conn = await mongoose
    .connect(process.env.CONNECTION_STRING_ONLINE as string);
  console.log(`Database Connected: ${conn.connection.host}`);
    // .catch((err) => {
    //   console.error(`Database Error: ${err}`);
    //   process.exit(1);
    // });
};

export default dbConnection;
