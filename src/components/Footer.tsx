export function Footer() {
  const footerLinks = {
    product: [
      { name: "GitHub", href: "https://github.com/skandan-v" },
      { name: "Documentation", href: "https://github.com/skandan-v/vercel-bulk-manager#readme" },
      { name: "API Reference", href: "https://vercel.com/docs/rest-api" },
    ],
    support: [
      { name: "Help Center", href: "https://github.com/skandan-v/vercel-bulk-manager/wiki" },
      { name: "Report Issues", href: "https://github.com/skandan-v/vercel-bulk-manager/issues" },
      { name: "Contact", href: "mailto:skandan@hyperdyn.tech" },
    ],
    company: [
      { name: "Hyperdyn", href: "https://hyperdyn.tech" },
      { name: "Portfolio", href: "https://hyperdyn.tech" },
      { name: "Twitter/X", href: "https://twitter.com/@v_skandan" },
    ],
  };

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Hyperdyn
              </h3>
            </div>
            <h4 className="text-base mb-2">Vercel Bulk Manager</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Powerful bulk deployment management tool for Vercel. Streamline your workflow with efficient project and deployment operations.
            </p>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <div className="absolute h-2 w-2 rounded-full bg-success animate-ping" />
              </div>
              <span className="text-xs text-muted-foreground">All systems operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Developer</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} Hyperdyn. Built with precision and care for developers.
            </p>
            <p className="text-xs text-muted-foreground text-center sm:text-right">
              Developed by{" "}
              <a
                href="https://github.com/skandan-v"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline font-medium"
              >
                Skandan V
              </a>
              {" • "}
              <a
                href="https://hyperdyn.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline font-medium"
              >
                Hyperdyn
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
