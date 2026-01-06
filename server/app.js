import express from 'express'
import emailRoutes from './routes/email.routes.js'
import cors from 'cors';


const app = express()
app.use(express.json())
app.use(cors());

app.use('/api/email', emailRoutes)

app.get('/', (req, res) => {
  res.send('Server is running');
});

export default app
