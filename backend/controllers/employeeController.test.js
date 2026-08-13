import { describe, it, expect } from 'vitest';
import { pickEmployeeFields } from '../controllers/employeeController.js';

describe('pickEmployeeFields', () => {
  it('keeps the known fields', () => {
    const result = pickEmployeeFields({
      name: 'Jane Smith',
      email: 'jane@example.com',
      position: 'Product Manager',
      department: 'Product',
      salary: 95000,
      joinDate: '2023-02-14',
    });
    expect(result).toEqual({
      name: 'Jane Smith',
      email: 'jane@example.com',
      position: 'Product Manager',
      department: 'Product',
      salary: 95000,
      joinDate: '2023-02-14',
    });
  });

  it('strips dangerous/unknown fields (_id, __v, timestamps, role, password)', () => {
    const result = pickEmployeeFields({
      name: 'Jane Smith',
      email: 'jane@example.com',
      _id: '123',
      __v: 0,
      createdAt: '2020-01-01',
      updatedAt: '2020-01-01',
      role: 'admin',
      password: 'hunter2',
    });
    expect(result).toEqual({
      name: 'Jane Smith',
      email: 'jane@example.com',
      position: undefined,
      department: undefined,
      salary: undefined,
      joinDate: undefined,
    });
  });

  it('leaves optional fields undefined when not provided', () => {
    const result = pickEmployeeFields({ name: 'Ada', email: 'ada@example.com' });
    expect(result.position).toBeUndefined();
    expect(result.department).toBeUndefined();
    expect(result.salary).toBeUndefined();
    expect(result.joinDate).toBeUndefined();
  });
});
