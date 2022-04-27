import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import {Paste} from "./interfaces";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};


const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler
app.options('*',cors());


const client = new Client(dbConfig);
client.connect();


app.post<{},{},Paste>("/", cors(), async (req, res) => {
  
  try {

    if (!req.body.paste_content) {
      throw 'Incorrect body format';
    }

    const query = 'insert into pastes values(default, default, $1, $2) returning *';
    const title = req.body.paste_title ?? "";
    const queryParams = [title, req.body.paste_content]; 
    
    const dbres = await client.query(query,queryParams);
    res.status(201).json(dbres.rows);

  } catch (error) {
    res.status(404).json(error);
  }
});

app.get("/", cors(), async (req, res) => {
  
  try {

    const query = 'select * from pastes order by paste_date desc limit 10';
    
    const dbres = await client.query(query);
    res.status(200).json(dbres.rows);

  } catch (error) {
    res.status(404).json(error);
  }
});

//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
