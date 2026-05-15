package com.aluguel.controller;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;
import java.net.URI;

@Path("/")
public class IndexController {

    @GET
    public Response index() {
        return Response.seeOther(URI.create("/clientes")).build();
    }
}
