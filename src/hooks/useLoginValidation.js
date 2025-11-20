// src/hooks/useLoginValidation.js
export default function useLoginValidation() {
  const validate = (form) => {
    const errors = {};

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = "Enter a valid email.";
    }

    if (!form.password.trim()) {
      errors.password = "Password is required.";
    }

    return errors;
  };

  return { validate };
}
