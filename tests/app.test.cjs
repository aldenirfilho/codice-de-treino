'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname, '../app.js'), 'utf8');
const key = 'codice-treino-360x-v1';

function backupV16() {
  return {
    app: 'codice-do-treino-360x',
    versao: 16,
    exportado: '2026-11-08T15:00:00.000Z',
    treinos: [{
      id: 'treino-1', nome: 'Força', data: '2026-11-06', status: 'concluido',
      criado: 1793977200000, concluido: 1793980800000, texto: 'Supino 2x10 20kg',
      blocos: [{
        id: 'bloco-1',
        itens: [{
          nome: 'Supino', series: 2, alvo: 10, un: 'reps', carga: 20,
          feito: [true, true], extra: [true], real: 11, alvoBase: 10
        }]
      }]
    }],
    corpo: [{id: 'medida-1', data: '2026-11-05', peso: 80.5, cintura: 90, altura: 180}],
    modelos: [{n: 'Meu treino', t: 'Supino 2x10'}],
    metas: [{id: 'meta-1', tipo: 'peso', criado: '2026-11-05', prazo: '2027-01-05', inicio: 80.5, alvo: 79}],
    ativo: 'treino-1',
    cfg: {view: 'mob', desc: 120, autoDesc: false, hmMeses: 12}
  };
}

function abrir(storage = new Map()) {
  const elements = new Map();
  const classList = {add() {}, remove() {}, toggle() {}};
  function elemento(selector) {
    if (!elements.has(selector)) {
      elements.set(selector, {classList, style: {}, dataset: {}, querySelectorAll: () => []});
    }
    return elements.get(selector);
  }
  const context = vm.createContext({
    document: {
      body: elemento('body'),
      querySelector: elemento,
      querySelectorAll: () => [],
      getElementById: id => elemento('#' + id),
      addEventListener() {}
    },
    window: {addEventListener() {}, scrollTo() {}},
    navigator: {},
    localStorage: {
      getItem: name => storage.get(name) ?? null,
      setItem: (name, value) => storage.set(name, value)
    },
    clearInterval() {},
    clearTimeout() {},
    setTimeout() {}
  });
  vm.runInContext(source, context, {filename: 'app.js'});
  return {
    elemento,
    run: code => vm.runInContext(code, context),
    async selecionarBackup(data) {
      const input = elemento('#fImport');
      input.files = [{text: async () => JSON.stringify(data)}];
      await input.onchange({target: input});
    }
  };
}

test('backup v16 passa pela prévia e restaura treinos, medidas, modelos, metas e preferências', async () => {
  const storage = new Map();
  const app = abrir(storage);
  const backup = backupV16();
  await app.selecionarBackup(backup);
  assert.equal(storage.has(key), false);
  assert.equal(app.elemento('#importPreview').hidden, false);
  app.elemento('#btnImport').onclick();

  const {app: id, versao, exportado, ...esperado} = backup;
  esperado.cfg = {...esperado.cfg, tema: 'escuro'}; // backups anteriores recebem o tema padrão
  const salvo = JSON.parse(storage.get(key));
  assert.deepEqual(salvo, esperado);
  const {app: novoId, versao: novaVersao, exportado: novaData, ...reexportado} = JSON.parse(app.run('backupTxt()'));
  assert.equal(novoId, id);
  assert.ok(novaVersao >= versao);
  assert.ok(Number.isFinite(Date.parse(novaData)));
  assert.deepEqual(reexportado, esperado);
});

test('backup recusa cargas, unidades, identificadores e datas com HTML interpolável', async () => {
  const original = JSON.stringify(backupV16());
  const storage = new Map([[key, original]]);
  const app = abrir(storage);
  const payload = '\"><img src=x onerror=alert(1)>';
  const alterar = [
    b => { b.treinos[0].blocos[0].itens[0].carga = payload; },
    b => { b.treinos[0].blocos[0].itens[0].un = payload; },
    b => { b.treinos[0].id = payload; },
    b => { b.corpo[0].data = payload; },
    b => { b.metas[0].prazo = payload; }
  ];
  for (const injetar of alterar) {
    const backup = backupV16();
    injetar(backup);
    await app.selecionarBackup(backup);
    assert.equal(app.elemento('#importPreview').hidden, true);
    assert.match(app.elemento('#toast').textContent, /Backup inválido/);
    app.elemento('#btnImport').onclick();
    assert.equal(storage.get(key), original);
  }
});

test('nome livre passa como texto e aparece escapado no checklist', async () => {
  const app = abrir();
  const backup = backupV16();
  backup.treinos[0].blocos[0].itens[0].nome = '<img src=x onerror=alert(1)>';
  await app.selecionarBackup(backup);
  app.elemento('#btnImport').onclick();
  app.run('renderCheck()');
  const checklist = app.elemento('#cBody').innerHTML;
  assert.match(checklist, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(checklist, /<img src=x/);
});

test('uma janela antiga não sobrescreve gravação mais recente', () => {
  const storage = new Map();
  const nova = abrir(storage);
  const antiga = abrir(storage);
  assert.equal(nova.run('DB.cfg.desc = 180; save()'), true);
  assert.equal(antiga.run('DB.cfg.desc = 45; save()'), false);
  assert.equal(JSON.parse(storage.get(key)).cfg.desc, 180);
  assert.match(antiga.elemento('#storageNotice').textContent, /Outra janela/);
});

test('a semana começa na segunda nas datas civis em diferentes fusos', () => {
  const previous = process.env.TZ;
  try {
    for (const timezone of ['America/Fortaleza', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
      process.env.TZ = timezone;
      const app = abrir();
      assert.equal(app.run('semanaISO("2026-11-02")'), '2026-11-02', timezone);
      assert.equal(app.run('semanaISO("2026-11-08")'), '2026-11-02', timezone);
      assert.equal(app.run('semanaISO("2027-01-01")'), '2026-12-28', timezone);
      assert.equal(app.run('diasEntre("2026-03-07", "2026-03-09")'), 2, timezone);
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('tema claro e preferências da esteira sobrevivem ao backup; valores inválidos voltam ao padrão', async () => {
  const storage = new Map();
  const app = abrir(storage);
  const backup = backupV16();
  backup.versao = 18;
  backup.cfg = {...backup.cfg, tema: 'claro', esteira: {tipo: 'subida', dur: 45, nivel: 3, vc: 5.8, vr: 9, incMax: 15, idade: 37}};
  await app.selecionarBackup(backup);
  app.elemento('#btnImport').onclick();
  const salvo = JSON.parse(storage.get(key));
  assert.equal(salvo.cfg.tema, 'claro');
  assert.deepEqual(salvo.cfg.esteira, {tipo: 'subida', dur: 45, nivel: 3, vc: 5.8, vr: 9, incMax: 15, idade: 37});

  const ruim = backupV16();
  ruim.cfg = {...ruim.cfg, tema: '<script>', esteira: {tipo: 'voar', dur: 999, nivel: 9, vc: -1, vr: 'x', incMax: 99, idade: 3}};
  const outra = abrir();
  await outra.selecionarBackup(ruim);
  outra.elemento('#btnImport').onclick();
  assert.equal(outra.run('DB.cfg.tema'), 'escuro');
  assert.deepEqual(JSON.parse(outra.run('JSON.stringify(DB.cfg.esteira)')), {tipo: 'z2', dur: 30, nivel: 2, vc: 5.5, vr: 8, incMax: 12, idade: 37});
});

test('plano de esteira respeita duração, teto de inclinação e gera checklist com timers', () => {
  const app = abrir();
  for (const tipo of ['leve', 'z2', 'subida', 'inter', 'corrida']) {
    for (const dur of [20, 30, 45, 60]) {
      for (const nivel of [1, 2, 3]) {
        const plano = JSON.parse(app.run(`JSON.stringify(planoEsteira({tipo:'${tipo}',dur:${dur},nivel:${nivel},vc:5.5,vr:8,incMax:10,idade:37}))`));
        const total = plano.reduce((a, s) => a + s.min, 0);
        assert.equal(total, dur, `${tipo} ${dur} ${nivel}`);
        assert.ok(plano.every(s => s.inc >= 0 && s.inc <= 10 && s.kmh >= 1.5 && s.min > 0), `${tipo} ${dur} ${nivel}`);
        const texto = plano.map(s => app.run(`linhaEsteira(${JSON.stringify(s)})`)).join('\n');
        const blocos = JSON.parse(app.run(`JSON.stringify(parseTreino(${JSON.stringify(texto)}))`));
        assert.equal(blocos.length, plano.length);
        blocos.forEach((b, i) => {
          assert.equal(b.itens[0].un, 'min');
          assert.equal(b.itens[0].alvo, plano[i].min);
          assert.equal(b.itens[0].carga, null);
        });
      }
    }
  }
  // 30 min de caminhada a 6 km/h e 5% para 80 kg ≈ ACSM: VO2 = 0,1·100 + 1,8·100·0,05 + 3,5 = 22,5 mL/kg/min → 22,5·80/1000·5·30 = 270 kcal
  const t = JSON.parse(app.run(`JSON.stringify(totaisEsteira([{min:30,kmh:6,inc:5,modo:'caminhada'}],80))`));
  assert.equal(t.kcal, 270);
  assert.equal(t.km, 3);
  assert.equal(t.elev, 150);
});
