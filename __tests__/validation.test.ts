import { validateEmail, validatePassword, validateRequired } from '../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return valid for strong passwords', () => {
      const result = validatePassword('StrongPass123');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for weak passwords', () => {
      expect(validatePassword('weak').isValid).toBe(false);
      expect(validatePassword('nouppercase123').isValid).toBe(false);
      expect(validatePassword('NOLOWERCASE123').isValid).toBe(false);
      expect(validatePassword('NoNumbers').isValid).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should return true for non-empty strings', () => {
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired('  test  ')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
    });
  });
});