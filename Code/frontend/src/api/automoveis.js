import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getAutomoveis = () =>
  API.get('/automoveis').then((r) => r.data);

export const getAutomoveisDisponiveis = () =>
  API.get('/automoveis/disponiveis').then((r) => r.data);

export const getAutomovelById = (id) =>
  API.get(`/automoveis/${id}`).then((r) => r.data);

export const criarAutomovel = (dados) =>
  API.post('/automoveis', dados).then((r) => r.data);

export const atualizarAutomovel = (id, dados) =>
  API.put(`/automoveis/${id}`, dados).then((r) => r.data);

export const deletarAutomovel = (id) =>
  API.delete(`/automoveis/${id}`).then((r) => r.data);
