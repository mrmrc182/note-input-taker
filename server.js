const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 3001;
const util = require("util");

const app = express();

const fs = require("fs");
const uuid = () =>
  Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);


const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

const readAndAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/api/notes", (req, res) => {
  readFromFile("db/db.json").then((data) => res.json(JSON.parse(data)));
});

app.post("/api/notes", (req, res) => {
  const { title, text } = req.body;
  console.log(req.body);
  if (req.body) {
    const newNote = {
      title,
      text,
      note_id: uuid(),
    };
    console.log(newNote);
    readAndAppend(newNote, "db/db.json");
    res.json(`Note added`);
  } else {
    res.error("Error in adding note");
  }
});

app.delete("/api/notes/:note_id", (req, res) => {
  console.log(req.params.note_id);
  const deleteId = req.params.note_id;
  readFromFile("db/db.json")
    .then((data) => JSON.parse(data))
    .then((json) => {
      const deletion = json.filter((app) => app.note_id !== deleteId);
      writeToFile("db/db.json", deletion);
      res.json(`Item ${deleteId} has been deleted`);
    });
});

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
