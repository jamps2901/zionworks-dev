import { motion } from 'framer-motion';
import { Zap, Award, Users } from 'lucide-react';

// The three hero trust stats (Piopio / ~14 days / Direct), relocated out of
// the hero itself so the first screen is just headline + AI prompt -- one
// focal point, not six competing elements. Still visible almost immediately,
// just below the fold rather than crowding it.
const stats = [
  {
    icon: Zap,
    value: 'Piopio',
    lines: ['Based in King Country', 'serving all of NZ remotely'],
  },
  {
    icon: Award,
    value: '~14 days',
    lines: ['Typical turnaround', 'from brief to live site'],
  },
  {
    icon: Users,
    value: 'Direct',
    lines: ['You deal with the founder', 'not an account manager'],
  },
];

const TrustStrip = () => {
  return (
    <section className="bg-primary py-10 border-t border-primary-foreground/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.value}
              className="flex items-center gap-3 justify-center sm:justify-start"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center w-10 h-10 glass-card rounded-full flex-shrink-0">
                <stat.icon className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-left">
                <div className="text-base font-bold text-primary-foreground leading-none mb-1">
                  {stat.value}
                </div>
                <div className="text-primary-foreground/60 text-xs leading-snug">
                  {stat.lines[0]} · <span className="text-secondary">{stat.lines[1]}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
