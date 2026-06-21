export function Footer({ id }: { id?: string }) {
  return (
    <footer id={id} className="border-t border-gray-100 bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-sm font-semibold text-teal-700">Golden Age</p>
            <p className="mt-1 text-xs text-gray-400">Child growth & development tracking</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <a href="/about" className="hover:text-teal-600">About</a>
            <a href="/privacy" className="hover:text-teal-600">Privacy Policy</a>
            <a href="/terms" className="hover:text-teal-600">Terms of Service</a>
            <a href="/contact" className="hover:text-teal-600">Contact</a>
          </nav>
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">&copy; {new Date().getFullYear()} Golden Age. All rights reserved.</p>
      </div>
    </footer>
  );
}
