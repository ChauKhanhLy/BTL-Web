import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import foodRoutes from './routes/food.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/food', foodRoutes)

app.get('/', (req, res) => {
  res.send('Backend is running 🚀')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})
