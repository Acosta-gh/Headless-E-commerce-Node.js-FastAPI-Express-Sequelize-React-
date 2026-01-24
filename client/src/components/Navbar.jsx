import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import auroraImage from "@/assets/logo.png";

import {
  Menu,
  Mountain,
  Shell,
  Search,
  User,
  Newspaper,
  LogOut,
  Home,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

import SearchDialog from "./navbar/SearchDialog.jsx";

function Navbar() {
  // -------------------
  //      🪝 Hooks
  // -------------------
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  // -------------------
  //      Booleans
  // -------------------
  // Show search button only on specific pages
  const showSearchButton =
    location.pathname === "/" || location.pathname === "/articles";

  const showProfileButton = location.pathname !== "/profile";

  // -------------------
  //      🎲 Data
  // -------------------
  // In the future, I'll add more pages
  const navItems = [
    //{ label: "Home", href: "/" },
    //{ label: "About", href: "/about" },
  ];

  // -------------------
  //     🖐️ Handlers
  // -------------------
  // Logout handler
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-25">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8 ">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-5 mr-6 flex-shrink-0">
          {/*  <Shell className="h-6 w-6" /> */}
          <img
            src={auroraImage}
            alt="Aurora Logo"
            className="h-8 w-auto object-contain md:h-10"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex justify-center space-x-4">
          {navItems.map((item) => (
            <Button variant="ghost" size="sm" key={item.href} className="">
              <Link
                key={item.href}
                to={item.href}
                className="px-3 py-2 text-sm font-medium transition-colors text-foreground/80"
              >
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-auto  lg:block">
          <div className="hidden lg:block ">
            {/* Search Dialog */}
            {showSearchButton && <SearchDialog />}
            {/* Profile Button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex cursor-pointer"
              asChild
            >
              {showProfileButton && (
                <Link to="/profile">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Link>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex cursor-pointer"
              asChild
              onClick={handleLogout}
            >
              {!showProfileButton && (
                <div className="w-full flex items-center p-2">
                  <LogOut />
                  <span>Logout</span>
                </div>
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <div className="flex items-center gap-2 p-4">
                <Shell className="h-6 w-6" />
                <span className="font-bold text-lg">FOSS News</span>
              </div>
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <SheetTrigger asChild key={item.href}>
                    <Link
                      to={item.href}
                      className="text-base font-medium transition-colors hover:text-foreground/80"
                    >
                      {item.label}
                    </Link>
                  </SheetTrigger>
                ))}
              </nav>
              <div className="p-4 pt-0 lg:hidden flex flex-col gap-2">
                <SheetTrigger asChild>
                  <Button className="w-full border" variant="ghost" asChild>
                    <Link to="/profile">
                      <User /> <span>Profile</span>
                    </Link>
                  </Button>
                </SheetTrigger>
                {showSearchButton && <SearchDialog />}
                {!showProfileButton && (
                  <SheetTrigger asChild>
                    <Link to="/">
                      <Button className="w-full border" variant="ghost">
                        <Home />
                        <span>Go Home</span>
                      </Button>
                    </Link>
                  </SheetTrigger>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
