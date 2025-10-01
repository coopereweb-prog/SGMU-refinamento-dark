// Define o conjunto de testes para o Gerenciamento de Pontos do Admin
describe('Gerenciamento de Pontos (Admin)', () => {
  // Gera um nome único para o ponto a cada execução para evitar conflitos
  const newPointName = `Ponto de Teste Automatizado ${Date.now()}`;
  const editedPointName = `${newPointName} - Editado`;

  // Esta função de setup é executada antes de cada teste neste ficheiro.
  // Garante que o utilizador está logado como admin e na página correta.
  beforeEach(async ({ page, baseURL }) => {
    // Passo 1: Fazer login como administrador
    await page.goto(baseURL);
    await page.getByRole('link', { name: 'Área Restrita' }).click();
    await page.getByLabel('E-mail').fill('seupontoon@gmail.com');
    await page.getByLabel('Senha').fill('123456teste');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Passo 2: Navegar para a página de gerenciamento de pontos
    await page.getByRole('link', { name: 'Gerenciar Pontos' }).click();
    
    // Passo 3: Verificar se estamos na página correta
    await expect(page.getByRole('heading', { name: 'Gerenciamento de Pontos' })).toBeVisible();
  });

  // Este é o caso de teste principal que cobre o ciclo de vida completo de um ponto.
  test('Deve permitir criar, editar e excluir um ponto', async ({ page }) => {
    // --- ETAPA DE CRIAÇÃO ---
    await page.getByRole('button', { name: 'Adicionar Novo Ponto' }).click();
    
    // Espera o formulário (modal) aparecer e preenche os campos essenciais
    await expect(page.getByRole('heading', { name: 'Adicionar Novo Ponto' })).toBeVisible();
    await page.getByLabel('Nome do Ponto').fill(newPointName);
    await page.getByLabel('Latitude').fill('-22.78');
    await page.getByLabel('Longitude').fill('-47.30');
    await page.getByLabel('1 Ano (R$)').fill('1500');
    await page.getByRole('button', { name: 'Salvar Ponto' }).click();

    // Verificação: O novo ponto deve agora estar visível na tabela
    await expect(page.getByRole('cell', { name: newPointName })).toBeVisible();

    // --- ETAPA DE EDIÇÃO ---
    // Encontra a linha do ponto que acabamos de criar e clica no botão de editar
    const pointRow = page.getByRole('row', { name: newPointName });
    await pointRow.getByRole('button', { name: 'Edit' }).click();

    // Espera o formulário de edição aparecer e altera o nome
    await expect(page.getByRole('heading', { name: 'Editar Ponto' })).toBeVisible();
    await page.getByLabel('Nome do Ponto').fill(editedPointName);
    await page.getByRole('button', { name: 'Salvar Ponto' }).click();

    // Verificação: O nome editado deve estar na tabela e o nome antigo não deve mais existir
    await expect(page.getByRole('cell', { name: editedPointName })).toBeVisible();
    await expect(page.getByRole('cell', { name: newPointName })).not.toBeVisible();

    // --- ETAPA DE EXCLUSÃO ---
    // Prepara o teste para aceitar a caixa de diálogo de confirmação do navegador ("Tem certeza?")
    page.on('dialog', dialog => dialog.accept());

    // Encontra a linha do ponto editado e clica no botão de excluir
    const editedPointRow = page.getByRole('row', { name: editedPointName });
    await editedPointRow.getByRole('button', { name: 'Delete' }).click();

    // Verificação: O ponto não deve mais estar na tabela
    await expect(page.getByRole('cell', { name: editedPointName })).not.toBeVisible();
  });
});