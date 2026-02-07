import { Sequelize } from "sequelize";


const isProduction = process.env.NODE_ENV !== "development";

export const sequelize = new Sequelize(
  isProduction ? process.env.PG_URI_PROD : process.env.PG_URI_DEV, 
  {
    dialect: "postgres",
    logging: false,
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Supabase/Render connections
      }
    } : {}, // No special options needed for local dev
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to postgres successfully!");
    if (!isProduction){
      await sequelize.sync({ alter: true });
      console.log("Postgres database synced successfully!");
    }
  } catch (error) {
    console.log("Unable to connect to postgres: ", error.message);
  }
};
