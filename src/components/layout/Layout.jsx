import { useState, useRef } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Home, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import FilmSearch from "../features/movies/FilmSearch";

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [headerClickCount, setHeaderClickCount] = useState(0);
  const clickTimeoutRef = useRef(null);

  const isHomePage = location.pathname === "/";

  const handleHeaderClick = () => {
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    const next = headerClickCount + 1;
    setHeaderClickCount(next);
    if (next >= 5) {
      setHeaderClickCount(0);
      const showRussian = searchParams.get("showRussian") === "1";
      const params = new URLSearchParams(searchParams);
      if (showRussian) {
        params.delete("showRussian");
      } else {
        params.set("showRussian", "1");
      }
      if (location.pathname !== "/") {
        navigate(params.toString() ? `/?${params}` : "/");
      } else {
        setSearchParams(params, { replace: true });
      }
    } else {
      clickTimeoutRef.current = setTimeout(() => setHeaderClickCount(0), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <nav
        onClick={handleHeaderClick}
        className="sticky top-0 z-50 bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-700/50 cursor-pointer"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex">
              <button
                onClick={() => navigate("/")}
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-all ${
                  location.pathname === "/"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Главная
              </button>
            </div>
            <div className="flex items-center gap-4 justify-end flex-1">
              {!isHomePage && (
                <div className="hidden md:block max-w-md w-full">
                  <FilmSearch />
                </div>
              )}
              {user ? (
                <Link
                  to="/profile"
                  className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-all ${
                    location.pathname === "/profile"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Профиль</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  Войти
                </Link>
              )}
            </div>
          </div>
          {!isHomePage && (
            <div className="md:hidden w-full pb-4">
              <FilmSearch />
            </div>
          )}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;
