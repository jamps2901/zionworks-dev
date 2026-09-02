import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

const Terms = () => {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="The terms that apply when you use Zion Works services or this website."
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
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: 2026</p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">About these terms</h2>
              <p>
                Zion Works is a New Zealand-based web development and AI automation
                service, operated by an individual founder. These terms apply when you
                use zionworks.dev or engage Zion Works for a project.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Services and quotes</h2>
              <p>
                Prices shown on this site (for websites, AI automation, mobile apps, and
                related services) are indicative starting prices. A final quote is
                confirmed in writing after discussing your specific requirements. Quote
                requests submitted through this site are not a binding contract until
                both parties agree to a scope of work and price.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Payment</h2>
              <p>
                Payment terms (deposits, milestones, or full payment) are agreed
                individually per project before work begins. Specific terms will be
                confirmed directly with you, not assumed from this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Intellectual property</h2>
              <p>
                Unless otherwise agreed in writing, ownership of custom code, designs, and
                content built specifically for your project transfers to you upon final
                payment. Zion Works retains the right to showcase completed work as a
                portfolio example unless you request otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">AI features</h2>
              <p>
                This site includes AI-assisted tools (chat assistant, voice assistant, and
                quote/brief generation). Responses from these tools are generated
                automatically and may occasionally be inaccurate — they're a starting
                point for a conversation, not a guaranteed quote or professional advice.
                Any AI-drafted quote or brief is reviewed by a person before being treated
                as final.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Limitation of liability</h2>
              <p>
                Zion Works will take reasonable care in delivering services, but does not
                guarantee specific business outcomes (such as sales, leads, or search
                rankings) resulting from a website, app, or automation build. To the
                extent permitted by New Zealand law, liability is limited to the amount
                paid for the relevant service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Governing law</h2>
              <p>
                These terms are governed by the laws of New Zealand.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Contact us</h2>
              <p>
                Questions about these terms can be sent to{' '}
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

export default Terms;
