import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Moon, Sun, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { name: 'Home', href: '#', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { name: 'About', href: '#about', action: () => {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    }},
    { name: 'Services', href: '#services', action: () => {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    }},
    { name: 'Portfolio', href: '#portfolio', action: () => {
      document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
    }},
    { name: 'Blog', href: '#blog', action: () => {
      document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
    }},
    { name: 'Resources', href: '/resources', action: () => {
      window.location.href = '/resources';
    }},
    { name: 'Client Portal', href: '/client-portal', action: () => {
      window.location.href = '/client-portal';
    }},
    { name: 'Contact', href: '#contact', action: () => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }}
  ];

  return (
    <motion.nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrollY > 50 
          ? 'glass-nav backdrop-blur-2xl bg-background/80 shadow-glass' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2 min-w-fit"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src="/favicon.png" alt="Zion Works icon" className="w-8 h-8 flex-shrink-0" loading="lazy" />
            <div className="flex flex-col gap-0 whitespace-nowrap">
              <div className="text-xl sm:text-2xl font-bold text-gradient leading-none">
                Zion Works
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block font-medium mt-0.5">
                King Country 🇳🇿
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={item.action}
                className="nav-link text-foreground hover:text-secondary transition-all duration-300 font-medium py-2 px-1 bg-transparent border-none cursor-pointer whitespace-nowrap text-sm xl:text-base"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.name}
              </motion.button>
            ))}
          </div>

          {/* Right Side - Theme Toggle + CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-secondary" />
              )}
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:scale-105 transition-transform text-muted-foreground hover:text-foreground"
                onClick={() => window.location.href = '/admin'}
              >
                Admin
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:scale-105 transition-transform"
                onClick={() => {
                  document.getElementById('quote-wizard')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start' 
                  });
                }}
              >
                Get Quote
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                className="glow-button"
                onClick={() => {
                  document.getElementById('booking')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start' 
                  });
                }}
              >
                Book Call
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-secondary" />
              )}
            </button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:scale-105 transition-transform"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="lg:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-card rounded-lg mt-2 mb-4">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className="block px-3 py-2 text-foreground hover:text-secondary transition-colors duration-200 rounded-lg hover:bg-muted/50 w-full text-left bg-transparent border-none cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item.name}
                  </motion.button>
                ))}
                <motion.div 
                  className="px-3 py-2 space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      document.getElementById('quote-wizard')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start' 
                      });
                    }}
                  >
                    Get Quote
                  </Button>
                  <Button 
                    className="glow-button w-full"
                    onClick={() => {
                      document.getElementById('booking')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start' 
                      });
                      setIsOpen(false);
                    }}
                  >
                    Book Call
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      window.location.href = '/admin';
                      setIsOpen(false);
                    }}
                  >
                    Admin
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;