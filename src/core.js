import {List, Map} from 'immutable';

export const INITIAL_STATE = Map();

export function setEntries(state, entries) {
  return state.set('entries', List(entries));
}

export function next(state) {
  const entries = state.get('entries')
    .concat(getWinners(state.get('vote')));

  if (entries.size === 1) {
    return state
      .remove('vote')
      .remove('entries')
      .set('winner', entries.first());
  }

  const voteId = (state.getIn(['vote', 'id']) || 0);
  return state
    .merge({
      vote: Map({
        id: voteId + 1,
        pair: entries.take(2)
      }),
      entries: entries.skip(2)
    });
}

export function vote(voteState, vote) {
  const currentPair = voteState.get('pair');
  if (currentPair.contains(vote.entry)) {
    const voters = (voteState.get('voters') || Map()).merge({[vote.voterId]: vote.entry}).toJS();
    const tally = Object.keys(voters).reduce((prev, voterId) => {
      const vote = voters[voterId];
      prev[vote] = (prev[vote] || 0) + 1;
      return prev;
    }, {});

    return voteState
      .setIn(['tally'], Map(tally))
      .setIn(['voters'], Map(voters));
  }
  return voteState;
}

function getWinners(vote) {
  if (!vote) return [];
  const [a, b] = vote.get('pair');
  const aVotes = vote.getIn(['tally', a], 0);
  const bVotes = vote.getIn(['tally', b], 0);
  if (aVotes > bVotes) return [a];
  if (bVotes > aVotes) return [b];
  return [a, b];
}