import { motion } from 'framer-motion';
import { Heart, Users, Zap, Target, Globe, Award } from 'lucide-react';

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

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Our Humble <span className="text-gradient">Beginning</span>
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                It started with a laptop, a kitchen table, and a simple belief: every New Zealand business, 
                no matter how small or where they're located, deserves access to world-class technology.
              </p>
              <p>
                Growing up in King Country, we saw firsthand how local businesses—the farm supply store, 
                the family electrician, the corner café—struggled to compete in an increasingly digital world. 
                Not because they lacked heart or skill, but because they lacked the right tools.
              </p>
              <p>
                So we made it our mission to bridge that gap. From our base in the Waikato, we've grown 
                from building simple websites to creating AI-powered automation systems that help local 
                businesses thrive in the digital age.
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
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Local Focus</h4>
                  <p className="text-sm text-muted-foreground">King Country roots</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Global Tech</h4>
                  <p className="text-sm text-muted-foreground">World-class solutions</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Community</h4>
                  <p className="text-sm text-muted-foreground">Local businesses first</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Innovation</h4>
                  <p className="text-sm text-muted-foreground">AI & automation</p>
                </div>
              </div>
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