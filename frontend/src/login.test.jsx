import { test, expect, mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./login";
import React from "react";

// Mock react-router-dom
const mockNavigate = mock(() => {});
mock.module("react-router-dom", () => {
  return {
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

// Mock contexts
const mockLogin = mock(() => Promise.resolve());
mock.module("./authContext", () => {
  return {
    useAuth: () => ({
      login: mockLogin,
    }),
  };
});

const mockToastSuccess = mock(() => {});
const mockToastError = mock(() => {});
mock.module("./toastContext", () => {
  return {
    useToast: () => ({
      success: mockToastSuccess,
      error: mockToastError,
    }),
  };
});

test("renders login form and handles submission", async () => {
  render(<Login />);

  // Check that the form elements render
  const emailInput = screen.getByLabelText(/email address/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole("button", { name: /log in/i });

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();

  // Fill out and submit the form
  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.change(passwordInput, { target: { value: "password123" } });
  fireEvent.click(submitButton);

  // Assertions
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    expect(mockToastSuccess).toHaveBeenCalledWith("Welcome back! Logged in successfully.");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});

