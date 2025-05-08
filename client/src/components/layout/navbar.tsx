import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <header className={`sticky top-0 z-50 w-full ${isScrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-sm"} transition-all duration-200`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <span className="text-2xl font-bold">
                  <span className="text-primary">Rich</span>
                  <span className="text-secondary">Lance</span>
                </span>
              </a>
            </Link>
            <nav className="hidden ml-10 space-x-8 md:flex">
              <Link href="/">
                <a className="text-base font-medium text-gray-700 hover:text-primary">Home</a>
              </Link>
              <Link href="/plans">
                <a className="text-base font-medium text-gray-700 hover:text-primary">Investment Plans</a>
              </Link>
              <Link href="/about">
                <a className="text-base font-medium text-gray-700 hover:text-primary">About Us</a>
              </Link>
              <Link href="/contact">
                <a className="text-base font-medium text-gray-700 hover:text-primary">Contact</a>
              </Link>
            </nav>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={handleLogout}>
                  Log out
                </Button>
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                  <Button>
                    {user.role === "admin" ? "Admin Dashboard" : "Dashboard"}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex md:hidden">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/">
            <a
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
          </Link>
          <Link href="/plans">
            <a
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Investment Plans
            </a>
          </Link>
          <Link href="/about">
            <a
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </a>
          </Link>
          <Link href="/contact">
            <a
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </a>
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-5">
            {user ? (
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
                </div>
              </div>
            ) : null}
            {user ? (
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user.email}
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-3 px-2 space-y-1">
            {user ? (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                  <a
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    {user.role === "admin" ? "Admin Dashboard" : "Dashboard"}
                  </a>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <a
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Log In
                  </a>
                </Link>
                <Link href="/register">
                  <a
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
