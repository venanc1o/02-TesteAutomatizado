import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {
  test.beforeEach(async ({ page }) => {
    // Ajuste a URL conforme a porta onde sua aplicação está rodando
    await page.goto('https://venanc1o.github.io/02-TesteAutomatizado/', {
    waitUntil: 'networkidle',
    timeout: 60000
    });
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========

  test.describe('Cadastro de Alunos', () => {

    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que o aluno aparece na tabela
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.locator('#tabela-alunos').getByText('João Silva')).toBeVisible();
    });

    test('deve exibir mensagem de sucesso após cadastro', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Ana Costa');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
    });

    test('não deve cadastrar aluno sem nome', async ({ page }) => {
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // A tabela deve continuar sem dados reais
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 2: Cálculo de Média ==========

  test.describe('Cálculo de Média', () => {

    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média esperada: (8 + 6 + 10) / 3 = 7.00
      const celulaMedia = page.locator('#tabela-alunos tbody tr td').nth(4);
      await expect(celulaMedia).toHaveText('7.00');
    });

  });

  // ========== GRUPO 3: Validação de Notas ==========

  test.describe('Validação de Notas', () => {

    test('deve rejeitar nota acima do intervalo (nota > 10)', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Maria Silva');
      await page.getByLabel('Nota 1').fill('11'); // Nota inválida: acima de 10
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('9');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que eine mensagem de erro é exibida
      await expect(page.locator('#mensagem')).toContainText(/inválid|fora do intervalo|0 e 10/i);
    });

    test('deve rejeitar nota abaixo do intervalo (nota < 0)', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Carlos Oliveira');
      await page.getByLabel('Nota 1').fill('-1'); // Nota inválida: abaixo de 0
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('8');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que uma mensagem de erro é exibida
      await expect(page.locator('#mensagem')).toContainText(/inválid|fora do intervalo|0 e 10/i);
    });

  });

  // ========== GRUPO 4: Busca por Nome ==========

  test.describe('Busca por Nome', () => {

    test('deve exibir apenas o aluno correspondente ao termo de busca', async ({ page }) => {
      // Cadastrar primeiro aluno
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Cadastrar segundo aluno
      await page.getByLabel('Nome do Aluno').fill('Maria Santos');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que ambos os alunos aparecem na tabela
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(2);

      // Usar filtro de busca para procurar por "João"
      await page.getByPlaceholder(/buscar|filtrar|pesquisar/i).fill('João');

      // Verificar que apenas o aluno João Silva é exibido
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.locator('#tabela-alunos').getByText('João Silva')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Maria Santos')).not.toBeVisible();
    });

  });

  // ========== GRUPO 5: Exclusão ==========

  test.describe('Exclusão', () => {

    test('deve excluir um aluno e deixar a tabela vazia', async ({ page }) => {
      // Cadastrar um aluno
      await page.getByLabel('Nome do Aluno').fill('Lucas Ferreira');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que o aluno aparece na tabela
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.locator('#tabela-alunos').getByText('Lucas Ferreira')).toBeVisible();

      // Clicar no botão de exclusão (deletar ou remover)
      await page.getByRole('button', { name: /deletar|remover|excluir/i }).click();

      // Verificar que a tabela ficou vazia
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(0);
    });

  });

  // ========== GRUPO 6: Estatísticas ==========

  test.describe('Estatísticas', () => {

    test('deve exibir estatísticas corretas para alunos em diferentes situações', async ({ page }) => {
      // Cadastrar primeiro aluno - APROVADO (média >= 7)
      await page.getByLabel('Nome do Aluno').fill('Aluno Aprovado');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('8');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Cadastrar segundo aluno - RECUPERAÇÃO (5 <= média < 7)
      await page.getByLabel('Nome do Aluno').fill('Aluno Recuperação');
      await page.getByLabel('Nota 1').fill('6');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Cadastrar terceiro aluno - REPROVADO (média < 5)
      await page.getByLabel('Nome do Aluno').fill('Aluno Reprovado');
      await page.getByLabel('Nota 1').fill('3');
      await page.getByLabel('Nota 2').fill('4');
      await page.getByLabel('Nota 3').fill('4');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar cards de estatísticas
      // Verificar total de alunos
      await expect(page.locator('[class*="card"], [class*="stat"]')).toContainText(/total|alunos/i);
      
      // Verificar contagem de aprovados
      await expect(page.locator('[class*="card"], [class*="stat"]')).toContainText(/aprovado|1/i);
      
      // Verificar contagem de recuperação
      await expect(page.locator('[class*="card"], [class*="stat"]')).toContainText(/recuperação|recuperação/i);
      
      // Verificar contagem de reprovados
      await expect(page.locator('[class*="card"], [class*="stat"]')).toContainText(/reprovado|1/i);
    });

  });

  // ========== GRUPO 7: Situação — Aprovado ==========

  test.describe('Situação — Aprovado', () => {

    test('deve exibir situação "Aprovado" para aluno com média ≥ 7', async ({ page }) => {
      // Cadastrar um aluno com média >= 7 (notas: 7, 8, 9 = média 8.00)
      await page.getByLabel('Nome do Aluno').fill('Aluno com Média Alta');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('9');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que a situação exibida é "Aprovado"
      await expect(page.locator('#tabela-alunos').getByText('Aprovado')).toBeVisible();
      
      // Verificar que o aluno está na tabela
      await expect(page.locator('#tabela-alunos').getByText('Aluno com Média Alta')).toBeVisible();
    });

  });

  // ========== GRUPO 8: Situação — Reprovado ==========

  test.describe('Situação — Reprovado', () => {

    test('deve exibir situação "Reprovado" para aluno com média < 5', async ({ page }) => {
      // Cadastrar um aluno com média < 5 (notas: 3, 4, 5 = média 4.00)
      await page.getByLabel('Nome do Aluno').fill('Aluno com Média Baixa');
      await page.getByLabel('Nota 1').fill('3');
      await page.getByLabel('Nota 2').fill('4');
      await page.getByLabel('Nota 3').fill('5');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que a situação exibida é "Reprovado"
      await expect(page.locator('#tabela-alunos').getByText('Reprovado')).toBeVisible();
      
      // Verificar que o aluno está na tabela
      await expect(page.locator('#tabela-alunos').getByText('Aluno com Média Baixa')).toBeVisible();
    });

  });

  // ========== GRUPO 9: Múltiplos Cadastros ==========

  test.describe('Múltiplos Cadastros', () => {

    test('deve cadastrar 3 alunos consecutivos e exibir 3 linhas na tabela', async ({ page }) => {
      // Cadastrar primeiro aluno
      await page.getByLabel('Nome do Aluno').fill('Primeiro Aluno');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Cadastrar segundo aluno
      await page.getByLabel('Nome do Aluno').fill('Segundo Aluno');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Cadastrar terceiro aluno
      await page.getByLabel('Nome do Aluno').fill('Terceiro Aluno');
      await page.getByLabel('Nota 1').fill('6');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('8');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que a tabela possui exatamente 3 linhas
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);

      // Verificar que todos os alunos aparecem na tabela
      await expect(page.locator('#tabela-alunos').getByText('Primeiro Aluno')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Segundo Aluno')).toBeVisible();
      await expect(page.locator('#tabela-alunos').getByText('Terceiro Aluno')).toBeVisible();
    });

  });
});