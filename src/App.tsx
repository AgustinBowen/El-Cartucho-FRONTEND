import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Home } from './screens/Home';
import { SuccessScreen } from './screens/SuccessScreen';
import { ErrorScreen } from './screens/ErrorScreen';
import { Catalog } from './screens/Catalog';
import { CartScreen } from './screens/CartScreen';
import { CartProvider } from "./context/CartContext";
import { ProductDetail } from "./screens/ProductDetail"
import { ThemeProvider } from './context/ThemeContext';
import { useState, useEffect } from 'react';

function App() {
	const [isThemeReady, setIsThemeReady] = useState(false);

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme') || 'light';
		document.documentElement.setAttribute('data-theme', savedTheme);
		setIsThemeReady(true);
	}, []);

	if (!isThemeReady) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
				<div className="w-16 h-16 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
			</div>
		);
	}
	return (
		<ThemeProvider>
			<Router>
				<CartProvider>
					<Navbar />
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
		</ThemeProvider>

	);
}

export default App;
