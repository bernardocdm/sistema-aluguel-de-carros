package com.aluguel.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido extends PanacheEntity {

    @NotNull(message = "Cliente é obrigatório")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    public Cliente cliente;

    @NotNull(message = "Automóvel é obrigatório")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "automovel_id", nullable = false)
    public Automovel automovel;

    @NotNull(message = "Data de início é obrigatória")
    @Column(nullable = false)
    public LocalDate dataInicio;

    @NotNull(message = "Data de fim é obrigatória")
    @Column(nullable = false)
    public LocalDate dataFim;

    @Column(length = 50)
    public String status = "pendente";

    @Column(length = 500)
    public String objetivo;

    public static List<Pedido> listarPorCliente(Long clienteId) {
        return Pedido.find(
                "cliente.id = ?1",
                clienteId).list();
    }

    public static Pedido buscarPorId(Long id) {
        return Pedido.findById(id);
    }
}
