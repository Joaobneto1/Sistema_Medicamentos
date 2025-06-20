import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app sem erros', () => {
  render(<App />);

  const elemento = screen.getByText(/login/i);
  expect(elemento).toBeInTheDocument();
});
