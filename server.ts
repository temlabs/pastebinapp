import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import {Paste, Comment} from "./interfaces";

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


app.post<{},{},Paste>("/pastes", cors(), async (req, res) => {
  
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

app.get("/pastes", cors(), async (req, res) => {
  
  try {

    const query = 'select * from pastes order by paste_date desc limit 10';
    
    const dbres = await client.query(query);
    res.status(200).json(dbres.rows);

  } catch (error) {
    res.status(404).json(error);
  }
});


app.post<{paste_id: string},{},Comment>("/pastes/:paste_id/comments", cors(), async (req, res) => {
  const paste_id = req.params.paste_id;
  try {

    if (!req.body.comment_content) {
      throw 'Incorrect body format';
    }

    const query = 'insert into comments values(default, $1, default, $2) returning *';
    const queryParams = [paste_id, req.body.comment_content]; 
    
    const dbres = await client.query(query,queryParams);
    res.status(201).json(dbres.rows);

  } catch (error) {
    res.status(404).json(error);
  }
});


app.get<{paste_id: string}>("/pastes/:paste_id/comments", cors(), async (req, res) => {
  try {

    const query = 'select * from comments where paste_id = $1 order by comment_date desc';
    const queryParams = [req.params.paste_id]
    const dbres = await client.query(query,queryParams);
    res.status(200).json(dbres.rows);

  } catch (error) {
    res.status(404).json(error);
  }
});

app.delete<{paste_id: string, comment_id: string}>("/pastes/:paste_id/comments/:comment_id", cors(), async (req, res) => {
  try {

    const query = 'delete from comments where comment_id = $1 and paste_id = $2';
    const queryParams = [req.params.comment_id,req.params.paste_id]
    const dbres = await client.query(query,queryParams);
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
