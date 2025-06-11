import { useState } from 'react';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-[var(--color-foreground)]">
            Flowbite
          </span>
        </a>

        {/* Search + Hamburger */}
        <div className="flex md:order-2 items-center gap-2">
          {/* Search input visible en md+ */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-[var(--color-foreground)]/70"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full p-2 ps-10 text-sm text-[var(--color-foreground)] border border-[var(--color-border)] rounded-lg bg-[var(--color-muted)]
              focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] placeholder:text-[var(--color-foreground)]/50"
              placeholder="Search..."
            />
          </div>

          {/* Hamburger button */}
          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-[var(--color-foreground)] rounded-lg md:hidden hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border)]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-controls="navbar-menu"
            aria-expanded={menuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            menuOpen ? 'block' : 'hidden'
          }`}
          id="navbar-menu"
        >
          {/* Search input visible solo en mobile */}
          <div className="relative mt-3 md:hidden mb-4">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-[var(--color-foreground)]/70"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full p-2 ps-10 text-sm text-[var(--color-foreground)] border border-[var(--color-border)] rounded-lg bg-[var(--color-muted)]
              focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] placeholder:text-[var(--color-foreground)]/50"
              placeholder="Search..."
            />
          </div>

          {/* Links */}
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-[var(--color-border)] rounded-lg bg-[var(--color-muted)]
          md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-[var(--color-background)]">
            <li>
              <a
                href="#"
                className="block py-2 px-3 text-[var(--color-primary)] bg-[var(--color-accent)] rounded-sm md:bg-transparent md:p-0 hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)]"
                aria-current="page"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 px-3 text-[var(--color-foreground)] rounded-sm hover:bg-[var(--color-accent)] md:hover:bg-transparent md:hover:text-[var(--color-primary)] md:p-0"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 px-3 text-[var(--color-foreground)] rounded-sm hover:bg-[var(--color-accent)] md:hover:bg-transparent md:hover:text-[var(--color-primary)] md:p-0"
              >
                Services
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
