const express = require("express");
const app = express();
const port = 4748;
const quiz = require("./questions");
app.use(express.json());
const cors = require("cors");
app.use(cors());

app.get("/quiz/all", (req, res) => {
  res.json(quiz); // quiz est l'ensemble de vos données JSON
});

app.get("/quiz/category/:category/difficulty/:difficulty", (req, res) => {
  const { category, difficulty } = req.params;

  const specificCategory = quiz.find(
    (item) => item.category.name === category && item.difficulty === difficulty
  );

  if (specificCategory) {
    res
      .status(200)
      .json({ category, difficulty, questions: specificCategory.questions });
  } else {
    res.status(404).json({ message: "Catégorie ou difficulté non trouvée" });
  }
});

// http://localhost:4747/quiz/category/..../difficulty/...

app.get(
  "/quiz/category/:category/difficulty/:difficulty/questions/id/:id",
  (req, res) => {
    const { difficulty, id } = req.params;

    const category = quiz.find((item) => item.difficulty === difficulty);

    if (category) {
      const specificQuestion = category.questions.find(
        (question) => question.id === id
      );

      if (specificQuestion) {
        res.status(200).json({ question: specificQuestion });
      } else {
        res.status(404).json({
          message: "Question non trouvée dans cette catégorie de difficulté",
        });
      }
    } else {
      res.status(404).json({ message: "Catégorie de difficulté non trouvée" });
    }
  }
);
// http://localhost:4747/quiz/category/..../difficulty/.../questions/id/...

app.get(
  "/quiz/category/:category/difficulty/:difficulty/questions/id/:id/option/:optionIndex",
  (req, res) => {
    const { difficulty, id, optionIndex } = req.params;

    const category = quiz.find((item) => item.difficulty === difficulty);

    if (category) {
      const specificQuestion = category.questions.find(
        (question) => question.id === id
      );

      if (specificQuestion) {
        const option = specificQuestion.options[optionIndex];
        if (option) {
          res.status(200).json({ questionId: id, option });
        } else {
          res
            .status(404)
            .json({ message: "Option non trouvée pour cette question" });
        }
      } else {
        res.status(404).json({
          message: "Question non trouvée dans cette catégorie de difficulté",
        });
      }
    } else {
      res.status(404).json({ message: "Catégorie de difficulté non trouvée" });
    }
  }
);

// http://localhost:4747/quiz/category/..../difficulty/..../questions/id/..../option/.

app.get(
  "/quiz/category/:category/difficulty/:difficulty/questions/id/:id/correct_option/",
  (req, res) => {
    const { category, difficulty, id } = req.params;
    const specificCategory = quiz.find(
      (item) =>
        item.category.name === category && item.difficulty === difficulty
    );

    if (specificCategory) {
      // Trouver la question spécifique par ID
      const specificQuestion = specificCategory.questions.find(
        (question) => question.id === id
      );

      if (specificQuestion) {
        // Renvoyer l'option correcte de la question
        res
          .status(200)
          .json({ correctOption: specificQuestion.correct_option });
      } else {
        res.status(404).json({ message: "Question non trouvée" });
      }
    } else {
      res.status(404).json({ message: "Catégorie ou difficulté non trouvée" });
    }
  }
);

// http://localhost:4747/quiz/category/.../difficulty/.../questions/id/.../correct_option

app
  .listen(port, () => {
    console.info(`Server is listening on port ${port}`);
  })
  .on("error", (err) => {
    console.error("Error:", err.message);
  });

app.post("/quiz/question/category", (req, res) => {
  const newQuestion = req.body;
  res.status(200).send("question reçue");
});
