package com.aluguel.model;

import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "clientes")
public class Cliente extends Usuario {

    @NotBlank(message = "Profissão é obrigatória")
    @Size(min = 2, max = 100, message = "Profissão deve ter entre 2 e 100 caracteres")
    @Column(nullable = false, length = 100)
    public String profissao;

    @DecimalMin(value = "0.00", message = "Rendimento 1 não pode ser negativo")
    @Column(name = "rendimento1", precision = 15, scale = 2)
    public BigDecimal rendimento1;

    @DecimalMin(value = "0.00", message = "Rendimento 2 não pode ser negativo")
    @Column(name = "rendimento2", precision = 15, scale = 2)
    public BigDecimal rendimento2;

    @DecimalMin(value = "0.00", message = "Rendimento 3 não pode ser negativo")
    @Column(name = "rendimento3", precision = 15, scale = 2)
    public BigDecimal rendimento3;

    public BigDecimal totalRendimentos() {
        BigDecimal total = BigDecimal.ZERO;
        if (rendimento1 != null) total = total.add(rendimento1);
        if (rendimento2 != null) total = total.add(rendimento2);
        if (rendimento3 != null) total = total.add(rendimento3);
        return total;
    }

    public static List<Cliente> listarTodos() {
        return Cliente.listAll();
    }

    public static Cliente buscarPorId(Long id) {
        return Cliente.findById(id);
    }

    public static PanacheQuery<Cliente> buscarPorNome(String nome) {
        return Cliente.find("lower(nome) like lower(?1)", "%" + nome + "%");
    }
}
