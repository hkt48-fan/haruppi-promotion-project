class Store {
  constructor() {
    this.store = {};

    if (typeof window !== 'undefined' && window.__INITIAL_STATE__) {
      // on client site rehydrate
      let state = window.__INITIAL_STATE__;
      Object.assign(this.store, { ...state });
    }
  }

  set(data) {
    Object.assign(this.store, data);
  }

  rehydrate() {

  }

  dehydrate() {

  }
}

export default new Store();
