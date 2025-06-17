import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Home } from './screens/Home';
import { SuccessScreen } from './screens/SuccessScreen';
import { ErrorScreen } from './screens/ErrorScreen';
import { Catalog } from './screens/Catalog';
import { CartScreen } from './screens/CartScreen';
import { CartProvider } from "./context/CartContext";
import { ProductDetail } from "./screens/ProductDetail"

function App() {
	return (
		<Router>
			<CartProvider>
				<Navbar />  {/* Ahora SI adentro del Router */}
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/catalogo" element={<Catalog />} />
					<Route path="/comprar" element={<CartScreen />} />
					<Route path="/producto/:id" element={<ProductDetail />} />
					<Route path="/pago/success*" element={<SuccessScreen />} />
					<Route path="/*" element={<ErrorScreen />} />
				</Routes>
			</CartProvider>
		</Router>
	);
}

export default App;
