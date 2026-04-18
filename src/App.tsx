import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import { initAnalytics } from "@/lib/analytics";
import GoldenAcornLoader from "@/components/ui/GoldenAcornLoader";
import CurtainsIntro from "@/components/ui/CurtainsIntro";

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
const Links = lazy(() => import("@/pages/Links"));
const Merch = lazy(() => import("@/pages/Merch"));
const Admin = lazy(() => import("@/pages/Admin"));
const Stories = lazy(() => import("@/pages/Stories"));
const StoryEdition = lazy(() => import("@/pages/StoryEdition"));

function PageFallback() {
  return (
    <div className="container-lux py-24 flex items-center justify-center">
      <GoldenAcornLoader label="Loading the next drop" />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <>
      <CurtainsIntro enabled={location.pathname === "/"} />
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
            path="stories/:edition"
            element={
              <Suspense fallback={<PageFallback />}>
                <StoryEdition />
              </Suspense>
            }
          />
          <Route
            path="stories"
            element={
              <Suspense fallback={<PageFallback />}>
                <Stories />
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
            path="links"
            element={
              <Suspense fallback={<PageFallback />}>
                <Links />
              </Suspense>
            }
          />
          <Route
            path="merch"
            element={
              <Suspense fallback={<PageFallback />}>
                <Merch />
              </Suspense>
            }
          />
          <Route
            path="admin"
            element={
              <Suspense fallback={<PageFallback />}>
                <Admin />
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
    </>
  );
}
