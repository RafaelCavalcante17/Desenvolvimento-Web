const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Criar usuário
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).send("Usuário registrado com sucesso");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Listar usuários
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Editar usuário
router.put("/:id", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }
      await user.save();
      res.status(200).send("Usuário atualizado com sucesso");
    } else {
      res.status(404).send("Usuário não encontrado");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Excluir usuário
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      res.status(200).send("Usuário excluído com sucesso");
    } else {
      res.status(404).send("Usuário não encontrado");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const { userSchema } = require("./userSchema");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Conectado ao MongoDB");
  })
  .catch((err) => {
    console.error("Erro de conexão:", err);
  });

app.use("/api/users", userRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
