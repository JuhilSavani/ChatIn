import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const PG_URI = process.env.NODE_ENV === "development" ? process.env.PG_URI_DEV : process.env.PG_URI_PROD;

export const sequelize = new Sequelize(PG_URI, {
  dialect: "postgres",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log("postgres connected successfully!");
    if (process.env.NODE_ENV === "development") await sequelize.sync();
  } catch (error) {
    console.log("Unable to connect to postgres: ", error.message);
  }
};
