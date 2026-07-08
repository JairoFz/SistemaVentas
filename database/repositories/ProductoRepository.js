const db = require("../database");

class ProductoRepository {

    obtenerTodos() {

        const productos = db.prepare(`
            SELECT *
            FROM productos
            ORDER BY id DESC
        `).all();

        return productos;
    }

}

module.exports = new ProductoRepository();