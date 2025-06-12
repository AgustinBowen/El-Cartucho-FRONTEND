import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Home } from './screens/Home';
import { SuccessScreen } from './screens/SuccessScreen';
import { ErrorScreen } from './screens/ErrorScreen';
import { Catalog } from './screens/Catalog';
import { CartScreen } from './screens/CartScreen';
import { CartProvider } from "./context/CartContext";


function App() {
	return (
		<Router>
			<CartProvider>
				<Navbar />  {/* Ahora SI adentro del Router */}
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/catalogo" element={<Catalog />} />
					<Route path="/comprar" element={<CartScreen />} />
					<Route path="/pago/success*" element={<SuccessScreen />} />
					<Route path="/*" element={<ErrorScreen />} />
				</Routes>
			</CartProvider>
		</Router>
	);
}

export default App;
