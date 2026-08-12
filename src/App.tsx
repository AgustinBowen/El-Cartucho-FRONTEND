import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Home } from './screens/Home';
import { SuccessScreen } from './screens/SuccessScreen';
import { PaymentFailureScreen } from './screens/PaymentFailureScreen';
import { PaymentPendingScreen } from './screens/PaymentPendingScreen';
import { ErrorScreen } from './screens/ErrorScreen';
import { Catalog } from './screens/Catalog';
import { CartScreen } from './screens/CartScreen';
import { CartProvider } from "./context/CartContext";
import { ProductDetail } from "./screens/ProductDetail"
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { Profile } from './screens/Profile';
import { WishlistScreen } from './screens/WishlistScreen';
import { useState, useEffect } from 'react';
import ReloadPrompt from './components/ReloadPrompt';

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
			<AuthProvider>
				<WishlistProvider>
					<Router>
						<CartProvider>
							<Navbar />
							<Routes>
								<Route path="/" element={<Home />} />
								<Route path="/catalogo" element={<Catalog />} />
								<Route path="/comprar" element={<CartScreen />} />
								<Route path="/producto/:id" element={<ProductDetail />} />
								<Route path="/pago/success/*" element={<SuccessScreen />} />
								<Route path="/pago/failure/*" element={<PaymentFailureScreen />} />
								<Route path="/pago/pending/*" element={<PaymentPendingScreen />} />
								<Route path="/perfil" element={<Profile />} />
								<Route path="/wishlist" element={<WishlistScreen />} />
								<Route path="/*" element={<ErrorScreen />} />
							</Routes>
						</CartProvider>
					</Router>
					<ReloadPrompt />
				</WishlistProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;
