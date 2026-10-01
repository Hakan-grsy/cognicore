import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';

// Sayfalar
const Landing = React.lazy(() => import('./pages/Landing'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Oyunlar
const MemoryMatrix = React.lazy(() => import('./games/MemoryMatrix/MemoryMatrix'));
const SpeedMatch = React.lazy(() => import('./games/SpeedMatch/SpeedMatch'));
const ColorMatch = React.lazy(() => import('./games/ColorMatch/ColorMatch'));
const MathClash = React.lazy(() => import('./games/MathClash/MathClash'));
const DirectionFinder = React.lazy(() => import('./games/DirectionFinder/DirectionFinder'));
const DigitSpan = React.lazy(() => import('./games/DigitSpan/DigitSpan'));
const NBack = React.lazy(() => import('./games/NBack/NBack'));
const ColorSort = React.lazy(() => import('./games/ColorSort/ColorSort'));
const WordValidator = React.lazy(() => import('./games/WordValidator/WordValidator'));
const MotionDirection = React.lazy(() => import('./games/MotionDirection/MotionDirection'));
const FallingMath = React.lazy(() => import('./games/FallingMath/FallingMath'));
const ShapeRotation = React.lazy(() => import('./games/ShapeRotation/ShapeRotation'));
const OddOneOut = React.lazy(() => import('./games/OddOneOut/OddOneOut'));
const RuleSwitcher = React.lazy(() => import('./games/RuleSwitcher/RuleSwitcher'));
const SequenceRecall = React.lazy(() => import('./games/SequenceRecall/SequenceRecall'));

// Yükleme ekranı
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
  </div>
);

// Page transition component
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="w-full min-h-screen"
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/games" element={<PageTransition><Dashboard /></PageTransition>} />
        
        {/* Oyunlar */}
        <Route path="/games/memory-matrix" element={<PageTransition><MemoryMatrix /></PageTransition>} />
        <Route path="/games/speed-match" element={<PageTransition><SpeedMatch /></PageTransition>} />
        <Route path="/games/color-match" element={<PageTransition><ColorMatch /></PageTransition>} />
        <Route path="/games/math-clash" element={<PageTransition><MathClash /></PageTransition>} />
        <Route path="/games/direction-finder" element={<PageTransition><DirectionFinder /></PageTransition>} />
        <Route path="/games/digit-span" element={<PageTransition><DigitSpan /></PageTransition>} />
        <Route path="/games/n-back" element={<PageTransition><NBack /></PageTransition>} />
        <Route path="/games/color-sort" element={<PageTransition><ColorSort /></PageTransition>} />
        <Route path="/games/word-validator" element={<PageTransition><WordValidator /></PageTransition>} />
        <Route path="/games/motion-direction" element={<PageTransition><MotionDirection /></PageTransition>} />
        <Route path="/games/falling-math" element={<PageTransition><FallingMath /></PageTransition>} />
        <Route path="/games/shape-rotation" element={<PageTransition><ShapeRotation /></PageTransition>} />
        <Route path="/games/odd-one-out" element={<PageTransition><OddOneOut /></PageTransition>} />
        <Route path="/games/rule-switcher" element={<PageTransition><RuleSwitcher /></PageTransition>} />
        <Route path="/games/sequence-recall" element={<PageTransition><SequenceRecall /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { isDarkMode } = useStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <AnimatedRoutes />
      </Suspense>
    </Router>
  );
}

export default App;
