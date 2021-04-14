'use strict';

const serverless = require('serverless-http');

const express = require('express');
const app = express();

const AWS = require('aws-sdk');
const bodyParser = require('body-parser');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PERSONAS_TABLE = process.env.PERSONAS_TABLE;

const xhr = require('xmlhttprequest').XMLHttpRequest;

app.use(bodyParser.urlencoded({extended: true}))

app.post('/personas', (req, res) => {

  const {
    personaId,
    nombre, 
    altura,
    peso,
    color_pelo,
    color_piel,
    color_ojos,
    fechaNac,
    genero
  } = req.body;

  const params = {
    TableName: PERSONAS_TABLE,
    Item: {
      personaId,
      nombre, 
      altura,
      peso,
      color_pelo,
      color_piel,
      color_ojos,
      fechaNac,
      genero
    }
  }

  dynamoDB.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({
        err: error,
        msg: 'No se ha podido crear registro'
      })
    } else {
      res.json({personaId,nombre});
    }
  });

})

app.get('/personas', (req, res) =>{

  const params = {
    TableName: 'personas-table-dev',
  };
  
  dynamoDB.scan(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({
        error: 'No se ha podido acceder a los registros'
      })
    } else {
      const {Items} = result;
      res.json({
        ok: true,
        data: Items
      });
    }
  })

})

app.get('/planetas', (req, res) =>{ 

  let data;
  let result = [];

  getData('https://swapi.py4e.com/api/planets')
    .then((respuesta) => {

      data = JSON.parse(respuesta);
      data = data.results;
    
      for (const item of data) {
        
        const planeta = {
          nombre : item.name,
          periodo_rotacion : item.rotation_period,
          orbital_period : item.orbital_period,
          diametro : item.diameter,
          clima : item.climate,
          gravedad : item.gravity,
          terreno : item.terrain,
          superficie_agua : item.surface_water,
          poblacion : item.population
        } 

        result.push(planeta);

      }

      res.send({data: result});

    })

}) 

function getData(url){
  
  return new Promise((resolve, reject) => {
    var req = new xhr();
    req.open('GET', url);
    
    req.onload = function() {
      if (req.status == 200) {
        resolve(req.responseText);
      }
      else {
        reject(Error(req.statusText));
      }
    }
 
    req.onerror = function() {
      reject(Error("Network Error"));
    }

    req.send()
   
  })
}

module.exports.general = serverless(app);