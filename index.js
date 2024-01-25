const express = require('express');
const app = express();
const port = 4748;
const quiz = require("./questions")
const cors = require("cors");
const fs = require('fs');
const path = require("path");


// app.use(cors({ origin: 'http://localhost:3000', methods: ['GET', 'POST'] }));
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET, HEAD, PUT, PATCH, POST, DELETE', 
  Credential: true,
  optionsSuccessStatus: 200
}));

// app.use(cors(corsOptions));

app.use(express.json())

app.get('/quiz/all', (req, res) => {
  res.json(quiz); // quiz est l'ensemble de vos données JSON
});

  app.get('/quiz/category/:category/difficulty/:difficulty', (req, res) => {
    const { category, difficulty } = req.params;

    const specificCategory = quiz.find(item => item.category.name === category && item.difficulty === difficulty);

    if (specificCategory) {
        res.status(200).json({ category, difficulty, questions: specificCategory.questions });
    } else {
        res.status(404).json({ message: 'Catégorie ou difficulté non trouvée' });
    }
});

// http://localhost:4747/quiz/category/..../difficulty/...

app.get('/quiz/category/:category/difficulty/:difficulty/questions/id/:id', (req, res) => {
  const { difficulty, id } = req.params;

  const category = quiz.find(item => item.difficulty === difficulty);

  if (category) {
    const specificQuestion = category.questions.find(question => question.id === id);

    if (specificQuestion) {
      res.status(200).json({ question: specificQuestion });
    } else {
      res.status(404).json({ message: 'Question non trouvée dans cette catégorie de difficulté' });
    }
  } else {
    res.status(404).json({ message: 'Catégorie de difficulté non trouvée' });
  }
});
// http://localhost:4747/quiz/category/..../difficulty/.../questions/id/...  

app.get('/quiz/category/:category/difficulty/:difficulty/questions/id/:id/option/:optionIndex', (req, res) => {
  const { difficulty, id, optionIndex } = req.params;

  const category = quiz.find(item => item.difficulty === difficulty);

  if (category) {
    const specificQuestion = category.questions.find(question => question.id === id);

    if (specificQuestion) {
      const option = specificQuestion.options[optionIndex];
      if (option) {
        res.status(200).json({ questionId: id, option });
      } else {
        res.status(404).json({ message: 'Option non trouvée pour cette question' });
      }
    } else {
      res.status(404).json({ message: 'Question non trouvée dans cette catégorie de difficulté' });
    }
  } else {
    res.status(404).json({ message: 'Catégorie de difficulté non trouvée' });
  }
});

// http://localhost:4748/quiz/category/..../difficulty/..../questions/id/..../option/.

app.get('/quiz/category/:category/difficulty/:difficulty/questions/id/:id/correct_option/',(req,res) => {
  const { category, difficulty, id } = req.params
  const specificCategory = quiz.find(item => item.category.name === category && item.difficulty === difficulty);

  if (specificCategory) {
    // Trouver la question spécifique par ID
    const specificQuestion = specificCategory.questions.find(question => question.id === id);

    if (specificQuestion) {
      // Renvoyer l'option correcte de la question
      res.status(200).json({ correctOption: specificQuestion.correct_option });
    } else {
      res.status(404).json({ message: 'Question non trouvée' });
    }
  } else {
    res.status(404).json({ message: 'Catégorie ou difficulté non trouvée' });
  }
});

// http://localhost:4748/quiz/category/.../difficulty/.../questions/id/.../correct_option

app
  .listen(port, () => {
    console.info(`Server is listening on port ${port}`);
  })
  .on("error", (err) => {
    console.error("Error:", err.message);
  });

 app.post('/quiz/question/category', (req, res) => {
  const newQuestion = req.body;
  res.status(200).send('question reçue')
 })


// pour stocker les questions
app.post('/quiz/question/new', (req, res) => {
  const newQuestion = req.body;

  if (!newQuestion || typeof newQuestion !== 'object') {
    return res.status(400).send({ message: 'Données de question invalides ou manquantes' });
  }

  // Récupérer les questions existantes depuis newQuestion.json
  const currentDirectory = __dirname;
  const newQuestionsFilePath = path.join(currentDirectory, "newQuestions.json");

  fs.readFile(newQuestionsFilePath, "utf-8", (readErr, data) => {
    if (readErr) {
      console.error("Erreur lors de la récupération des données depuis le fichier JSON :", readErr);
      return res.status(500).json({ error: "Erreur lors de la récupération des données." });
    }

    try {
      // Analyser les données JSON actuelles
      const jsonData = JSON.parse(data);
      
      // Ajouter la nouvelle question au tableau
      jsonData.push(newQuestion);

      // Écrire les données mises à jour dans newQuestion.json
      fs.writeFile(newQuestionsFilePath, JSON.stringify(jsonData, null, 2), "utf-8", (writeErr) => {
        if (writeErr) {
          console.error("Erreur lors de l'écriture des données dans le fichier JSON :", writeErr);
          return res.status(500).json({ error: "Erreur lors de l'écriture des données." });
        }

        res.status(201).send({ message: 'Nouvelle question ajoutée avec succès' });
      });
    } catch (parseError) {
      console.error("Erreur lors de la conversion des données JSON :", parseError);
      res.status(500).json({ error: "Erreur lors de la conversion des données JSON." });
    }
  });
});

app.get('/quiz/question-and-answers', (req, res) => {
  // Lire les données depuis newQuestions.json
  fs.readFile('newQuestions.json', 'utf-8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      res.status(500).json({ error: 'Erreur lors de la lecture des données.' });
      return;
    }

    try {
      // Analysez les données JSON
      const jsonData = JSON.parse(data);

      // Envoyez les données JSON en tant que réponse
      res.json(jsonData);
    } catch (parseError) {
      console.error('Erreur lors de la conversion des données JSON :', parseError);
      res.status(500).json({ error: 'Erreur lors de la conversion des données JSON.' });
    }
  });
});
