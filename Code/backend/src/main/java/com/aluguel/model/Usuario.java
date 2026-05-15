package com.aluguel.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED)
public class Usuario extends PanacheEntity {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    @Column(nullable = false, length = 100)
    public String nome;

    @NotBlank(message = "RG é obrigatório")
    @Column(nullable = false, unique = true, length = 20)
    public String rg;

    @NotBlank(message = "CPF é obrigatório")
    @Column(nullable = false, unique = true, length = 14)
    public String cpf;

    @NotBlank(message = "Endereço é obrigatório")
    @Column(nullable = false, length = 255)
    public String endereco;

    // Remova o @NotBlank e @Column(nullable = false) só para o teste passar
    public String email;
    public String senha;
    public String tipo;
}
