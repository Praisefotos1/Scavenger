import { describe, it, expect } from "vitest";
import {
  formatErrorMessage,
  validateErrorMessage,
  createValidationError,
  createNotFoundError,
  createAuthError,
  createPermissionError,
  createDatabaseError,
  createRateLimitError,
  AppError,
} from "../../packages/shared/src/errors";

describe("Error Message Utilities", () => {
  describe("formatErrorMessage", () => {
    it("should format message with capital letter and period", () => {
      const result = formatErrorMessage("invalid input");
      expect(result).toBe("Invalid input.");
    });

    it("should not duplicate a trailing period", () => {
      const result = formatErrorMessage("Invalid input.");
      expect(result).toBe("Invalid input.");
    });

    it("should capitalize an already capitalized message without altering it", () => {
      const result = formatErrorMessage("Already fine");
      expect(result).toBe("Already fine.");
    });
  });

  describe("validateErrorMessage", () => {
    it("should validate correctly formatted message", () => {
      const result = validateErrorMessage("Invalid input.");
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should flag a message missing a trailing period", () => {
      const result = validateErrorMessage("Invalid input");
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should flag a message missing a leading capital letter", () => {
      const result = validateErrorMessage("invalid input.");
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe("createValidationError", () => {
    it("should create formatted validation error", () => {
      const error = createValidationError("email", "Email is required.");
      expect(error.message).toBe("Failed to validate email. Email is required.");
      expect(error.code).toBe("VAL-001");
    });
  });

  describe("createNotFoundError", () => {
    it("should create formatted not found error", () => {
      const error = createNotFoundError("User", "123");
      expect(error.message).toBe("User not found: 123.");
    });
  });

  describe("createAuthError", () => {
    it("should create formatted auth error", () => {
      const error = createAuthError("Access dashboard");
      expect(error.message).toBe("Unauthorized: Access dashboard requires authentication.");
    });
  });

  describe("createPermissionError", () => {
    it("should create formatted permission error", () => {
      const error = createPermissionError("Delete user", "admin");
      expect(error.message).toBe("Permission denied. Delete user requires admin role.");
    });
  });

  describe("createDatabaseError", () => {
    it("should create formatted database error", () => {
      const error = createDatabaseError("Query execution");
      expect(error.message).toBe("Database operation failed: Query execution. Please try again later.");
    });
  });

  describe("createRateLimitError", () => {
    it("should create formatted rate limit error", () => {
      const error = createRateLimitError(100, 60);
      expect(error.message).toBe("Rate limit exceeded. Maximum 100 requests allowed. Try again in 60 seconds.");
    });
  });
});

describe("error factory messages", () => {
  const errorFactories = [
    { name: "createValidationError", factory: () => createValidationError("email", "Email is required.") },
    { name: "createNotFoundError", factory: () => createNotFoundError("User", "123") },
    { name: "createAuthError", factory: () => createAuthError("Access dashboard") },
    { name: "createPermissionError", factory: () => createPermissionError("Delete user", "admin") },
    { name: "createDatabaseError", factory: () => createDatabaseError("Query execution") },
    { name: "createRateLimitError", factory: () => createRateLimitError(100, 60) },
  ];

  it.each(errorFactories)("$name should produce a message that passes validateErrorMessage", ({ factory }) => {
    expect(validateErrorMessage(factory().message).valid).toBe(true);
  });
});
