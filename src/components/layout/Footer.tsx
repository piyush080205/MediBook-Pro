import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm text-primary-foreground/80">
          &copy; {new Date().getFullYear()} MediBook Pro. All rights reserved.
        </p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <Link href="#" className="text-sm hover:underline">
            Privacy Policy
          </Link>
          <Link href="#" className="text-sm hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
