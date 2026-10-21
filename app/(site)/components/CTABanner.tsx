"use client"

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const CTABanner = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  };

  return (
    <section className="relative overflow-hidden py-24 md:py-32 bg-void v2-grain">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--color-accent) 8.0%, transparent), transparent 70%)'
        }}
      />
      
      <div className="relative z-10 max-w-[900px] mx-auto px-4 md:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 
            variants={itemVariants}
            className="font-display font-[900] uppercase tracking-[-0.04em] text-[clamp(3rem,10vw,7rem)] leading-none flex flex-col items-center justify-center"
          >
            <span className="text-primary">NEVER BE</span>
            <span className="v2-shimmer-text">THE SAME</span>
          </motion.h2>

          <motion.p 
            variants={itemVariants}
            className="text-[16px] text-secondary max-w-lg mx-auto mt-6"
          >
            Join 10,000+ customers who trust Neverbe for premium style.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-row items-center justify-center gap-4 mt-10"
          >
            <Link href="/collections/products" className="v2-btn-accent">
              Shop All Products
            </Link>
            <Link href="/contact" className="v2-btn-ghost">
              Get in Touch
            </Link>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-row flex-wrap items-center justify-center gap-4 mt-12"
          >
            <div className="v2-pill">10,000+ Customers</div>
            <div className="v2-pill">Island-wide Delivery</div>
            <div className="v2-pill">4.8★ Average Rating</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
