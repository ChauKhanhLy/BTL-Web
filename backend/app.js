import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { supabase } from './database/supabase.js'


import foodRoutes from './routes/food.routes.js'
import orderRoutes from "./routes/order.routes.js"
import statsRoutes from "./routes/stats.routes.js"
import feedbackRoutes from "./routes/feedback.routes.js"
import feedbackAdminRoutes from './routes/feedbackAdmin.routes.js'
import userAccountRoutes from './routes/userAccountRoutes.js'

const adminRoutes = require('./routes/adminRoutes');
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes.js');
const userAccountRoutes = require('./routes/userAccountRoutes.js');
const feedbackAdminRoutes = require('./routes/feedbackAdmin.routes.js');

app.use(cors())
app.use(express.json())

app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase.from('food').select('*')
  res.json({ data, error })
})

app.use('/api/food', foodRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/stats", statsRoutes)
app.use('/api/users', userAccountRoutes)
app.use('/api/feedback', feedbackAdminRoutes);


app.get('/', (req, res) => {
  res.send('Backend is running ')
})

const PORT = process.env.PORT || 5000
app.use('/api/admin', adminRoutes);
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})
