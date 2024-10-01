const mongoose = require('mongoose');

const localSchema = new mongoose.Schema({
  nome: String,
  endereco: String,
  nomeEvento:String ,
  descricao:  String ,
  dataInicio:  Date ,
  dataFim: Date ,
  local:  String, 
  fotos:  String ,
  criadoEm:  Date ,
  atualizadoEm: Date 
});

const Local = mongoose.model('Local', localSchema);

module.exports = Local;