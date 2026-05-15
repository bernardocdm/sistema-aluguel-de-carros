package com.aluguel.controller;

import com.aluguel.model.Automovel;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Path("/api/automoveis")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AutomovelResource {

    @Inject
    Validator validator;

    @GET
    public List<Automovel> listar() {
        return Automovel.listarTodos();
    }

    @GET
    @Path("/disponiveis")
    public List<Automovel> listarDisponiveis() {
        return Automovel.listarDisponiveis();
    }

    @GET
    @Path("/{id}")
    public Response buscarPorId(@PathParam("id") Long id) {
        Automovel automovel = Automovel.buscarPorId(id);
        if (automovel == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(automovel).build();
    }

    @POST
    @Transactional
    public Response criar(Automovel automovel) {
        Set<ConstraintViolation<Automovel>> violacoes = validator.validate(automovel);
        if (!violacoes.isEmpty()) {
            List<String> erros = violacoes.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.toList());
            return Response.status(Response.Status.BAD_REQUEST).entity(erros).build();
        }
        automovel.persist();
        return Response.status(Response.Status.CREATED).entity(automovel).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response atualizar(@PathParam("id") Long id, Automovel dados) {
        Automovel automovel = Automovel.buscarPorId(id);
        if (automovel == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        automovel.marca = dados.marca;
        automovel.modelo = dados.modelo;
        automovel.ano = dados.ano;
        automovel.placa = dados.placa;
        automovel.valorDiaria = dados.valorDiaria;
        automovel.status = dados.status;
        automovel.urlImagem = dados.urlImagem;

        Set<ConstraintViolation<Automovel>> violacoes = validator.validate(automovel);
        if (!violacoes.isEmpty()) {
            List<String> erros = violacoes.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.toList());
            return Response.status(Response.Status.BAD_REQUEST).entity(erros).build();
        }
        return Response.ok(automovel).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deletar(@PathParam("id") Long id) {
        Automovel automovel = Automovel.buscarPorId(id);
        if (automovel == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        automovel.delete();
        return Response.status(Response.Status.NO_CONTENT).build();
    }
}
