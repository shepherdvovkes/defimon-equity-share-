import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test component
const TestComponent = () => (
  <div>
    <h1>Test Title</h1>
    <p>Test content</p>
    <button>Test Button</button>
  </div>
);

describe('Basic Test Suite', () => {
  test('should render test component', () => {
    render(<TestComponent />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  test('should have proper heading structure', () => {
    render(<TestComponent />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Test Title');
  });

  test('should have proper button', () => {
    render(<TestComponent />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Test Button');
  });

  test('should handle basic math', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
    expect(15 / 3).toBe(5);
  });

  test('should handle async operations', async () => {
    const result = await Promise.resolve('async result');
    expect(result).toBe('async result');
  });

  test('should handle arrays', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers).toContain(3);
    expect(numbers[0]).toBe(1);
    expect(numbers[numbers.length - 1]).toBe(5);
  });

  test('should handle objects', () => {
    const user = {
      name: 'Test User',
      age: 25,
      role: 'developer'
    };
    
    expect(user.name).toBe('Test User');
    expect(user.age).toBe(25);
    expect(user.role).toBe('developer');
    expect(user).toHaveProperty('name');
  });
});
