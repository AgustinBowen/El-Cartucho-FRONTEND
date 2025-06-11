import { useCart } from "../context/CartContext";
import { useState } from "react";

export const CartScreen = () => {
  const { cartItems, updateQuantity, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [success] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const handleConfirmPurchase = async () => {
    setLoading(true);
    setError(null);

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ed/pedido/crear`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-vercel-protection-bypass": import.meta.env.protectionBypassToken,
        },
        body: JSON.stringify({
            productos: cartItems.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.quantity,
            })),
        }),
        });

        if (!response.ok) {
        throw new Error(`Error al crear pedido: ${response.statusText}`);
        }

        const data = await response.json();

        // ✅ Redirigimos a Mercado Pago
        window.location.href = data.mercado_pago_url;

    } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Carrito de Compras</h2>
      {cartItems.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.producto_id} className="border p-2 rounded">
              <h3 className="font-bold">{item.title}</h3>
              <p>Precio: ${item.price}</p>
              <label className="block">
                Cantidad:
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateQuantity(item.producto_id, Number(e.target.value))}
                  className="border ml-2 p-1 w-16"
                />
              </label>
              <p>Subtotal: ${item.price * item.quantity}</p>
            </div>
          ))}
          <hr />
          <h3 className="text-xl font-bold">Total: ${total}</h3>

          <button
            onClick={handleConfirmPurchase}
            disabled={loading}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            {loading ? "Enviando pedido..." : "Confirmar compra"}
          </button>

          {success && <p className="text-green-600 mt-2">¡Pedido enviado correctamente!</p>}
          {error && <p className="text-red-600 mt-2">Error: {error}</p>}
        </div>
      )}
    </div>
  );
};
