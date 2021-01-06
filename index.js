import express from 'express';
import { promises as fs } from 'fs';
import consultas from './src/routes/consultas.js'



const { readFile, writeFile } = fs;
const app = express();
app.use(express.json());

app.use('/consultas', consultas)


app.listen(3000, async () => {
    console.log('Servidor rodando...')
});
