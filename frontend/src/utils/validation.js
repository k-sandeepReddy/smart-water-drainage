/**
 * Form validation utilities for civic complaint reporting and user authentication
 */

export function validateLogin(username_or_email, password) {
  const errors = {};
  if (!username_or_email || !username_or_email.trim()) {
    errors.username_or_email = 'Username or Email is required.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 4) {
    errors.password = 'Password must be at least 4 characters long.';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateComplaint(complaint) {
  const errors = {};
  if (!complaint.category || !complaint.category.trim()) {
    errors.category = 'Please select an issue category.';
  }
  if (!complaint.problem_type || !complaint.problem_type.trim()) {
    errors.problem_type = 'Please specify the problem type.';
  }
  if (!complaint.location || !complaint.location.trim()) {
    errors.location = 'Please provide the street, landmark, or house address in Ramaswami Peta.';
  } else if (complaint.location.trim().length < 5) {
    errors.location = 'Please provide a more descriptive location (at least 5 characters).';
  }
  if (!complaint.description || !complaint.description.trim()) {
    errors.description = 'Please enter a description of the problem.';
  } else if (complaint.description.trim().length < 10) {
    errors.description = 'Description should be at least 10 characters long to aid municipal triage.';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateProfile(profile) {
  const errors = {};
  if (!profile.full_name || !profile.full_name.trim()) {
    errors.full_name = 'Full name is required.';
  }
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (profile.phone && !/^\d{10}$/.test(profile.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Phone number should contain 10 digits.';
  }
  if (profile.new_password) {
    if (!profile.current_password) {
      errors.current_password = 'Current password is required to set a new password.';
    }
    if (profile.new_password.length < 6) {
      errors.new_password = 'New password must be at least 6 characters.';
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
