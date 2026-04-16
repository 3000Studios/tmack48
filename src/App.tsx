import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import { initAnalytics } from "@/lib/analytics";

const Videos = lazy(() => import("@/pages/Videos"));
const Shorts = lazy(() => import("@/pages/Shorts"));
const About = lazy(() => import("@/pages/About"));
const Support = lazy(() => import("@/pages/Support"));
const Contact = lazy(() => import("@/pages/Contact"));
const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const Press = lazy(() => import("@/pages/Press"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageFallback() {
  return (
    <div className="container-lux py-24 flex items-center justify-center">
      <div className="flex items-center gap-3 text-platinum/60">
        <span className="relative flex h-3 w-3">
          <span className="absolute inset-0 animate-ping rounded-full bg-gold-400 opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-500" />
        </span>
        <span className="text-xs uppercase tracking-[0.3em]">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="videos"
          element={
            <Suspense fallback={<PageFallback />}>
              <Videos />
            </Suspense>
          }
        />
        <Route
          path="shorts"
          element={
            <Suspense fallback={<PageFallback />}>
              <Shorts />
            </Suspense>
          }
        />
        <Route
          path="about"
          element={
            <Suspense fallback={<PageFallback />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="support"
          element={
            <Suspense fallback={<PageFallback />}>
              <Support />
            </Suspense>
          }
        />
        <Route
          path="contact"
          element={
            <Suspense fallback={<PageFallback />}>
              <Contact />
            </Suspense>
          }
        />
        <Route
          path="gallery"
          element={
            <Suspense fallback={<PageFallback />}>
              <GalleryPage />
            </Suspense>
          }
        />
        <Route
          path="press"
          element={
            <Suspense fallback={<PageFallback />}>
              <Press />
            </Suspense>
          }
        />
        <Route
          path="privacy"
          element={
            <Suspense fallback={<PageFallback />}>
              <Privacy />
            </Suspense>
          }
        />
        <Route
          path="terms"
          element={
            <Suspense fallback={<PageFallback />}>
              <Terms />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<PageFallback />}>
              <NotFound />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
