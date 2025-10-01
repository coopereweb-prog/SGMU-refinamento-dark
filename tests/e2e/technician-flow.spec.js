// Define o conjunto de testes para o Fluxo do Técnico de Campo
describe('Fluxo do Técnico de Campo', () => {

  // --- PRÉ-REQUISITOS PARA ESTE TESTE ---
  // 1. Deve existir um utilizador com a função 'field_technician'.
  //    Para este script, usamos 'tecnico@sgum.com' com a senha 'tecnico123'.
  // 2. Deve existir um pedido no banco de dados com status 'completed'
  //    e que tenha pelo menos um ponto SEM 'installation_photo_url'
  //    para que uma tarefa apareça no painel.
  // -----------------------------------------

  // Setup: Faz o login como técnico antes de cada teste
  beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/login`);
    await page.getByLabel('E-mail').fill('tecnico@sgum.com');
    await page.getByLabel('Senha').fill('tecnico123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Verifica se o redirecionamento para o painel do técnico foi bem-sucedido
    await expect(page.getByRole('heading', { name: 'Painel do Técnico' })).toBeVisible();
  });

  // Teste principal
  test('Deve permitir que um técnico envie a foto de uma instalação', async ({ page }) => {
    // 1. Espera que as tarefas carreguem e encontra o primeiro card de pedido
    // Usamos um seletor que procura por um card que contenha o texto "Pedido #".
    const firstTaskCard = page.locator('.card:has-text("Pedido #")').first();
    await expect(firstTaskCard).toBeVisible({ timeout: 10000 });

    // 2. Dentro desse card, encontra o input de ficheiro e "anexa" uma imagem de teste
    // O teste vai simular o upload de um ficheiro que deve existir na pasta 'tests/fixtures'.
    const fileInput = firstTaskCard.getByRole('textbox', { type: 'file' });
    await fileInput.setInputFiles('tests/fixtures/test-image.png');

    // 3. Adiciona um comentário na área de texto
    await firstTaskCard.getByPlaceholder('Adicionar um comentário').fill('Instalação concluída com sucesso.');

    // 4. Clica no botão para enviar
    await firstTaskCard.getByRole('button', { name: 'Enviar' }).click();

    // 5. Verifica a notificação de sucesso (toast)
    // O teste procura por um pop-up que contenha o texto "Foto enviada com sucesso!".
    await expect(page.getByText('Foto enviada com sucesso!')).toBeVisible();

    // 6. Verificação final: O card da tarefa concluída deve desaparecer da lista
    // Após o envio, a tarefa é removida da lista de pendentes.
    await expect(firstTaskCard).not.toBeVisible();
  });
});