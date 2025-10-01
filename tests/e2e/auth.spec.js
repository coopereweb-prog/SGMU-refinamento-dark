// Este é um script de teste conceptual para ser executado pelo seu TestSprite MCP.
// A sintaxe pode precisar de pequenos ajustes dependendo do executor de testes específico
// que o TestSprite utiliza (ex: Playwright, Cypress, etc.).

// Define o conjunto de testes de "Autenticação"
describe('Autenticação de Utilizador', () => {

  // Define o caso de teste específico
  test('Deve fazer login com sucesso a partir da página inicial', async ({ page, baseURL }) => {
    // 1. Navegar para a página inicial da aplicação
    // O 'baseURL' será a URL onde a sua aplicação está a correr (ex: http://localhost:5173)
    await page.goto(baseURL);

    // 2. Encontrar e clicar no link/botão "Área Restrita" no cabeçalho
    // Usamos seletores robustos que procuram pelo texto visível para o utilizador.
    await page.getByRole('link', { name: 'Área Restrita' }).click();

    // 3. Verificar se fomos redirecionados para a página de login
    // É uma boa prática garantir que estamos na página certa antes de continuar.
    await expect(page).toHaveURL(`${baseURL}/login`);

    // 4. Preencher o campo de e-mail
    // O seletor procura por um campo de input associado à label "E-mail".
    await page.getByLabel('E-mail').fill('seupontoon@gmail.com');

    // 5. Preencher o campo de senha
    await page.getByLabel('Senha').fill('123456teste');

    // 6. Clicar no botão "Entrar"
    await page.getByRole('button', { name: 'Entrar' }).click();

    // 7. Verificar o resultado do login (A Asserção de Sucesso)
    // Após o login, o cabeçalho deve mudar para mostrar uma saudação.
    // Verificamos se o texto "Olá," aparece em qualquer lugar dentro do cabeçalho.
    // Esta é a confirmação de que o login foi bem-sucedido.
    await expect(page.locator('header')).toContainText('Olá,');
  });

});