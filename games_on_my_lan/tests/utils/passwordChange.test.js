import { describe, it, expect } from 'vitest';
import { validatePasswordChange } from '../../src/utils/validators.js';

const ok = {
  currentPassword: 'vieja-clave',
  newPassword: 'nueva-clave-123',
  confirmPassword: 'nueva-clave-123',
};

describe('validatePasswordChange', () => {
  it('acepta datos válidos', () => {
    expect(validatePasswordChange(ok)).toBeNull();
  });

  it('rechaza campos vacíos o ausentes', () => {
    expect(validatePasswordChange({ ...ok, currentPassword: '' })).toMatch(/tres campos/);
    expect(validatePasswordChange({ ...ok, newPassword: '' })).toMatch(/tres campos/);
    expect(validatePasswordChange({ ...ok, confirmPassword: undefined })).toMatch(/tres campos/);
    expect(validatePasswordChange({})).toMatch(/tres campos/);
  });

  it('rechaza valores que no son texto (objetos o arreglos del body)', () => {
    expect(validatePasswordChange({ ...ok, currentPassword: { a: 'x' } })).toMatch(/tres campos/);
    expect(validatePasswordChange({ ...ok, newPassword: ['a', 'b'] })).toMatch(/tres campos/);
  });

  it('rechaza si la confirmación no coincide', () => {
    expect(validatePasswordChange({ ...ok, confirmPassword: 'otra-cosa-123' })).toMatch(
      /no coinciden/,
    );
  });

  it('exige al menos 1 carácter', () => {
    // Una contraseña vacía debe rechazarse.
    const empty = {
      ...ok,
      newPassword: '',
      confirmPassword: '',
    };
    expect(validatePasswordChange(empty)).toMatch(/Completa los tres campos/);

    // Una contraseña de 1 carácter debe aceptarse.
    const exact = {
      ...ok,
      newPassword: '1',
      confirmPassword: '1',
    };
    expect(validatePasswordChange(exact)).toBeNull();
  });

  it('limita a 72 bytes (límite de bcrypt), no a 72 caracteres', () => {
    const at72 = 'a'.repeat(72);
    expect(validatePasswordChange({ ...ok, newPassword: at72, confirmPassword: at72 })).toBeNull();

    const at73 = 'a'.repeat(73);
    expect(validatePasswordChange({ ...ok, newPassword: at73, confirmPassword: at73 })).toMatch(
      /demasiado larga/,
    );

    // 40 "ñ" = 40 caracteres pero 80 bytes
    const multibyte = 'ñ'.repeat(40);
    expect(
      validatePasswordChange({ ...ok, newPassword: multibyte, confirmPassword: multibyte }),
    ).toMatch(/demasiado larga/);
  });

  it('rechaza una nueva contraseña igual a la actual', () => {
    const same = {
      currentPassword: 'misma-clave-1',
      newPassword: 'misma-clave-1',
      confirmPassword: 'misma-clave-1',
    };
    expect(validatePasswordChange(same)).toMatch(/distinta de la actual/);
  });
});
