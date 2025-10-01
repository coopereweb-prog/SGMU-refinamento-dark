// Define o conjunto de testes para o Gerenciamento de Tags do Admin
describe('Gerenciamento de Tags (Admin)', () => {
  // Gera um nome único para a tag a cada execução
  const newTagName = `Tag de Teste ${Date.now()}`;
  const editedTagName = `${newTagName} - Editada`;

  // Setup: Executado antes de cada teste para garantir o login e a navegação
  beforeEach(async ({ page, baseURL }) => {
    // 1. Fazer login como administrador
    await page.goto(baseURL);
    await page.getByRole('link', { name: 'Área Restrita' }).click();
    await page.getByLabel('E-mail').fill('seupontoon@gmail.com');
    await page.getByLabel('Senha').fill('123456teste');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // 2. Navegar para a página de gerenciamento de tags
    await page.getByRole('link', { name: 'Gerenciar Tags' }).click();
    
    // 3. Verificar se estamos na página correta
    await expect(page.getByRole('heading', { name: 'Gerenciamento de Tags' })).toBeVisible();
  });

  // Teste principal para o ciclo de vida de uma tag
  test('Deve permitir criar, editar e excluir uma tag', async ({ page }) => {
    // --- ETAPA DE CRIAÇÃO ---
    await page.getByRole('button', { name: 'Adicionar Nova Tag' }).click();
    
    // Preenche o formulário no modal
    await expect(page.getByRole('heading', { name: 'Adicionar Nova Tag' })).toBeVisible();
    await page.getByLabel('Nome da Tag').fill(newTagName);
    await page.getByRole('button', { name: 'Salvar Tag' }).click();

    // Verificação: A nova tag deve aparecer na tabela
    await expect(page.getByRole('cell', { name: newTagName })).toBeVisible();

    // --- ETAPA DE EDIÇÃO ---
    // Encontra a linha da nova tag e clica em editar
    const tagRow = page.getByRole('row', { name: newTagName });
    await tagRow.getByRole('button', { name: 'Edit' }).click();

    // Altera o nome no formulário de edição
    await expect(page.getByRole('heading', { name: 'Editar Tag' })).toBeVisible();
    await page.getByLabel('Nome da Tag').fill(editedTagName);
    await page.getByRole('button', { name: 'Salvar Tag' }).click();

    // Verificação: O nome editado deve aparecer e o antigo deve sumir
    await expect(page.getByRole('cell', { name: editedTagName })).toBeVisible();
    await expect(page.getByRole('cell', { name: newTagName })).not.toBeVisible();

    // --- ETAPA DE EXCLUSÃO ---
    // Aceita o pop-up de confirmação do navegador
    page.on('dialog', dialog => dialog.accept());

    // Encontra a linha da tag editada e clica em excluir
    const editedTagRow = page.getByRole('row', { name: editedTagName });
    await editedTagRow.getByRole('button', { name: 'Delete' }).click();

    // Verificação: A tag não deve mais estar na tabela
    await expect(page.getByRole('cell', { name: editedTagName })).not.toBeVisible();
  });
});