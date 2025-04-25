// Importa as funções necessárias para renderizar componentes e interagir com a tela
import { render, screen } from '@testing-library/react';
// Importa o componente principal da aplicação que será testado
import App from './App';

// Define um teste com o nome 'renders learn react link'
test('renders learn react link', () => {
  // Renderiza o componente App na tela virtual de teste
  render(<App />);
  
  // Procura por um elemento na tela que contenha o texto 'learn react' (não diferencia maiúsculas de minúsculas)
  const linkElement = screen.getByText(/learn react/i);
  
  // Verifica se o elemento encontrado está presente no documento
  expect(linkElement).toBeInTheDocument();
});
