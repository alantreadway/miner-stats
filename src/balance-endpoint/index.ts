import * as express from 'express';

import { getAhashpoolBalance } from 'balance-endpoint/ahashpool-balance';
import { LOGGER } from 'util/bunyan';
import { setupExpressLambda } from 'util/express';
import { get } from 'util/firebase';
import { DigitalCurrencyAmount, isPool, validPath } from 'util/schema';

const DEFAULT_NO_WALLET_AMOUNT: DigitalCurrencyAmount = {
  amount: 0,
  currency: 'BTC',
};

export function initExpress(app: express.Express): void {
  app.get('/balance/:pool/:currency', async (req, resp) => {
    const pool = req.params.pool;
    const currency = req.params.currency;
    const firebaseUid = req.authenticatedIdToken.uid;

    if (!isPool(pool)) {
      LOGGER.info({ reqId: req.id, pool }, 'Unrecognised pool, sending 404');
      resp.sendStatus(404);
      return;
    }

    if (currency !== 'BTC') {
      LOGGER.info({ reqId: req.id, pool, currency }, 'Unrecognised currency, sending 404');
      resp.sendStatus(404);
      return;
    }

    try {
      const wallet = await get(validPath(['v2', 'user', firebaseUid, 'pool-wallet', pool]));
      if (wallet == null) {
        LOGGER.info(
          { reqId: req.id, pool },
          'Wallet info not stored for pool, sending 404',
        );
        resp.sendStatus(404);
        return;
      }

      const walletId = wallet[currency];
      if (walletId == null) {
        LOGGER.info({ reqId: req.id, pool, currency }, 'No wallet config found, sending 404');
        resp.sendStatus(404);
        return;
      }

      let result: DigitalCurrencyAmount | undefined;
      switch (pool) {
        case 'ahashpool':
          result = await getAhashpoolBalance(walletId);
          break;

        default:
          result = DEFAULT_NO_WALLET_AMOUNT;
          break;
      }

      resp.send(result);
    } catch (err) {
      LOGGER.error({ reqId: req.id, err }, 'Unexpected error, returning 500.');
      resp.sendStatus(500);
      return;
    }
  });
}

export const handler = setupExpressLambda(initExpress);
