import assert from 'node:assert/strict';
import test from 'node:test';
import { obterNumeroIssue, planejar } from './rotular-manutencao.mjs';

function corpo(suite) {
  return [
    '### Tipo de falha',
    'SUT: o teste encontrou um defeito real no sistema (falha:sut)',
    '',
    '### Prioridade',
    'Alta: bloqueia a main ou o smoke, corrigir em até 1 dia útil (prioridade:alta)',
    ...(suite === undefined ? [] : ['', '### Suíte afetada', suite]),
    '',
    '### O teste é instável?',
    'Não',
  ].join('\n');
}

test('adiciona mobile quando a suíte afetada é mobile', () => {
  const plano = planejar(corpo('Mobile (testes do app)'), ['falha:sut', 'prioridade:alta']);

  assert.deepEqual(plano.adicionar, ['mobile']);
  assert.deepEqual(plano.remover, []);
});

test('remove mobile quando a suíte muda para outra', () => {
  const plano = planejar(corpo('Backend e web (unit-api, e2e-smoke, regressão completa)'), [
    'falha:sut',
    'prioridade:alta',
    'mobile',
  ]);

  assert.deepEqual(plano.adicionar, []);
  assert.deepEqual(plano.remover, ['mobile']);
});

test('não altera mobile em issues sem o campo Suíte afetada', () => {
  const plano = planejar(corpo(), ['falha:sut', 'prioridade:alta', 'mobile']);

  assert.deepEqual(plano.adicionar, []);
  assert.deepEqual(plano.remover, []);
});

test('obtém o número da issue em execução manual', () => {
  assert.equal(obterNumeroIssue({ inputs: { issue_number: '42' } }), 42);
});

test('rejeita execução manual sem número de issue válido', () => {
  assert.throws(() => obterNumeroIssue({ inputs: { issue_number: '0' } }), /número de issue válido/);
});
