import React, { useEffect, useState } from "react";
import type { Producto } from "../types/Producto";
import { CardComponent } from "../components/Card";

export const Catalog: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/producto/listar`);
        if (!response.ok) {
          throw new Error("Error al obtener productos");
        }

        const data = await response.json();
        setProductos(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-screen-xl mx-auto p-4">
      {productos.map((producto) => (
        <CardComponent
          key={producto.id}
          imgSrc={producto.imagen}
          imgAlt={producto.nombre}
          title={producto.nombre}
          description={`Precio: $${producto.precio}`}
          producto_id={producto.id} // Asegúrate de que el id sea un número
          price={producto.precio}
        />
      ))}
    </div>
  );
};
