import { useState } from "react";
  import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
  } from "react-router-dom";

  // Layouts
  import AdminLayout from "./layout/AdminLayout";

  // Components
  import Navbar from "./components/Navbar";
  import Footer from "./components/Footer";
  import {HtmlIde} from "./components/HtmlIde.jsx";
  import { Ide } from "./components/Ide.jsx";
  import { CodePen } from "./components/CodePen.jsx";
  import ScrollToTop from './components/ScrollToTop';

  // Pages
  import LandingPage from "./pages/LandingPage";
  import About from "./pages/About";
  import Dashboard from "./pages/Admin/Dashboard";
  import ManageCourse from "./pages/Admin/ManageCourse";
  import ManageCategory from "./pages/Admin/ManageCategory";
  import Users from "./pages/Admin/Users";
  import UserReport from "./pages/Admin/UserReport";
  import CourseDetail from "./pages/CourseDetail";
  import QuizPage from "./pages/QuizPage";
  import Register from "./pages/Register";
  import Login from "./pages/Login";
  import ForgotPass from "./pages/ForgotPass";
  import PassCode from "./pages/PassCode";
  import ResetPass from "./pages/ResetPass";
  import CodeTest from "./pages/CodeTest";
  import VerifyCode from "./pages/Verification";
  import ProtectedRoute from "./components/ProtectedRoutes";
  import ModalLayout from "./pages/Layout.jsx";
  import ListAllCourse from "./pages/ListAllCourse";
  import { PaymentPage } from "./pages/PaymentPage.jsx";


  function AppContent() {
    const location = useLocation();

    // Routes where footer should be hidden
    const hideFooterRoutes = [
      "/admin",
      "/admin/manage-course",
      "/admin/manage-category",
      "/admin/user",
      "/admin/user-report",
      "/payment",
    ];

    // Routes where navbar should be hidden
    const hideNavbarRoutes = [
      "/login",
      "/register",
      "/forgot-password",
      "/pass-code",
      "/reset-password",
      "/admin",
      "/admin/manage-course",
      "/admin/manage-category",
      "/admin/user",
      "/payment",
    ];

    const shouldHideFooter = hideFooterRoutes.some(route =>
    location.pathname.startsWith(route)
    );

    const shouldHideNavbar = hideNavbarRoutes.some(route =>
      location.pathname.startsWith(route)
    );

    const [activeModal, setActiveModal] = useState(null);

    return (
      <div
        className={`relative min-h-screen ${
          activeModal ? "overflow-hidden" : ""
        }`}
      >
        {/* Navbar */}
        {!shouldHideNavbar && (
          <Navbar 
            onRegisterClick={() => setActiveModal("register")}
            onLoginClick={() => setActiveModal("login")}
          />
        )}

        {/* Page routes */}
        <div className={activeModal ? "filter blur-sm" : ""}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage onSwitchToRegister={() => setActiveModal("register")} onSwitchToLogin={() => setActiveModal("login")} />} />
            <Route path="/about" element={<About />} />
            <Route path="/codetest" element={<CodeTest />} />
            <Route path="/htmlTest" element={<HtmlIde />} />
            <Route path="/ide" element={<Ide />} />
            <Route path="/codepen" element={<CodePen />} />

            <Route path="/course/:id" element={
              <ProtectedRoute
                  onRegisterClick={() => setActiveModal("register")}
                  onLoginClick={() => setActiveModal("login")}>
                <CourseDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/quiz/:courseId" element={
              <ProtectedRoute
                  onRegisterClick={() => setActiveModal("register")}
                  onLoginClick={() => setActiveModal("login")}>
                <QuizPage />
              </ProtectedRoute>
            } />
            {/* <Route path="/payment" element={<PaymentPage />} /> */}
            <Route path="/payment/:course_id" element={<PaymentPage />} />

            {/* Auth routes (pages) */}
            <Route path="/login" element={
              <ModalLayout>
                <Login onClose={() => setActiveModal(null)} />
              </ModalLayout>
            } />
            <Route path="/register" element={
              <ModalLayout>
                <Register onClose={() => setActiveModal(null)} />
              </ModalLayout>
            } />
            <Route path="/forgot-password" element={<ForgotPass onClose={() => setActiveModal("login")} />} />
            <Route path="/pass-code" element={<PassCode onClose={() => setActiveModal("forgot-password")} />} />
            <Route path="/reset-password" element={<ResetPass onClose={() => setActiveModal("pass-code")} />} />
            <Route path="/verify" element={
              <ModalLayout>
                <VerifyCode onClose={() => setActiveModal(null)} />
              </ModalLayout>
            } />
            <Route path="/all-courses" element={<ListAllCourse onSwitchToLogin={() => setActiveModal("login")} />} />

            {/* Admin routes with layout */}
            <Route path="/admin" element={
              <ProtectedRoute role="ROLE_ADMIN">
                <AdminLayout />
              </ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="manage-course" element={<ManageCourse />} />
              <Route path="manage-category" element={<ManageCategory />} />
              <Route path="user" element={<Users />} />
              <Route path="user-report" element={<UserReport />} />
            </Route>
          </Routes>

          {/* Footer */}
          {!shouldHideFooter && <Footer />}
        </div>

        {/* Auth modals (optional) */}
        {activeModal === "login" && (
          <Login
            onClose={() => setActiveModal(null)}
            onSwitchToRegister={() => setActiveModal("register")}
            onForgotPasswordClick={() => setActiveModal("forgot-password")}
            onSwitchToVerify={() => setActiveModal("verify")}
          />
        )}
        {activeModal === "register" && (
          <Register
            onClose={() => setActiveModal(null)}
            onSwitchToLogin={() => setActiveModal("login")}
            onSwitchToVerify={() => setActiveModal("verify")}
          />
        )}
        {activeModal === "forgot-password" && (
          <ForgotPass
            onClose={() => setActiveModal("login")}
            onSwitchToLogin={() => setActiveModal("login")}
            onSwitchToRegister={() => setActiveModal("register")}
            onSwitchToPassCode={() => setActiveModal("pass-code")}
          />
        )}
        {activeModal === "pass-code" && (
          <PassCode
            onClose={() => setActiveModal("forgot-password")}
            onSwitchToResetPass={() => setActiveModal("reset-password")}
            onSwitchToForgotPass={() => setActiveModal("forgot-password")}
          />
        )}
        {activeModal === "reset-password" && (
          <ResetPass
            onClose={() => setActiveModal("pass-code")}
            onSwitchToLogin={() => setActiveModal("login")}
            onSwitchToFotgotPass={() => setActiveModal("forgot-password")}
          />
        )}
        {activeModal === "verify" && (
          <VerifyCode
            onClose={() => setActiveModal(null)}
            onSwitchToRegister={() => setActiveModal("register")}
          />
        )}
      </div>
    );
  }

  export default function App() {
    return (
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    );
  }
