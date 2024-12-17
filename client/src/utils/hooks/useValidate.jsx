import { useCallback } from "react";
import validator from "validator";

const useValidate = () => {
  const validate = useCallback((data, options) => {
    // Validate name
    if (options.type === "register") {
      if (data.name.length < 3)
        return "Name must be at least 3 characters long.";
    }

    // Validate email
    if (!data.email) return "Email is required.";
    if (!validator.isEmail(data.email)) return "Invalid email format.";

    

    // Validate password for strength
    if (!data.password) return "Password is required.";
    if (options.type === "register") {
      if (data.password.length < 6)
        return "Password must be at least 6 characters long.";
      if (
        !validator.isStrongPassword(data.password, {
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
      )
        return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.";
    }

    return null;
  }, []);

  return validate;
};

export default useValidate;
