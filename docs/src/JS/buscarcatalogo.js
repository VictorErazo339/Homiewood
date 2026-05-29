import { useState } from "react";
import { buscarCatalogo } from "./api/catalogoApi";
import { agregarContenidoExternoALista } from "./api/listasApi";

function BuscadorCatalogo({ idLista }) {
    const [query, setQuery] = useState("");
    const [resultados, setResultados] = useState([]);

    async function buscar() {
        try {
            const data = await buscarCatalogo(query);
            setResultados(data);
        } catch (error) {
            console.error("Error buscando catálogo:", error);
        }
    }

    async function agregarALista(item) {
        try {
            await agregarContenidoExternoALista(idLista, {
                proveedor: item.proveedor,
                apiId: item.apiId,
                titulo: item.titulo,
                tipoContenido: item.tipoContenido,
                descripcion: item.descripcion,
                fechaEstreno: item.fechaEstreno,
                anioEstreno: item.anioEstreno,
                posterUrl: item.posterUrl,
                idiomaOriginal: item.idiomaOriginal,
                puntajeExterno: item.puntajeExterno,
                posicion: 1,
                estado: "POR_VER",
                notaUsuario: "Agregado desde el buscador",
            });

            alert("Contenido agregado a la lista");
        } catch (error) {
            console.error("Error agregando contenido:", error);
            alert(error.message || "No se pudo agregar");
        }
    }

    return (
        <div>
            <h1>Buscar películas, series o anime</h1>

            <input
                type="text"
                placeholder="Buscar..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />

            <button onClick={buscar}>Buscar</button>

            <div>
                {resultados.map((item) => (
                    <div key={`${item.proveedor}-${item.apiId}`}>
                        {item.posterUrl && (
                            <img src={item.posterUrl} alt={item.titulo} width="120" />
                        )}

                        <h3>{item.titulo}</h3>
                        <p>{item.tipoContenido}</p>
                        <p>{item.anioEstreno}</p>
                        <p>{item.descripcion}</p>

                        <button onClick={() => agregarALista(item)}>
                            Agregar a lista
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BuscadorCatalogo;