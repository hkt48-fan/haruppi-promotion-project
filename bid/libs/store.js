class Store {
  constructor() {
    this.data = {};

    if (typeof window !== 'undefined' && window.__INITIAL_STATE__) {
      // on client site rehydrate
      let state = window.__INITIAL_STATE__;
      Object.assign(this.data, { ...state });
    }
  }

  set(data) {
    Object.assign(this.data, data);
  }

  rehydrate() {

  }

  dehydrate() {

  }
}

export default new Store();
