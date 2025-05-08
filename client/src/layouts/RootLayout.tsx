import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface RootLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const RootLayout = ({ children, showNav = true }: RootLayoutProps) => {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      {showNav && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                RichLance
              </span>
            </Link>
            
            <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
              <nav className="flex items-center space-x-6 text-sm">
                <Link
                  href="/"
                  className={`transition-colors hover:text-primary ${
                    location === "/" ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/plans"
                  className={`transition-colors hover:text-primary ${
                    location === "/plans" ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  Investment Plans
                </Link>
                <Link
                  href="/about"
                  className={`transition-colors hover:text-primary ${
                    location === "/about" ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className={`transition-colors hover:text-primary ${
                    location === "/contact" ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  Contact
                </Link>
              </nav>
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    {isAdmin ? (
                      <Button asChild variant="outline">
                        <Link href="/admin">Admin Dashboard</Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline">
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Welcome, {user?.firstName || "User"}
                    </div>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex md:hidden flex-1 justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader className="mb-6">
                    <SheetTitle>RichLance</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className={`text-base transition-colors hover:text-primary ${
                          location === "/" ? "text-primary font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/plans"
                        className={`text-base transition-colors hover:text-primary ${
                          location === "/plans" ? "text-primary font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        Investment Plans
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/about"
                        className={`text-base transition-colors hover:text-primary ${
                          location === "/about" ? "text-primary font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        About Us
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/contact"
                        className={`text-base transition-colors hover:text-primary ${
                          location === "/contact" ? "text-primary font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        Contact
                      </Link>
                    </SheetClose>
                    
                    <div className="pt-4 border-t">
                      {isAuthenticated ? (
                        <>
                          <div className="mb-4 text-sm text-muted-foreground">
                            Welcome, {user?.firstName || "User"}
                          </div>
                          {isAdmin ? (
                            <SheetClose asChild>
                              <Button asChild className="w-full">
                                <Link href="/admin">Admin Dashboard</Link>
                              </Button>
                            </SheetClose>
                          ) : (
                            <SheetClose asChild>
                              <Button asChild className="w-full">
                                <Link href="/dashboard">Dashboard</Link>
                              </Button>
                            </SheetClose>
                          )}
                        </>
                      ) : (
                        <div className="space-y-3">
                          <SheetClose asChild>
                            <Button asChild variant="outline" className="w-full">
                              <Link href="/login">Login</Link>
                            </Button>
                          </SheetClose>
                          <SheetClose asChild>
                            <Button asChild className="w-full">
                              <Link href="/register">Register</Link>
                            </Button>
                          </SheetClose>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showNav && (
        <footer className="border-t bg-background py-8 md:py-12">
          <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  RichLance
                </span>
              </Link>
              <p className="text-muted-foreground text-sm">
                A premier investment platform with a multi-level marketing structure.
                Build your wealth through smart investments and grow your network.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-base font-medium">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
                </li>
                <li>
                  <Link href="/plans" className="text-muted-foreground hover:text-primary transition-colors">Investment Plans</Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-base font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Risk Disclosure</Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Anti-Money Laundering</Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-base font-medium">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span className="text-muted-foreground">+1 (888) 123-4567</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <span className="text-muted-foreground">support@richlance.com</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="text-muted-foreground">123 Investment Ave, New York, NY 10004</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="container mt-8 border-t pt-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} RichLance. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/124px-PayPal.svg.png" alt="PayPal" className="h-6" />
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="18" fill="#26A17B" />
                  <path d="M18.75 14.25V21.75H17.25V14.25H18.75ZM23.25 15.75V20.25H21.75V15.75H23.25ZM14.25 15.75V20.25H12.75V15.75H14.25Z" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default RootLayout;
