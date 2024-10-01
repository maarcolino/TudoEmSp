
const express = require('express');
const router = express.Router();
const Local = require('../models/local');

router.get('/', async (req, res) => {
  try {
    const locais = await Local.find();
    res.json(locais);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar locais' });
  }
});

// Outras rotas para lidar com as requisições à collection "locais"

module.exports = router;