import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { createNewGameState, SAVE_VERSION } from '../src/systems/gameState.js';
import { saveGame, loadGame, deleteSave, exportSave, importSave, migrate, _resetForTests } from '../src/systems/saveSystem.js';
import { purchase, equip } from '../src/systems/inventory.js';

beforeEach(async () => { _resetForTests(); await deleteSave(); });

describe('IndexedDB save system', () => {
  it('returns null when there is no save', async () => {
    expect(await loadGame()).toBe(null);
  });
  it('round-trips a full game state', async () => {
    const s = createNewGameState({ name: 'Mia', appearance: { skin: 'cocoa' } });
    purchase(s, 'clothing', 'dr_red_slip');
    equip(s, 'dr_red_slip');
    await saveGame(s);
    _resetForTests(); // simulate a browser restart (new connection)
    const loaded = await loadGame();
    expect(loaded.player.name).toBe('Mia');
    expect(loaded.player.coins).toBe(s.player.coins);
    expect(loaded.appearance.skin).toBe('cocoa');
    expect(loaded.equipped.dress).toBe('dr_red_slip');
    expect(loaded.inventory.clothing.dr_red_slip).toBeTruthy();
  });
  it('keeps the latest of several rapid saves', async () => {
    const s = createNewGameState();
    const writes = [];
    for (let i = 1; i <= 5; i++) { s.player.coins = i; writes.push(saveGame(s)); }
    await Promise.all(writes);
    expect((await loadGame()).player.coins).toBe(5);
  });
  it('deletes saves', async () => {
    await saveGame(createNewGameState());
    await deleteSave();
    expect(await loadGame()).toBe(null);
  });
});

describe('migrations & import/export', () => {
  it('upgrades a version-0 prototype save and fills missing fields', () => {
    const old = { player: { name: 'Old', coins: 42, gems: 1, level: 3, xp: 5, fame: 0 }, equipped: { top: 'does_not_exist' } };
    const m = migrate(old);
    expect(m.version).toBe(SAVE_VERSION);
    expect(m.player.coins).toBe(42);
    expect(m.ledger.processed).toEqual({});
    expect(m.equipped.top).toBe(null); // unknown item dropped
    expect(m.settings.sound).toBe(true);
  });
  it('rejects saves from the future and garbage', () => {
    expect(() => migrate({ player: {}, version: SAVE_VERSION + 1 })).toThrow();
    expect(() => importSave('not json')).toThrow();
    expect(() => importSave('{"hello":1}')).toThrow();
  });
  it('exports and re-imports a save', () => {
    const s = createNewGameState({ name: 'Zoe' });
    s.player.coins = 1234;
    const back = importSave(exportSave(s));
    expect(back.player).toMatchObject({ name: 'Zoe', coins: 1234 });
  });
});
