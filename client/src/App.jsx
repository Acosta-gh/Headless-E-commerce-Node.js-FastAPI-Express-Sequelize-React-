import { lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";

import {
  createHashRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";


import MainLayout from "@/layout/MainLayout";

// 💤 Lazy imports
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/AdminPanel")); // Even though it's called AdminPanel it only handles articles.
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const Profile = lazy(() => import("./pages/Profile"));
const Loading = lazy(() => import("./components/Loading.jsx"));
const Verify = lazy(() => import("./pages/Verify"));
const ArticlePage = lazy(() => import("./pages/Article.jsx"));
const Services = lazy(() => import("./pages/Services.jsx"));
const AllArticles = lazy(() => import("./pages/AllArticles.jsx"));
const ForgotPage = lazy(() => import("./pages/ForgotPage.jsx"));
const ResetPage = lazy(() => import("./pages/ResetPage.jsx"));
const VerifySubscriber = lazy(() => import("./pages/VerifySubscriber.jsx"));

// 🔐 Protected Routes
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ⚙️ Setup Router
const router = createHashRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "about",
        element: (
          <Suspense fallback={<Loading />}>
            <About />
          </Suspense>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/article/:articleId",
        element: (
          <Suspense fallback={<Loading />}>
            <ArticlePage />
          </Suspense>
        ),
      },
      {
        path: "/manageArticles",
        element: (
          <ProtectedRoute requireAdmin={true}>
            <Suspense fallback={<Loading />}>
              <Admin />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/adminUsers",
        element: (
          <ProtectedRoute requireAdmin={true}>
            <Suspense fallback={<Loading />}>
              <AdminUsers />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/services",
        element: (
          <Suspense fallback={<Loading />}>
            <Services />
          </Suspense>
        ),
      },
      {
        path: "/articles",
        element: (
          <Suspense fallback={<Loading />}>
            <AllArticles />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loading />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/forgot",
    element: (
      <Suspense fallback={<Loading />}>
        <ForgotPage />
      </Suspense>
    ),
  },
    {
    path: "/reset",
    element: (
      <Suspense fallback={<Loading />}>
        <ResetPage />
      </Suspense>
    ),
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<Loading />}>
        <SignUpPage />
      </Suspense>
    ),
  },
  {
    path: "/verify",
    element: (
      <Suspense fallback={<Loading />}>
        <Verify />
      </Suspense>
    ),
  },
    {
    path: "/subscriber",
    element: (
      <Suspense fallback={<Loading />}>
        <VerifySubscriber />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<Loading />}>
        <NotFound />
      </Suspense>
    ),
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
