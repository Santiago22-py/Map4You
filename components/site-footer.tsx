import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-brand-navy/25 bg-brand-navy/5">
      <div className="page-shell py-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="shrink-0 w-[110px]">
            <Image
              src="/icons/logo.svg"
              alt="Map 4 You"
              width={110}
              height={32}
              className="w-full"
              style={{ height: "auto" }}
            />
          </Link>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="/legal/politica-cookies" className="hover:text-foreground transition-colors">
              Política de Cookies
            </Link>
            <Link href="/legal/condiciones-venta" className="hover:text-foreground transition-colors">
              Condiciones de Venta
            </Link>
            <Link href="/legal/aviso-legal" className="hover:text-foreground transition-colors">
              Aviso Legal
            </Link>
            <Link href="/legal/politica-privacidad" className="hover:text-foreground transition-colors">
              Política de Privacidad
            </Link>
          </nav>

          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Map4You S.L. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
