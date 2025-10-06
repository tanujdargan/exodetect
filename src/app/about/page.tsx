"use client"

import { motion } from "motion/react"
import { MorphingText } from "@/components/ui/morphing-text"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Linkedin } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-background to-blue-600/10 animate-gradient-xy pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-background to-background pointer-events-none" />

      {/* Navigation Bar */}
      <div className="relative z-10 border-b border-border/40 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                Landing Page
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="relative container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl font-bold tracking-tight">About ExoDetect and Its Creators</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering astronomers, researchers, and citizen scientists to discover new worlds beyond our solar system.
            </p>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Our Mission</h2>
              <p className="text-muted-foreground">
                ExoDetect leverages cutting-edge machine learning algorithms to analyze astronomical light curves
                and identify potential exoplanet candidates. Our platform makes advanced exoplanet detection
                accessible to everyone, from professional astronomers to curious enthusiasts.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">What We Do</h2>
              <ul className="text-muted-foreground space-y-2">
                <li>• Analyze Kepler, K2, and TESS mission data</li>
                <li>• Provide explainable AI predictions</li>
                <li>• Support custom data uploads for research</li>
                <li>• Enable collaborative exploration</li>
              </ul>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-semibold text-center">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3 p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20" />
                </div>
                <h3 className="font-semibold">Explorer Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Browse and analyze pre-selected targets from space mission archives.
                </p>
              </div>
              <div className="text-center space-y-3 p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20" />
                </div>
                <h3 className="font-semibold">Researcher Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced tools for professional astronomers with customizable parameters.
                </p>
              </div>
              <div className="text-center space-y-3 p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20" />
                </div>
                <h3 className="font-semibold">Upload Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze your own light curve data with our powerful detection algorithms.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center space-y-6"
          >
            <h2 className="text-3xl font-semibold">Built by Researchers, For Researchers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Developed at the University of Victoria, ExoDetect combines academic rigor with
              user-friendly design to accelerate exoplanet discovery and research.
            </p>
          </motion.div>

          {/* Meet the Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-semibold text-center">Meet the Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm text-center">
                <h3 className="font-bold text-lg">Tanuj Dargan</h3>
                <p className="text-sm text-muted-foreground italic">Team Lead</p>
                <a href="https://linkedin.com/in/tanujdargan" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 hover:opacity-75">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm text-center">
                <h3 className="font-semibold">Sahil Sanghvi</h3>
                <a href="https://www.linkedin.com/in/sahil-mit-sanghvi/" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 hover:opacity-75">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm text-center">
                <h3 className="font-semibold">Aaron Sharma</h3>
                <a href="https://www.linkedin.com/in/aaron-sharma-cv/" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 hover:opacity-75">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm text-center">
                <h3 className="font-semibold">Sam Sanjay Satish</h3>
                <a href="https://www.linkedin.com/in/sam-sanjay-satish-0a0595216/" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 hover:opacity-75">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm text-center">
                <h3 className="font-semibold">Aman Paloda</h3>
                <a href="https://www.linkedin.com/in/aman-palod-3a09911b4/" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 hover:opacity-75">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm text-center">
                <h3 className="font-semibold">Agam Kamran</h3>
                <a href="https://www.linkedin.com/in/agam-kamran/" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 hover:opacity-75">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
