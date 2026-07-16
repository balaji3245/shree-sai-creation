import { expect } from 'chai';
import { api, BASE } from './helpers/api.js';

describe('Health', function () {
  it('GET /health returns database up', async function () {
    const res = await api().get(`${BASE}/health`).expect(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.database).to.equal('up');
  });

  it('unknown route returns 404', async function () {
    const res = await api().get(`${BASE}/does-not-exist`).expect(404);
    expect(res.body.success).to.equal(false);
  });
});
