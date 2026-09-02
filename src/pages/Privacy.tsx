import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

const Privacy = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="How Zion Works collects, uses, and protects your personal information."
        noIndex
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link
                to="/"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <Link
                to="/"
                className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <Home className="h-4 w-4" />
                Main Website
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: 2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Who we are</h2>
              <p>
                Zion Works ("we", "us") is a New Zealand-based web development and AI
                automation service, operated by an individual founder based in King Country,
                Waikato. This policy explains what personal information we collect through
                zionworks.dev, why, and how it's handled, in line with the New Zealand
                Privacy Act 2020.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">What we collect</h2>
              <p className="mb-2">When you use this site, we may collect:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name, email address, and phone number you provide via the Contact form, Quote Wizard, or Booking form</li>
                <li>The content of messages, quote requests, and booking details you submit</li>
                <li>If you use the AI chat or voice assistant, the text or voice content of that conversation</li>
                <li>Basic technical data (browser type, general location, pages visited) if analytics is enabled</li>
              </ul>
              <p className="mt-2">
                We do not collect payment card details, government ID numbers, or other
                sensitive information through this site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">How we use it</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To respond to your enquiry, quote request, or booking</li>
                <li>To deliver services you've engaged us for</li>
                <li>To improve the site and the AI assistant's usefulness</li>
                <li>We do not sell your personal information to third parties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Third-party services we use</h2>
              <p className="mb-2">
                To run this site and deliver services, we rely on the following processors,
                each of which has its own privacy practices:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Supabase</strong> — database and authentication, where submitted form data is stored</li>
                <li><strong>Resend</strong> — sends transactional emails (confirmations, notifications)</li>
                <li><strong>OpenAI</strong> — powers the AI chat and voice assistant features</li>
                <li><strong>Cloudflare</strong> — hosts and serves this website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Cookies</h2>
              <p>
                This site may use cookies or similar local storage for essential site
                functionality and, where enabled, anonymised analytics to understand how
                the site is used. We do not use cookies for third-party advertising.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Your rights</h2>
              <p>
                Under the Privacy Act 2020, you have the right to ask what personal
                information we hold about you, request a correction, or ask us to delete
                it. To do so, contact us using the details below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Contact us</h2>
              <p>
                Questions about this policy or your data can be sent to{' '}
                <a href="mailto:contactus@zionworks.dev" className="text-secondary hover:underline">
                  contactus@zionworks.dev
                </a>.
              </p>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Privacy;
