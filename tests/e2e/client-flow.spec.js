// Define o conjunto de testes para o fluxo principal do cliente
describe('Fluxo do Cliente - Do Mapa ao Carrinho', () => {

  // Define o caso de teste específico
  test('Deve permitir que um utilizador encontre um ponto, veja detalhes e o adicione ao carrinho', async ({ page, baseURL }) => {
    // 1. Navegar para a página inicial
    await page.goto(baseURL);

    // 2. Esperar que o mapa e os elementos principais da página carreguem
    // Verificamos se o título do mapa está visível antes de prosseguir.
    await expect(page.getByRole('heading', { name: 'Mapa Interativo - Pontos de Instalação' })).toBeVisible({ timeout: 10000 }); // Aumenta o tempo de espera para o mapa carregar

    // 3. Encontrar e clicar num marcador no mapa.
    // Esta é uma forma de simular um clique num dos pontos.
    // Vamos procurar por um marcador que tenha um nome de rua no seu título para ser mais específico.
    // O '.first()' garante que pegamos o primeiro que corresponder.
    await page.getByRole('button', { name: /Rua/ }).first().click();

    // 4. Verificar se a janela de informações (InfoWindow) apareceu
    // A janela de informações contém o texto "Período de Veiculação:", então vamos esperar por ele.
    await expect(page.getByText('Período de Veiculação:')).toBeVisible();

    // 5. Clicar no botão "Adicionar ao Carrinho" dentro da InfoWindow
    await page.getByRole('button', { name: 'Adicionar ao Carrinho' }).click();

    // 6. Verificar se o item foi adicionado ao carrinho
    // O painel do carrinho (que é um <aside> ou <div> no lado direito) deve agora conter o nome do ponto.
    // Vamos procurar pelo painel do carrinho e verificar se o nome do ponto está lá.
    const cartPanel = page.locator('div').filter({ hasText: 'Carrinho de Reservas' }).last();
    await expect(cartPanel.getByText(/Rua/)).toBeVisible();
  });

});