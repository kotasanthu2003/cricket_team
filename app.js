const express = require('express')
const path = require('path')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running...')
    })
  } catch (e) {
    console.log(`DBError:${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
//converting response from snake case to camel case
const convertToCamelCase = eachPlayer => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
    jerseyNumber: eachPlayer.jersey_number,
    role: eachPlayer.role,
  }
}
//get players API
app.get('/players/', async (request, response) => {
  const getplayersQuery = `
    SELECT
    *
    FROM
    cricket_team
    `
  const playersArray = await db.all(getplayersQuery)
  response.send(playersArray.map(eachPlayer => convertToCamelCase(eachPlayer)))
})

//add player API
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
  INSERT INTO
    cricket_team(player_name,jersey_number,role)
  VALUES
    (
       '${playerName}',${jerseyNumber},'${role}'
    )
  `
  await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//get Player based on player id API
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id=${playerId}
    `
  const player = await db.get(getPlayerQuery)
  response.send(convertToCamelCase(player))
})

//update player API
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
  UPDATE 
    cricket_team
  SET
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
  `
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//Delete player API
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE 
  FROM cricket_team
  WHERE player_id=${playerId};
  `
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
