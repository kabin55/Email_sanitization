import app from './app.js'
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../.env' });

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || 'localhost'

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`)
})
