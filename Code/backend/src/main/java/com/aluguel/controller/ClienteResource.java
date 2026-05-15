package com.aluguel.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.aluguel.model.Cliente;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/clientes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClienteResource {

    @Inject
    Validator validator;

    @GET
    public List<Cliente> listar(@QueryParam("busca") String busca) {
        if (busca != null && !busca.isBlank()) {
            return Cliente.buscarPorNome(busca).list();
        } else {
            return Cliente.listarTodos();
        }
    }

    @GET
    @Path("/{id}")
    public Response buscarPorId(@PathParam("id") Long id) {
        Cliente cliente = Cliente.buscarPorId(id);
        if (cliente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(cliente).build();
    }

    @POST
    @Transactional
    public Response criar(Cliente cliente) {

        Set<ConstraintViolation<Cliente>> violacoes = validator.validate(cliente);
        if (!violacoes.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                       .entity(violacoes.stream().map(v -> v.getMessage()).toList())
                       .build();
        }

        if (!validarCpf(cliente.cpf)) {
            return Response.status(Response.Status.BAD_REQUEST).entity("CPF inválido").build();
        }

        if (!validarRg(cliente.rg)) {
            return Response.status(Response.Status.BAD_REQUEST).entity("RG inválido").build();
        }

        cliente.persist();
        return Response.status(Response.Status.CREATED).entity(cliente).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response atualizar(@PathParam("id") Long id, Cliente clienteAtualizado) {
        Cliente cliente = Cliente.buscarPorId(id);
        if (cliente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        cliente.nome = clienteAtualizado.nome;
        cliente.rg = clienteAtualizado.rg;
        cliente.cpf = clienteAtualizado.cpf;
        cliente.endereco = clienteAtualizado.endereco;
        cliente.profissao = clienteAtualizado.profissao;
        cliente.rendimento1 = clienteAtualizado.rendimento1;
        cliente.rendimento2 = clienteAtualizado.rendimento2;
        cliente.rendimento3 = clienteAtualizado.rendimento3;

        Set<ConstraintViolation<Cliente>> violacoes = validator.validate(cliente);
        if (!violacoes.isEmpty()) {
            List<String> erros = violacoes.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.toList());
            return Response.status(Response.Status.BAD_REQUEST).entity(erros).build();
        }

        if (!validarCpf(cliente.cpf)) {
            return Response.status(Response.Status.BAD_REQUEST).entity("CPF inválido").build();
        }

        if (!validarRg(cliente.rg)) {
            return Response.status(Response.Status.BAD_REQUEST).entity("RG inválido").build();
        }

        return Response.ok(cliente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deletar(@PathParam("id") Long id) {
        Cliente cliente = Cliente.buscarPorId(id);
        if (cliente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        cliente.delete();
        return Response.status(Response.Status.NO_CONTENT).build();
    }

    private BigDecimal parseBigDecimal(String valor) {
        if (valor == null || valor.isBlank()) return null;
        try {
            return new BigDecimal(valor.replace(",", "."));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean validarCpf(String cpf) {
        if (cpf == null) return false;
        String digits = cpf.replaceAll("[^0-9]", "");
        return digits.length() == 11;
    }

    private boolean validarRg(String rg) {
        if (rg == null) return false;
        String digits = rg.replaceAll("[^0-9xX]", "");
        return digits.length() >= 5 && digits.length() <= 14;
    }
}