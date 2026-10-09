const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const eventosRouter = require('./routes/eventosRouter');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.use('/', eventosRouter);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});