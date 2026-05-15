import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

export const getClientes = () => 
  API.get('/clientes').then(r => r.data);

export const getClienteById = (id) =>
  API.get(`/clientes/${id}`).then(r => r.data);

export const criarCliente = (dados) =>
  API.post('/clientes', dados).then(r => r.data);

export const atualizarCliente = (id, dados) =>
  API.put(`/clientes/${id}`, dados).then(r => r.data);

export const deletarCliente = (id) =>
  API.delete(`/clientes/${id}`).then(r => r.data);

export const buscarClientes = (busca) =>
  API.get('/clientes', { params: { busca } }).then(r => r.data); 