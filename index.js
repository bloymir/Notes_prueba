require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Note = require('./models/note');
const { response } = require("express");

const app = express();
app.use(cors());



app.use(express.static("build"));
app.use(express.json());


let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true,
  },
];

app.get("/", (req, res) => {
  res.send("<h1>Hola</h1>");
});

app.get("/api/notes", (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});


app.get("/api/notes/:id", (req, res, next) => {

  Note.findById(req.params.id).then(note => {
    if(note) {
        res.json(note)
    } else {
        res.status(404).end()
    } 
  })
  .catch(error => next(error))

 /* const note = notes.find((note) => note.id === id);
  note ? res.json(note) : res.status(404).end();*/
});

app.delete("/api/notes/:id", (req, res) => {
  Note.findByIdAndDelete(req.params.id)
    .then(result => {
        res.status(204).end()
    })
    .catch(error => next(error))
});

//Crear Notas
app.post("/api/notes", (req, res, next) => {
  const body = req.body;

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })

  note.save()
  .then(savedNote => savedNote.toJSON())
  .then(savedAndFormattedNode => {
    res.json(savedAndFormattedNode) 
  })
  .catch(error => next(error))
});

//Actualizar important
app.put('/api/notes/:id', (req, res, next) => {
    const {body} = req
    
    const note = {
        content: body.content,
        important: body.important,
    }

    Note.findByIdAndUpdate(req.params.id, note, {new: true}) //new: true es para recibir el objeto modificado
        .then(updatedNote => {
            res.json(updatedNote)
        })
        .catch(error => next(error))
})

const unknownEndPoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint'})
}
const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if(error.name === 'CastError'){
        return res.status(400).send({ error: 'malformatted id '})
    } else if (error.name === 'ValidationError') {
        return res.status(400).send({ error: error.message})
    }
    next(error)
}
//uso handle unknow end point
app.use(unknownEndPoint)
//uso error handler
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
