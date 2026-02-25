// ==========================================
// src/utils/validators.js
import { VALIDATION_RULES } from './constants';

export const validateUser = (userData, isEdit = false) => {
  const errors = {};

  // Username validation
  if (!userData.username?.trim()) {
    errors.username = 'El usuario es requerido';
  } else if (userData.username.length < VALIDATION_RULES.username.minLength) {
    errors.username = `Mínimo ${VALIDATION_RULES.username.minLength} caracteres`;
  }

  // Email validation
  if (!userData.correo_electronico?.trim()) {
    errors.correo_electronico = 'El correo es requerido';
  } else if (!VALIDATION_RULES.email.pattern.test(userData.correo_electronico)) {
    errors.correo_electronico = 'Formato de correo inválido';
  }

  // Password validation (only for new users or when changing password)
  if (!isEdit && !userData.password?.trim()) {
    errors.password = 'La contraseña es requerida';
  } else if (userData.password && userData.password.length < VALIDATION_RULES.password.minLength) {
    errors.password = `Mínimo ${VALIDATION_RULES.password.minLength} caracteres`;
  }

  // Roles validation
  if (!userData.roles?.length) {
    errors.roles = 'Debe seleccionar al menos un rol';
  }

  return errors;
};

export const validationHelpers = {
  // Validar email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar contraseña
  isValidPassword: (password) => {
    return {
      isValid: password.length >= 8,
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  },

  // Validar username
  isValidUsername: (username) => {
    const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;
    return usernameRegex.test(username);
  },

  // Validar cédula (Bolivia)
  isValidCedula: (cedula) => {
    const cedulaRegex = /^\d{7,8}$/;
    return cedulaRegex.test(cedula);
  },

  // Validar teléfono (Bolivia)
  isValidPhone: (phone) => {
    const phoneRegex = /^[67]\d{7}$/; // Formato boliviano
    return phoneRegex.test(phone);
  }
};

// Función para validar formulario de usuario
export const validateUserForm = (formData, isCreating = false) => {
  const errors = {};

  // Username
  if (!formData.username || !formData.username.trim()) {
    errors.username = 'El nombre de usuario es requerido';
  } else if (!validationHelpers.isValidUsername(formData.username)) {
    errors.username = 'El nombre de usuario debe tener entre 3-20 caracteres (letras, números, . _ -)';
  }

  // Email
  if (!formData.correo_electronico || !formData.correo_electronico.trim()) {
    errors.correo_electronico = 'El correo electrónico es requerido';
  } else if (!validationHelpers.isValidEmail(formData.correo_electronico)) {
    errors.correo_electronico = 'El formato del correo electrónico es inválido';
  }

  // Password (solo al crear)
  if (isCreating) {
    if (!formData.password || !formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else {
      const passwordValidation = validationHelpers.isValidPassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
      }
    }
  }

  // Roles
  if (!formData.roles || formData.roles.length === 0) {
    errors.roles = 'Debe seleccionar al menos un rol';
  }

  // Validaciones de persona (opcionales)
  if (formData.persona) {
    if (formData.persona.cedula && !validationHelpers.isValidCedula(formData.persona.cedula)) {
      errors['persona.cedula'] = 'La cédula debe tener 7-8 dígitos';
    }
    
    if (formData.persona.telefono && !validationHelpers.isValidPhone(formData.persona.telefono)) {
      errors['persona.telefono'] = 'El teléfono debe tener 8 dígitos y comenzar con 6 o 7';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};