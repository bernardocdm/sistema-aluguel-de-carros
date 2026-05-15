package com.aluguel.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "automoveis")
public class Automovel extends PanacheEntity {

    @NotBlank(message = "Marca é obrigatória")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    public String marca;

    @NotBlank(message = "Modelo é obrigatório")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    public String modelo;

    @NotNull(message = "Ano é obrigatório")
    @Column(nullable = false)
    public Integer ano;

    @NotBlank(message = "Placa é obrigatória")
    @Size(max = 20)
    @Column(nullable = false, unique = true, length = 20)
    public String placa;

    @NotNull(message = "Valor da diária é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor da diária deve ser maior que zero")
    @Column(nullable = false, precision = 10, scale = 2)
    public BigDecimal valorDiaria;

    @Column(length = 50)
    public String status = "disponivel";

    @Column(length = 500)
    public String urlImagem;

    public static List<Automovel> listarTodos() {
        return Automovel.listAll();
    }

    public static Automovel buscarPorId(Long id) {
        return Automovel.findById(id);
    }

    public static List<Automovel> listarDisponiveis() {
        return Automovel.find("status", "disponivel").list();
    }
}
