const express = require('express')
const app = express()
const morgan = require('morgan')
app.use(express.json())
const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', request => {
    if(request.method === "POST"){
        return JSON.stringify(request.body)
    }
  })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
//oliko tässä tarkoitus käyttää split loggausta siten että POST näyttää tämän ja muut morgan("tiny")?
//jos oli niin meni minulta ns yli hilseen se miten split loggaus toimii dokumentaation mukaan eikä googlestakaan ollut apua

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
        
      },
      {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
        
      },
      {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
        
      },
      {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122"
        
      }
  ]


app.get('/info', (request, response) => {
    const date = new Date()
    response.send(
        '<p>Phonebook has info for ' + persons.length.toString() + ' people </p>'
        + '</br>' + date.toString()     
        )
})
// En ole ihan varma tuosta pyynnön tekohetken ajasta

  
app.get('/api/persons', (request, response) => {
    response.json(persons)
})
  
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

  const generateId = () => {
  const newId = Math.floor(Math.random() * 10000)
  return newId
}

app.post('/api/persons', (request, response) => {
   
  const body = request.body
  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  } else if (!body.number){
    return response.status(400).json({ 
        error: 'number missing' 
      })
  } else if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({ 
        error: 'name must be unique' 
      })
}

const person = {
    id: generateId(),
    name: body.name,
    number: body.number || false
    
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
