import app from './app.js'
import userRoutes from './routes/users.routes.js';

app.use('/api/user', userRoutes);

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000')
})
