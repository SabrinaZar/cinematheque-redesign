
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ma cinémathèque API",
            version: "1.0.0",
            description: "API REST pour gérer une collection personnelle de films"
        },
        
paths: {
    "/films": {
        post: {
            summary: "Ajouter un film",
            tags: ["Films"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/Film" }
                    }
                }
            },
            responses: {
                201: { description: "Film ajouté avec succès" },
                400: { description: "Données invalides" }
            }
        },
        get: {
            summary: "Lister et filtrer les films",
            tags: ["Films"],
            parameters: [
                {
                    name: "statut",
                    in: "query",
                    schema: {
                        type: "string",
                        enum: ["a_voir", "vu", "a_revoir"]
                    }
                },
                {
                    name: "genre",
                    in: "query",
                    schema: { type: "string" }
                },
                {
                    name: "q",
                    in: "query",
                    description: "Rechercher par titre",
                    schema: { type: "string" }
                }
            ],
            responses: {
                200: { description: "Liste des films récupérée" }
            }
        }
    },
    "/films/{id}": {
        parameters: [
            {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" }
            }
        ],
        get: {
            summary: "Consulter un film",
            tags: ["Films"],
            responses: {
                200: { description: "Film trouvé" },
                404: { description: "Film introuvable" }
            }
        },
        put: {
            summary: "Modifier un film",
            tags: ["Films"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/Film" }
                    }
                }
            },
            responses: {
                200: { description: "Film modifié" },
                404: { description: "Film introuvable" }
            }
        },
        delete: {
            summary: "Supprimer un film",
            tags: ["Films"],
            responses: {
                200: { description: "Film supprimé" },
                404: { description: "Film introuvable" }
            }
        }
    }
},

        servers: [
            {
                url: "http://localhost:5000",
                description: "Serveur local"
            }
        ],
        components: {
            schemas: {
                Film: {
                    type: "object",
                    required: ["titre"],
                    properties: {
                        _id: { type: "string", example: "671234567890abcdef123456" },
                        titre: { type: "string", example: "Inception" },
                        realisateur: { type: "string", example: "Christopher Nolan" },
                        annee: { type: "integer", example: 2010 },
                        genre: { type: "string", example: "Science-fiction" },
                        affiche: { type: "string", example: "https://example.com/film.jpg" },
                        statut: {
                            type: "string",
                            enum: ["a_voir", "vu", "a_revoir"],
                            default: "a_voir"
                        },
                        note: { type: "number", minimum: 0, maximum: 10, example: 9 },
                        avis: { type: "string", maxLength: 500, example: "Excellent film." }
                    }
                }
            }
        }
    
    },
    apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
