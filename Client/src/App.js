// import "./App.css";
import React, { useState } from "react";

import LoginForm from "./components/auth/LoginForm";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation
} from "react-router-dom";
import NavBar from "./components/main/Navbar";
import Homepage from "./components/main/Homepage";
import Users from "./components/users/Users";
import {
  loginApi,
  registerApi,
  logoutApi,
  tokenRefresherApi
} from "./api/auth";
function App() {
  let navigate = useNavigate();
  let location = useLocation();
  let from = location.state?.from?.pathname || "/";

  const [user, setUser] = useState();
  const [error, setError] = useState("");
  const ProtectedRoute = ({ children }) => {
    let token = localStorage.getItem("TOKEN");
    if (!token) {
      return <Navigate to="/auth" replace />;
    }
    return children;
  };

  const Login = user => {
    loginApi(user)
      .then(User => {
        if (User.status == 200) {
          localStorage.setItem("TOKEN", User.data.token);
          localStorage.setItem("USER", JSON.stringify(User.data.user));
          setUser(User.data.user);
          setError("");
          navigate(from, { replace: true });
        }
      })
      .catch(error => {
        console.log("error:", error);
        if (error.response) {
          setError(error.response.data.error);
        } else {
          setError(error.message);
        }
      });
  };

  const Logout = async () => {
    try {
      await logoutApi();
      setError("");
    } catch (error) {
      console.log("error:", error);
    }
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("USER");
    setUser(null);
  };
  const Register = async user => {
    try {
      let User = await registerApi(user);
      localStorage.setItem("TOKEN", User.data.token);
      localStorage.setItem("USER", JSON.stringify(User.data.user));
      setUser(User.data.user);
      navigate(from, { replace: true });
    } catch (error) {
      console.log("error:", error);
      if (error.response) {
        setError(error.response.data.error);
      } else {
        setError(error.message);
      }
    }
  };

  // I know it's not working as expected
  React.useEffect(() => {
    tokenRefresherApi()
      .then(res => {
        setUser(res.data.data);
      })
      .catch(e => {
        setUser(null);
        localStorage.removeItem("TOKEN");
        localStorage.removeItem("USER");
      });
  }, []);

  return (
    <div className="App">
      <NavBar user={user} Logout={Logout} />
      <Routes>
        <Route
          exact
          path="/"
          element={
            <ProtectedRoute>
              <Homepage user={user} Logout={Logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <LoginForm
              Login={Login}
              Register={Register}
              error={error}
              setError={setError}
            />
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<p>There's nothing here: 404!</p>} />
      </Routes>
    </div>
  );
}

export default App;
