// CardComponent.tsx
import { useCart } from "../context/CartContext";

type CardProps = {
  producto_id: number; // nuevo!
  imgSrc: string;
  imgAlt: string;
  title: string;
  description: string;
  price: number;
};

export const CardComponent: React.FC<CardProps> = ({
  producto_id,
  imgSrc,
  imgAlt,
  title,
  description,
  price
}) => {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart({
      producto_id,
      title,
      price
    });
  };

  return (
    <div className="flex flex-row lg:flex-col max-w-sm lg:max-w-md bg-primary border border-muted rounded-2xl shadow-md overflow-hidden">
      <img
        className="w-1/3 h-auto object-cover lg:w-full lg:h-48"
        src={imgSrc}
        alt={imgAlt}
      />
      <div className="p-5 flex flex-col justify-center flex-1">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          {title}
        </h5>
        <p className="font-normal text-primary dark:text-gray-400 mb-4">
          {description}
        </p>
        <button
          onClick={handleAdd}
          className="mt-auto inline-block bg-secondary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};
