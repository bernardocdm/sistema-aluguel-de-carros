-- Garante que o usuário existe com as credenciais corretas
INSERT INTO usuarios (id, nome, email, senha, perfil, rg, cpf, endereco, dtype)
VALUES (201, 'Ana Cliente', 'ana@cliente.com', '123456', 'cliente', '9876543', '98765432100', 'Rua A', 'Cliente');

-- Vincula o ID 201 como um Cliente (JOINED)
INSERT INTO clientes (id, profissao, rendimento1, rendimento2, rendimento3)
VALUES (201, 'Engenheira', 5000.0, 0.0, 0.0);

-- Automóvel com ID fixo e status correto
INSERT INTO automoveis (id, marca, modelo, ano, placa, valor_diaria, status, url_imagem)
VALUES (301, 'Toyota', 'Corolla', 2023, 'ABC1234', 150.0, 'disponivel', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=800');

-- RESET DA SEQUENCE (O MAIS IMPORTANTE)
-- Se o Hibernate tentar criar um pedido com ID que já existe, ele dá erro.
ALTER SEQUENCE IF EXISTS hibernate_sequence RESTART WITH 1000;