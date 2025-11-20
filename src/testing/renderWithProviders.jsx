/* eslint-disable react-refresh/only-export-components */
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { FeatureAccessProvider } from "@/context/FeatureAccessContext";

export function TestProviders({ children, route = "/" }) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <FeatureAccessProvider>{children}</FeatureAccessProvider>
    </MemoryRouter>
  );
}

export function renderWithProviders(ui, { route = "/", ...options } = {}) {
  return render(ui, {
    wrapper: (props) => <TestProviders {...props} route={route} />,
    ...options,
  });
}

