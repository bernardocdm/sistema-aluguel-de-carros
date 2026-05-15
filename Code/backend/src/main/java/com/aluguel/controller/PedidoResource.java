package com.aluguel.controller;

import com.aluguel.model.Automovel;
import com.aluguel.model.Cliente;
import com.aluguel.model.Pedido;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Validator;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.jboss.logging.Logger;

@Path("/api/pedidos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PedidoResource {

    private static final Logger LOG = Logger.getLogger(PedidoResource.class);

    @Inject
    Validator validator;

    @GET
    public List<Pedido> listar(@QueryParam("clienteId") Long clienteId) {
        if (clienteId != null) {
            return Pedido.listarPorCliente(clienteId);
        }
        return Pedido.listAll();
    }

    @GET
    @Path("/{id}")
    public Response buscarPorId(@PathParam("id") Long id) {
        Pedido pedido = Pedido.buscarPorId(id);
        if (pedido == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(pedido).build();
    }

    @POST
    @Transactional
    public Response criar(Map<String, Object> dados) {
        LOG.infof("Criando pedido com dados: %s", dados);

        Object clienteIdRaw = dados.get("clienteId");
        Object automovelIdRaw = dados.get("automovelId");
        Object dataInicioRaw = dados.get("dataInicio");
        Object dataFimRaw = dados.get("dataFim");

        if (clienteIdRaw == null || automovelIdRaw == null || dataInicioRaw == null || dataFimRaw == null) {
            LOG.errorf("Campos obrigatorios ausentes: clienteId=%s automovelId=%s dataInicio=%s dataFim=%s",
                    clienteIdRaw, automovelIdRaw, dataInicioRaw, dataFimRaw);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Campos obrigatórios ausentes").build();
        }

        Long clienteId = Long.valueOf(clienteIdRaw.toString());
        Long automovelId = Long.valueOf(automovelIdRaw.toString());
        String dataInicioStr = dataInicioRaw.toString();
        String dataFimStr = dataFimRaw.toString();

        Cliente cliente = Cliente.buscarPorId(clienteId);
        Automovel automovel = Automovel.buscarPorId(automovelId);

        LOG.infof("Cliente encontrado: %s | Automovel encontrado: %s", cliente != null ? cliente.id : "NULL", automovel != null ? automovel.id : "NULL");

        if (cliente == null || automovel == null) {
            LOG.errorf("Cliente (id=%d) ou automovel (id=%d) nao encontrado", clienteId, automovelId);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Cliente ou automóvel não encontrado").build();
        }

        LocalDate dataInicio = LocalDate.parse(dataInicioStr);
        LocalDate dataFim = LocalDate.parse(dataFimStr);
        
        if (dataFim.isBefore(dataInicio)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("A data de fim não pode ser anterior à data de início").build();
        }
        
        /*if (dataInicio.isBefore(LocalDate.now())) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("A data de início não pode ser no passado").build();
        }
        */
        if (!"disponivel".equals(automovel.status)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Automóvel não está disponível para aluguel").build();
        }
        
        Pedido pedido = new Pedido();
        pedido.cliente = cliente;
        pedido.automovel = automovel;
        pedido.dataInicio = dataInicio;
        pedido.dataFim = dataFim;
        pedido.status = "pendente";

        Object objValue = dados.get("objetivo");
        pedido.objetivo = (objValue != null && !objValue.toString().isBlank()) ? objValue.toString() : null;

        automovel.status = "alugado";
        try {
            pedido.persist();
            LOG.infof("Pedido criado com sucesso, id=%d", pedido.id);
        } catch (Exception e) {
            LOG.errorf(e, "Erro ao persistir pedido: %s", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erro ao salvar pedido: " + e.getMessage()).build();
        }

        return Response.status(Response.Status.CREATED).entity(pedido).build();
    }

    @PUT
    @Path("/{id}/status")
    @Transactional
    public Response atualizarStatus(@PathParam("id") Long id, Map<String, String> dados) {
        Pedido pedido = Pedido.buscarPorId(id);
        if (pedido == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        String novoStatus = dados.get("status");
        pedido.status = novoStatus;

        if ("finalizado".equals(novoStatus) || "recusado".equals(novoStatus)
                || "cancelado".equals(novoStatus) || "cancelado_pelo_cliente".equals(novoStatus)) {
            pedido.automovel.status = "disponivel";
        } else if ("aprovado".equals(novoStatus)) {
            pedido.automovel.status = "alugado";
        }

        return Response.ok(pedido).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deletar(@PathParam("id") Long id) {
        Pedido pedido = Pedido.buscarPorId(id);
        if (pedido == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if ("pendente".equals(pedido.status) || "aprovado".equals(pedido.status)) {
            pedido.automovel.status = "disponivel";
        }
        pedido.delete();
        return Response.status(Response.Status.NO_CONTENT).build();
    }
}
