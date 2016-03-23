import {expect} from 'chai';
import {List, Map, fromJS} from 'immutable';

import {setEntries, next, vote, reset} from '../src/core';

describe('application logic', () => {

  describe('set entries', () => {

    it('adds the entries to the state', () => {
      const state = Map();
      const entries = List.of('Trainspotting', '28 Days Later');
      const nextState = setEntries(state, entries);
      expect(nextState).to.equal(fromJS({
        entries: ['Trainspotting', '28 Days Later'],
        originalEntries: ['Trainspotting', '28 Days Later']
      }));
    });

    it('converts to immutable', () => {
      const state = Map();
      const entries = ['Trainspotting', '28 Days Later'];
      const nextState = setEntries(state, entries);
      expect(nextState).to.equal(fromJS({
        entries: ['Trainspotting', '28 Days Later'],
        originalEntries: ['Trainspotting', '28 Days Later']
      }));
    });

  });

  describe('next', () => {

    it('takes the next two entries under vote and initialzes vote id to 1', () => {
      const state = Map({
        entries: List.of('Trainspotting', '28 Days Later', 'Sunshine')
      });
      const nextState = next(state);
      expect(nextState).to.equal(Map({
        vote: Map({
          id: 1,
          pair: List.of('Trainspotting', '28 Days Later')
        }),
        entries: List.of('Sunshine')
      }));
    });

    it('puts the winner of current vote back to entries and increments vote id', () => {
      const state = Map({
        vote: Map({
          id: 1,
          pair: List.of('Trainspotting', '28 Days Later'),
          tally: Map({
            'Trainspotting': 4,
            '28 Days Later': 2
          })
        }),
        entries: List.of('Sunshine', 'Millions', '127 Hours')
      });
      const nextState = next(state);
      expect(nextState).to.equal(Map({
        vote: Map({
          id: 2,
          pair: List.of('Sunshine', 'Millions')
        }),
        entries: List.of('127 Hours', 'Trainspotting')
      }));
    });

    it('puts both from tied vote back to entries', () => {
      const state = Map({
        vote: Map({
          id: 1,
          pair: List.of('Trainspotting', '28 Days Later'),
          tally: Map({
            'Trainspotting': 3,
            '28 Days Later': 3
          })
        }),
        entries: List.of('Sunshine', 'Millions', '127 Hours')
      });
      const nextState = next(state);
      expect(nextState).to.equal(Map({
        vote: Map({
          id: 2,
          pair: List.of('Sunshine', 'Millions')
        }),
        entries: List.of('127 Hours', 'Trainspotting', '28 Days Later')
      }));
    });

    it('marks the winner when just one entry left', () => {
      const state = Map({
        vote: Map({
          id: 1,
          pair: List.of('Trainspotting', '28 Days Later'),
          tally: Map({
            'Trainspotting': 4,
            '28 Days Later': 2
          })
        }),
        entries: List()
      });
      const nextState = next(state);
      expect(nextState).to.equal(Map({
        winner: 'Trainspotting'
      }));
    });

  });

  describe('reset', () => {

    it('cleares the vote, set the entries to the original entry collection and initializes the first vote (next)', () => {
      const state = fromJS({
        vote: {
          pair: ['Sunshine', '128 Hours'],
          voters: {
            voter1: 'Sunshine',
            voter2: '128 Hours'
          },
          tally: {
            'Sunshine': 1,
            '128 Hours': 1
          }
        },
        entries: ['Trainspotting'],
        originalEntries: ['Trainspotting', '28 Days Later', 'Sunshine', '128 Hours']
      });
      const nextState = reset(state);
      expect(nextState).to.equal(fromJS({
        vote: {
          id: 1,
          pair: ['Trainspotting', '28 Days Later']
        },
        entries: ['Sunshine', '128 Hours'],
        originalEntries: ['Trainspotting', '28 Days Later', 'Sunshine', '128 Hours']
      }));
    });
  });

  describe('vote', () => {

    it('creates a tally and voter for the voted entry', () => {
      const state = Map({
        pair: List.of('Trainspotting', '28 Days Later')
      });
      const nextState = vote(state, {
        voterId: 'voter1',
        entry: 'Trainspotting'
      });
      expect(nextState).to.equal(Map({
        pair: List.of('Trainspotting', '28 Days Later'),
        voters: Map(fromJS({
          voter1: 'Trainspotting'
        })),
        tally: Map({
          'Trainspotting': 1
        })
      }));
    });

    it('adds to existing tally and creates a voter for the voted entry', () => {
      const state = fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        voters: {
          voter1: 'Trainspotting',
          voter2: '28 Days Later',
          voter3: 'Trainspotting',
          voter4: 'Trainspotting',
          voter5: '28 Days Later'
        },
        tally: {
          'Trainspotting': 3,
          '28 Days Later': 2
        }
      });
      const nextState = vote(state, {
        voterId: 'voter6',
        entry: 'Trainspotting'
      });
      expect(nextState).to.equal(fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        voters: {
          voter1: 'Trainspotting',
          voter2: '28 Days Later',
          voter3: 'Trainspotting',
          voter4: 'Trainspotting',
          voter5: '28 Days Later',
          voter6: 'Trainspotting'
        },
        tally: {
          'Trainspotting': 4,
          '28 Days Later': 2
        }
      }));
    });

    it('adjusts tally and voter for the voted entry', () => {
      const state = fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        voters: {
          voter1: 'Trainspotting',
          voter2: '28 Days Later',
          voter3: 'Trainspotting',
          voter4: 'Trainspotting',
          voter5: '28 Days Later'
        },
        tally: {
          'Trainspotting': 3,
          '28 Days Later': 2
        }
      });
      const nextState = vote(state, {
        voterId: 'voter4',
        entry: '28 Days Later'
      });
      expect(nextState).to.equal(fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        voters: {
          voter1: 'Trainspotting',
          voter2: '28 Days Later',
          voter3: 'Trainspotting',
          voter4: '28 Days Later',
          voter5: '28 Days Later'
        },
        tally: {
          'Trainspotting': 2,
          '28 Days Later': 3
        }
      }));
    });

    it('ignores vote for entry not contained in current pair', () => {
      const state = Map(fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        voters: {
          voter1: 'Trainspotting'
        },
        tally: { Trainspotting: 1 }
      }));
      const nextState = vote(state, {
        voterId: 'voter2',
        entry: 'Sunshine'
      });
      expect(nextState).to.equal(fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        voters: {
          voter1: 'Trainspotting'
        },
        tally: { Trainspotting: 1 }
      }));
    });

  });

});