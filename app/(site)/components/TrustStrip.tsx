"use client"

import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const TrustStrip = () => {
  const items = [
    { id: 1, title: 'Island-wide Delivery', icon: <Truck size={18} /> },
    { id: 2, title: 'Cash on Delivery', icon: <ShieldCheck size={18} /> },
    { id: 3, title: 'Easy Returns', icon: <RotateCcw size={18} /> },
    { id: 4, title: 'Premium Support', icon: <Headphones size={18} /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

  return (
    <section 
      className="bg-surface border-t border-glass-border py-6 md:py-8"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 gap-3 md:flex md:flex-row md:items-center md:justify-center md:gap-0"
        >
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <motion.div
                variants={itemVariants}
                className="group flex items-center gap-3 cursor-pointer md:px-8"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-glass border border-glass-border text-accent transition-colors duration-300 group-hover:border-accent">
                  {item.icon}
                </div>
                <span className="text-[12px] font-bold uppercase tracking-wide text-secondary transition-colors duration-300 group-hover:text-primary">
                  {item.title}
                </span>
              </motion.div>
              {index < items.length - 1 && (
                <div className="hidden md:block w-px h-6 bg-glass-border" />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustStrip;
