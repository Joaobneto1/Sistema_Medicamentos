// Função para registrar métricas de desempenho da aplicação
const reportWebVitals = onPerfEntry => {
  // Verifica se a função de callback foi passada e se é uma função válida
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Importa dinamicamente o módulo 'web-vitals' para medir métricas de desempenho
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Chama as funções de medição de desempenho e passa o callback para registrar os resultados
      getCLS(onPerfEntry); // Cumulative Layout Shift
      getFID(onPerfEntry); // First Input Delay
      getFCP(onPerfEntry); // First Contentful Paint
      getLCP(onPerfEntry); // Largest Contentful Paint
      getTTFB(onPerfEntry); // Time to First Byte
    });
  }
};

// Exporta a função para ser usada em outras partes da aplicação
export default reportWebVitals;
