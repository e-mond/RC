// src/mocks/axiosMock.js
import apiClient from "@/services/apiClient.js";
import MockAdapter from "axios-mock-adapter";

let mock = null;

export const enableMock = () => {
  if (mock) return;

  mock = new MockAdapter(apiClient, { delayResponse: 400 });

  /** LOGIN */
  mock.onPost("/auth/login").reply((cfg) => {
    const { email } = JSON.parse(cfg.data);

    const roleMap = {
      "tenant@demo.com": "tenant",
      "landlord@demo.com": "landlord",
      "artisan@demo.com": "artisan",
      "admin@demo.com": "admin",
      "super@demo.com": "super-admin",
    };

    const role = roleMap[email] || "tenant";

    // Save role for future mock profile
    localStorage.setItem("userRole", role);

    return [
      200,
      {
        token: `mock-token-${Date.now()}`,
        user: {
          id: `u${Date.now()}`,
          email,
          role,
          name:
            email.split("@")[0].charAt(0).toUpperCase() +
            email.split("@")[0].slice(1),
        },
      },
    ];
  });

  /** PROFILE */
  mock.onGet("/auth/profile").reply(() => {
    const token = localStorage.getItem("token");

    if (!token) return [401, { message: "Unauthorized" }];

    const role = localStorage.getItem("userRole") || "tenant";

    const profiles = {
      tenant: {
        id: "u1",
        name: "Kofi Mensah",
        email: "tenant@demo.com",
        role: "tenant",
        phone: "+233 24 123 4567",
      },
      landlord: {
        id: "u2",
        name: "Ama Owusu",
        email: "landlord@demo.com",
        role: "landlord",
        phone: "+233 20 888 9999",
      },
      artisan: {
        id: "u3",
        name: "Kwame Electrician",
        email: "artisan@demo.com",
        role: "artisan",
        phone: "+233 55 777 8888",
      },
      admin: {
        id: "u4",
        name: "Efua Admin",
        email: "admin@demo.com",
        role: "admin",
      },
      "super-admin": {
        id: "u5",
        name: "Nana Super",
        email: "super@demo.com",
        role: "super-admin",
      },
    };

    return [200, { user: profiles[role] }];
  });

  console.log("MOCK ENABLED — intercepting API calls");
};

export const disableMock = () => {
  if (!mock) return;
  mock.restore();
  mock = null;
  console.log("MOCK DISABLED — using real API");
};

export const isMockEnabled = () => !!mock;
