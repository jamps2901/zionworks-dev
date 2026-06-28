import { motion } from 'framer-motion';
import { Heart, Users, Zap, Target, Globe, Award, Hexagon, MapPin, Code, Coffee } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-24 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About <span className="text-gradient">Zion Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Born from the rolling hills of King Country, we're building the digital future for Kiwi businesses
          </p>
        </motion.div>

        {/* Founder Story */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-secondary/10 rounded-full text-secondary text-sm font-medium mb-6">
              <MapPin className="w-4 h-4 mr-2" />
              Piopio, King Country, New Zealand
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Built by someone who <span className="text-gradient">actually lives this</span>
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                I'm a beekeeper with 50 hives, a father of two young kids, and a developer who builds 
                AI-powered web platforms from a rural property in Piopio. I'm not a faceless agency. 
                I'm your neighbour.
              </p>
              <p>
                I built ZionWorks because I watched local businesses around King Country struggle 
                to get online — not because they didn't want to, but because every agency they 
                talked to was in Auckland, charged Auckland prices, and spoke in jargon no farmer 
                or tradie has time for.
              </p>
              <p>
                When you work with me, you're not dealing with account managers or offshore developers. 
                You're dealing with the person who answers your call, writes your code, and 
                genuinely wants your business to grow — because I know what it's like to build 
                something from scratch in rural NZ with everything on the line.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass-card p-8 rounded-2xl">
              <h4 className="text-lg font-semibold text-foreground mb-6 text-center">A day in my life</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Hexagon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">6am — check the hives</p>
                    <p className="text-xs text-muted-foreground">50 hives. Piopio. Rain or shine.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Code className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">8am — building your site</p>
                    <p className="text-xs text-muted-foreground">React, TypeScript, AI automation. The real stack.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">3pm — school pickup</p>
                    <p className="text-xs text-muted-foreground">Two kids. Because priorities are priorities.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Coffee className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">8pm — client calls & code</p>
                    <p className="text-xs text-muted-foreground">When the kids are in bed. This is the grind.</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-6 italic">
                "If I can build BarterMuse — a full AI trade platform — between hive checks,<br/>
                imagine what I can build for your business."
              </p>
            </div>
          </motion.div>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card-elegant"
          >
            <div className="flex items-center mb-4">
              <Target className="w-8 h-8 text-secondary mr-3" />
              <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To democratise cutting-edge technology for New Zealand businesses. We believe that a 
              family-owned farm in Te Kuiti should have access to the same AI-powered automation as 
              a multinational corporation in Auckland—just with better customer service and a fair price.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="card-elegant"
          >
            <div className="flex items-center mb-4">
              <Award className="w-8 h-8 text-secondary mr-3" />
              <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              A future where geography doesn't limit opportunity. Where a brilliant idea in rural 
              New Zealand can reach global markets with the help of AI, where local businesses 
              can compete on the world stage, and where technology serves humanity, not the other way around.
            </p>
          </motion.div>
        </div>

        {/* What Makes Us Different */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-3xl font-bold text-foreground mb-8">
            Why Local Businesses Choose <span className="text-gradient">Zion Works</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-xl hover:scale-105 transition-all duration-300">
              <h4 className="text-xl font-semibold text-foreground mb-3">No Tech Jargon</h4>
              <p className="text-muted-foreground">
                We speak plain English. No confusing technical terms—just honest conversations 
                about how technology can help your business grow.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl hover:scale-105 transition-all duration-300">
              <h4 className="text-xl font-semibold text-foreground mb-3">Local Understanding</h4>
              <p className="text-muted-foreground">
                We understand the unique challenges of Kiwi businesses—from seasonal cash flow 
                to rural connectivity. Our solutions are built for our reality.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl hover:scale-105 transition-all duration-300">
              <h4 className="text-xl font-semibold text-foreground mb-3">Future-Ready</h4>
              <p className="text-muted-foreground">
                While we're grounded in local values, we're always looking ahead. AI, automation, 
                and emerging tech—we help you stay competitive tomorrow, not just today.
              </p>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              <strong className="text-foreground">From King Country to the Cloud:</strong> We're not just building websites 
              and apps—we're building the digital infrastructure that will help New Zealand businesses 
              thrive for generations to come.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;