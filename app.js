const express = require('express');
const mongoose = require('mongoose');

// database connection
mongoose.connect('mongodb://localhost:27017/rest_highscore', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));


const highscoreSchema = new mongoose.Schema({
    game: String,
    naam: String,
    score: Number
});

const Highscore = mongoose.model('Highscore', highscoreSchema);

const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
    const { game, naam, score } = req.body;

    const existingHighscore = await Highscore.findOne({ game }).sort({ score: -1 });
    const isNewHighscore = !existingHighscore || score > existingHighscore.score;

    if (isNewHighscore) {
        const newHighscore = new Highscore({ game, naam, score });
        await newHighscore.save();
        res.json({game, naam, score, highscore: true});
    } else {
        res.json({game, naam, score, highscore: false});
    }
});

app.get('/:game', async (req, res) => {
    const { game } = req.params;
    const highscore = await Highscore.findOne({ game }).sort({ score: -1 });
  
    if (highscore) {
      res.json(highscore);
    } else {
      res.status(404).json({ error: 'Highscore not found' });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));