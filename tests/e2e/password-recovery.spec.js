// Define o conjunto de testes para o fluxo de recuperação de senha
describe('Fluxo de Recuperação de Senha', () => {

  // Define o caso de teste específico
  test('Deve navegar corretamente pelo fluxo de solicitação de recuperação de senha', async ({ page, baseURL }) => {
    // 1. Navegar diretamente para a página de login
    await page.goto(`${baseURL}/login`);

    // 2. Clicar no link "Esqueceu a senha?"
    await page.getByRole('button', { name: 'Esqueceu a senha?' }).click();

    // 3. Verificar se a interface mudou para o modo de recuperação
    // O título do card deve mudar para "Recuperar Senha".
    await expect(page.getByRole('heading', { name: 'Recuperar Senha' })).toBeVisible();

    // 4. Preencher o campo de e-mail com um e-mail de teste
    // Usamos um e-mail que pode ou não existir, o importante é testar o fluxo.
    await page.getByLabel('E-mail').fill('cliente@sgum.com');

    // 5. Clicar no botão para enviar o link de recuperação
    await page.getByRole('button', { name: 'Enviar Link' }).click();

    // 6. Verificar se a mensagem de confirmação apareceu
    // A aplicação deve mostrar uma mensagem informando que o link foi enviado.
    // Esta é a asserção chave de que a primeira parte do processo funcionou.
    await expect(page.getByText('Se um e-mail válido foi inserido, um link de recuperação foi enviado.')).toBeVisible();

    // 7. Verificar se o utilizador NÃO foi redirecionado
    // O utilizador deve permanecer na página de login/recuperação.
    // Verificamos se o título "Recuperar Senha" ainda está visível.
    await expect(page.getByRole('heading', { name: 'Recuperar Senha' })).toBeVisible();
  });

});