import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { of } from 'rxjs'
import AragonApi from '@aragon/api'

const INITIALIZATION_TRIGGER = Symbol('INITIALIZATION_TRIGGER');

const api = new AragonApi();

const tokenManagerAddress = api.externals(['token-manager']);

api.store(
  async (state, event) => {
    let newState;
    
    console.log('tokenManagerAddress.address', tokenManagerAddress.address)
    console.log('tokenManagerAddress.address()', tokenManagerAddress.address())

    switch (event.event) {
      case INITIALIZATION_TRIGGER:
        newState = { count: await getValue() };
        break;
      case 'Increment':
        newState = { count: await getValue() };
        break;
      case 'Decrement':
        newState = { count: await getValue() };
        break;
      default:
        newState = state
    }

    newState.organizationAddress = '';

    return newState
  },
  [
    // Always initialize the store with our own home-made event
    of({ event: INITIALIZATION_TRIGGER }),
    tokenManagerAddress
  ]
);

async function getValue() {
  return parseInt(await api.call('value').toPromise(), 10)
}
