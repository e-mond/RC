import { describe, expect, test, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route, MemoryRouter } from "react-router-dom";
import RoleProtectedRoute from "../RoleProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { render } from "@testing-library/react";

const renderRoute = () =>
  render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <RoleProtectedRoute allowedRoles="tenant">
              <div>Allowed Content</div>
            </RoleProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/fallback" element={<div>Fallback</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("RoleProtectedRoute", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, loading: false }, true);
  });

  test("redirects unauthenticated users to login", () => {
    renderRoute();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("redirects when role is not allowed", () => {
    useAuthStore.setState({ user: { role: "landlord" }, loading: false });
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RoleProtectedRoute allowedRoles="tenant" fallback="/fallback">
                <div>Allowed Content</div>
              </RoleProtectedRoute>
            }
          />
          <Route path="/fallback" element={<div>Fallback</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Fallback")).toBeInTheDocument();
  });

  test("renders children when role matches", () => {
    useAuthStore.setState({ user: { role: "tenant" }, loading: false });
    renderRoute();
    expect(screen.getByText("Allowed Content")).toBeInTheDocument();
  });
});

