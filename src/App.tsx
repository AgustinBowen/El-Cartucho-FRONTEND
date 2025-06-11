import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Home } from './screens/Home';
import { Catalog } from './screens/Catalog';

function App() {

	return (
		<>
				<Navbar />
				<Router>
					<Routes>
						<Route path="/" element={ <Home/> } />
						<Route path="/catalogo" element={<Catalog/>} />
					</Routes>
				</Router>
		</>
		
	);
}

export default App;