"use client";

import Link from "next/link";
import { Stethoscope, LogOut, Menu, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth, useUser } from "@/firebase";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { toast } from "@/hooks/use-toast";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/doctors", label: "Find a Doctor" },
    { href: "/dashboard", label: "My Appointments" },
]

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleLogin = () => {
    try {
        initiateAnonymousSignIn(auth);
        toast({ title: "Logged In", description: "You are now logged in with a temporary account." });
    } catch (error) {
        console.error("Anonymous sign-in failed:", error);
        toast({ title: "Login Failed", description: "Could not log in anonymously. Please try again.", variant: "destructive" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block font-headline text-lg">
            MediBook Pro
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {!isUserLoading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{user.isAnonymous ? 'A' : getInitials(user.uid)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Anonymous User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.uid}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <Button onClick={handleLogin}>
                    <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
            )
          )}
        </div>
        <div className="md:hidden ml-4">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-6">
                 <Link href="/" className="flex items-center space-x-2 mb-6">
                    <Stethoscope className="h-6 w-6 text-primary" />
                    <span className="font-bold font-headline text-lg">
                      MediBook Pro
                    </span>
                  </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex w-full items-center py-2 text-lg font-semibold"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
