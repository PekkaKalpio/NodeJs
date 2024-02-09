require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
app.use(express.json())
const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))
const mongoose = require('mongoose')
const Person = require('./models/person')
const ObjectId = require('mongodb').ObjectId

const password = process.argv[2]

morgan.token('body', request => {
    if(request.method === 'POST'){
        return JSON.stringify(request.body)
    }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
//oliko tässä tarkoitus käyttää split loggausta siten että POST näyttää tämän ja muut morgan("tiny")?
//jos oli niin meni minulta ns yli hilseen se miten split loggaus toimii dokumentaation mukaan eikä googlestakaan ollut apua

const url =
  `mongodb+srv://kalpiopekka:${password}@fullstack-tehtava.qs0sajj.mongodb.net/phonebook?retryWrites=true&w=majority`


let persons = []



app.get('/info', (request, response) => {
    const date = new Date()
    Person.find({})
        .then(persons => {
            response.send(
                '<p>Phonebook has info for ' + persons.length.toString() + ' people </p>'
                + '</br>' + date.toString()     
            )
        })
    
})
// En ole ihan varma tuosta pyynnön tekohetken ajasta

  
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})
  
app.get('/api/persons/:id', (request, response, next) => {
    console.log(request.params.id)
    Person.findById({_id: new ObjectId(request.params.id)}) //jostain syystä vain tässä jouduin muuttamaan id:n objectid muotoiseksi. deletessä toimi normaalisti ilman tätä
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
            
        }).catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(response => {
            response.status(204).end()
        })
        .catch(error => next(error))
})
/*
const generateId = () => {
    const newId = Math.floor(Math.random() * 10000)
    return newId
}*/

app.post('/api/persons', (request, response, next) => {
  
    const body = request.body
    /* if (!body.name) {
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
}*/

    const person = new Person ({
    // id: generateId(),
        name: body.name,
        number: body.number
    })

    persons = persons.concat(person)

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
        .catch(error => next(error))
})

app.put('/api/persons/:id',(request,response, next) => {
    const { name, number } = request.body
    
    /*  const person = {
        name: body.name,
        number: body.number,
    } */

    Person.findByIdAndUpdate(request.params.id, {name, number}, { new: true, runValidators: true, context: 'query'}, next)
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
        
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.name)
    if (error.name === 'CastError' || error.name==='BSONError') {
        return response.status(400).send({ error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        const errorText = error.message
        return response.status(400).json({ errorText })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
