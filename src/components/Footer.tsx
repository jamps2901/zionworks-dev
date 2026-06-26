import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="text-3xl font-bold text-gradient mb-4">
              Zion Works
            </div>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              World-class web and app development for Kiwi businesses. 
              From King Country to the Cloud, we build tech that works.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-secondary" />
                <span>King Country, Waikato, New Zealand</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-secondary" />
                <span>+64223536095</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-secondary" />
                <span>contactus@zionworks.dev</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-secondary" />
                <span>jamps0129@outlook.co.nz</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-secondary transition-colors text-left">Website Development</button></li>
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-secondary transition-colors text-left">Mobile Apps</button></li>
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-secondary transition-colors text-left">AI Automation</button></li>
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-secondary transition-colors text-left">Custom Software</button></li>
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-secondary transition-colors text-left">Digital Strategy</button></li>
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-secondary transition-colors text-left">Support & Maintenance</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-secondary transition-colors text-left">About Us</button></li>
              <li><button onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-secondary transition-colors text-left">Portfolio</button></li>
              <li><button onClick={() => document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-secondary transition-colors text-left">Blog</button></li>
              <li><button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-secondary transition-colors text-left">Contact</button></li>
            </ul>
          </div>
        </div>

        {/* Local Pride Section */}
        <div className="border-t border-primary-foreground/20 pt-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-secondary/20 backdrop-blur-sm border border-secondary/30 rounded-full text-secondary text-sm font-medium mb-4">
              🥝 Proudly Built in King Country, New Zealand
            </div>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto">
              Supporting local businesses across Ōtorohanga, Te Kuiti, Waitomo, and the wider King Country region. 
              We understand the unique challenges and opportunities of rural New Zealand business.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-primary-foreground/60 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Zion Works Ltd. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <a href="/privacy" className="text-primary-foreground/60 hover:text-secondary text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-primary-foreground/60 hover:text-secondary text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;