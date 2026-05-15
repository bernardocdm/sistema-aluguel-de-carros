package com.aluguel.controller;

import com.aluguel.model.Cliente;
import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import io.smallrye.common.annotation.Blocking;

@Path("/clientes")
public class ClienteController {

    @Inject
    Template listar;

    @Inject
    Template formulario;

    @Inject
    Validator validator;

    @GET
    @Blocking
    @Transactional
    @Produces(MediaType.TEXT_HTML)
    public TemplateInstance listar(@QueryParam("busca") String busca) {
        List<Cliente> clientes;
        if (busca != null && !busca.isBlank()) {
            clientes = Cliente.buscarPorNome(busca).list();
        } else {
            clientes = Cliente.listarTodos();
        }
        return listar.data("clientes", clientes)
                     .data("busca", busca != null ? busca : "");
    }

    @GET
    @Path("/novo")
    @Produces(MediaType.TEXT_HTML)
    public TemplateInstance novo() {
        return formulario.data("cliente", new Cliente())
                         .data("modo", "novo")
                         .data("erros", List.of());
    }

    @GET
    @Path("/{id}/editar")
    @Produces(MediaType.TEXT_HTML)
    public Response editar(@PathParam("id") Long id) {
        Cliente cliente = Cliente.buscarPorId(id);
        if (cliente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(
            formulario.data("cliente", cliente)
                      .data("modo", "editar")
                      .data("erros", List.of())
        ).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Transactional
    public Response criar(
            @FormParam("nome") String nome,
            @FormParam("rg") String rg,
            @FormParam("cpf") String cpf,
            @FormParam("endereco") String endereco,
            @FormParam("profissao") String profissao,
            @FormParam("rendimento1") String rendimento1Str,
            @FormParam("rendimento2") String rendimento2Str,
            @FormParam("rendimento3") String rendimento3Str) {

        Cliente cliente = new Cliente();
        cliente.nome = nome;
        cliente.rg = rg;
        cliente.cpf = cpf;
        cliente.endereco = endereco;
        cliente.profissao = profissao;
        cliente.rendimento1 = parseBigDecimal(rendimento1Str);
        cliente.rendimento2 = parseBigDecimal(rendimento2Str);
        cliente.rendimento3 = parseBigDecimal(rendimento3Str);

        Set<ConstraintViolation<Cliente>> violacoes = validator.validate(cliente);
        if (!violacoes.isEmpty()) {
            List<String> erros = violacoes.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.toList());
            return Response.ok(
                formulario.data("cliente", cliente)
                          .data("modo", "novo")
                          .data("erros", erros)
            ).build();
        }

        if (!validarCpf(cpf)) {
            return Response.ok(
                formulario.data("cliente", cliente)
                          .data("modo", "novo")
                          .data("erros", List.of("CPF inválido"))
            ).build();
        }

        if (!validarRg(rg)) {
            return Response.ok(
                formulario.data("cliente", cliente)
                          .data("modo", "novo")
                          .data("erros", List.of("RG inválido"))
            ).build();
        }

        cliente.persist();
        return Response.seeOther(URI.create("/clientes")).build();
    }

    @POST
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Transactional
    public Response atualizar(
            @PathParam("id") Long id,
            @FormParam("_method") String method,
            @FormParam("nome") String nome,
            @FormParam("rg") String rg,
            @FormParam("cpf") String cpf,
            @FormParam("endereco") String endereco,
            @FormParam("profissao") String profissao,
            @FormParam("rendimento1") String rendimento1Str,
            @FormParam("rendimento2") String rendimento2Str,
            @FormParam("rendimento3") String rendimento3Str) {

        if ("DELETE".equals(method)) {
            return deletar(id);
        }

        Cliente cliente = Cliente.buscarPorId(id);
        if (cliente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        cliente.nome = nome;
        cliente.rg = rg;
        cliente.cpf = cpf;
        cliente.endereco = endereco;
        cliente.profissao = profissao;
        cliente.rendimento1 = parseBigDecimal(rendimento1Str);
        cliente.rendimento2 = parseBigDecimal(rendimento2Str);
        cliente.rendimento3 = parseBigDecimal(rendimento3Str);

        Set<ConstraintViolation<Cliente>> violacoes = validator.validate(cliente);
        if (!violacoes.isEmpty()) {
            List<String> erros = violacoes.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.toList());
            return Response.ok(
                formulario.data("cliente", cliente)
                          .data("modo", "editar")
                          .data("erros", erros)
            ).build();
        }

        if (!validarCpf(cpf)) {
            return Response.ok(
                formulario.data("cliente", cliente)
                          .data("modo", "editar")
                          .data("erros", List.of("CPF inválido"))
            ).build();
        }

        if (!validarRg(rg)) {
            return Response.ok(
                formulario.data("cliente", cliente)
                          .data("modo", "editar")
                          .data("erros", List.of("RG inválido"))
            ).build();
        }

        return Response.seeOther(URI.create("/clientes")).build();
    }

    @Transactional
    public Response deletar(Long id) {
        Cliente cliente = Cliente.buscarPorId(id);
        if (cliente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        cliente.delete();
        return Response.seeOther(URI.create("/clientes")).build();
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
