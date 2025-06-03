import { Outlet, Link } from "react-router-dom";

export default function RootLayout() {
  return (
    <div>
      <nav className="bg-gray-950 font-semibold text-white p-6 gap-4 flex items-center">
        <Link to="/" className="hover:text-blue-500">Home</Link> 
      </nav>
      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
