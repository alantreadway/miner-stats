import { Algorithm } from '../src/model/algorithm';
import { ALL_ALGORITHMS } from '../src/util/schema';

// tslint:disable-next-line:no-console
console.log(
  JSON.stringify(
    ALL_ALGORITHMS.reduce(
      (r, n) => {
        r[n] = true;
        return r;
      },
      {} as {[key in Algorithm]?: boolean},
    ),
  ),
);
