import shuffle from 'lodash/shuffle';
import * as nonces from './nonces';
import * as fixtures from '../../test/fixtures';
import * as providerState from '../providers/state';
import { EVMProviderSponsorState, GroupedRequests, ProviderState, RequestStatus } from '../types';

describe('assign', () => {
  let mutableInitialState: ProviderState<EVMProviderSponsorState>;

  beforeEach(() => {
    mutableInitialState = fixtures.buildEVMProviderSponsorState();
  });

  it('sorts and assigns nonces requests API calls', () => {
    const firstMeta = fixtures.requests.buildMetadata({ blockNumber: 100, transactionHash: '0xa' });
    const secondMeta = fixtures.requests.buildMetadata({ blockNumber: 101, transactionHash: '0xb' });
    const thirdMeta = fixtures.requests.buildMetadata({ blockNumber: 101, transactionHash: '0xc' });

    const sponsorAddress = '0x69e2B095fbAc6C3f9E528Ef21882b86BF1595181';
    const first = fixtures.requests.buildApiCall({
      id: '0x1',
      nonce: undefined,
      metadata: firstMeta,
      sponsorAddress,
    });
    const second = fixtures.requests.buildApiCall({
      id: '0x2',
      nonce: undefined,
      metadata: secondMeta,
      sponsorAddress,
    });
    const third = fixtures.requests.buildApiCall({
      id: '0x3',
      nonce: undefined,
      metadata: thirdMeta,
      sponsorAddress,
    });

    const requests: GroupedRequests = {
      apiCalls: shuffle([third, second, first]),
      withdrawals: [],
    };
    const transactionCountsBySponsorAddress: { readonly [sponsorAddress: string]: number } = {
      [sponsorAddress]: 3,
    };
    const state = providerState.update(mutableInitialState, {
      requests,
      transactionCountsBySponsorAddress,
      sponsorAddress,
    });
    const res = nonces.assign(state);
    expect(res.apiCalls[0]).toEqual({ ...first, nonce: 3 });
    expect(res.apiCalls[1]).toEqual({ ...second, nonce: 4 });
    expect(res.apiCalls[2]).toEqual({ ...third, nonce: 5 });
  });

  it('sorts and assigns nonces requests withdrawals', () => {
    const firstMeta = fixtures.requests.buildMetadata({ blockNumber: 100, transactionHash: '0xa' });
    const secondMeta = fixtures.requests.buildMetadata({ blockNumber: 101, transactionHash: '0xb' });
    const thirdMeta = fixtures.requests.buildMetadata({ blockNumber: 101, transactionHash: '0xc' });

    const sponsorAddress = '0x1d822613f7cC57Be9c9b6C3cC0Bf41b4FB4D97f9';
    const first = fixtures.requests.buildWithdrawal({
      id: '0x1',
      nonce: undefined,
      metadata: firstMeta,
      sponsorAddress,
    });
    const second = fixtures.requests.buildWithdrawal({
      id: '0x2',
      nonce: undefined,
      metadata: secondMeta,
      sponsorAddress,
    });
    const third = fixtures.requests.buildWithdrawal({
      id: '0x3',
      nonce: undefined,
      metadata: thirdMeta,
      sponsorAddress,
    });

    const requests: GroupedRequests = {
      apiCalls: [],
      withdrawals: shuffle([first, third, second]),
    };
    const transactionCountsBySponsorAddress: { readonly [sponsorAddress: string]: number } = { [sponsorAddress]: 11 };
    const state = providerState.update(mutableInitialState, {
      requests,
      transactionCountsBySponsorAddress,
      sponsorAddress,
    });
    const res = nonces.assign(state);
    expect(res.withdrawals[0]).toEqual({ ...first, nonce: 11 });
    expect(res.withdrawals[1]).toEqual({ ...second, nonce: 12 });
    expect(res.withdrawals[2]).toEqual({ ...third, nonce: 13 });
  });

  it('blocks further nonce assignment if a request is within the ignore blocked requests limit', () => {
    const meta = { currentBlock: 110, ignoreBlockedRequestsAfterBlocks: 100 };
    const firstMeta = fixtures.requests.buildMetadata({ ...meta, blockNumber: 100, transactionHash: '0xa' });
    const secondMeta = fixtures.requests.buildMetadata({ ...meta, blockNumber: 101, transactionHash: '0xb' });
    const thirdMeta = fixtures.requests.buildMetadata({ ...meta, blockNumber: 101, transactionHash: '0xc' });

    const sponsorAddress = '0x99bd3a5A045066F1CEf37A0A952DFa87Af9D898E';
    // The second request is blocked
    const first = fixtures.requests.buildApiCall({
      id: '0x1',
      nonce: undefined,
      metadata: firstMeta,
      sponsorAddress,
    });
    const second = fixtures.requests.buildApiCall({
      id: '0x2',
      nonce: undefined,
      metadata: secondMeta,
      status: RequestStatus.Blocked,
      sponsorAddress,
    });
    const third = fixtures.requests.buildApiCall({
      id: '0x3',
      nonce: undefined,
      metadata: thirdMeta,
      sponsorAddress,
    });

    const requests: GroupedRequests = {
      apiCalls: shuffle([third, second, first]),
      withdrawals: [],
    };
    const transactionCountsBySponsorAddress: { readonly [sponsorAddress: string]: number } = { [sponsorAddress]: 7 };
    const state = providerState.update(mutableInitialState, {
      requests,
      transactionCountsBySponsorAddress,
      sponsorAddress,
    });
    const res = nonces.assign(state);
    expect(res.apiCalls[0]).toEqual({ ...first, nonce: 7 });
    expect(res.apiCalls[1]).toEqual({ ...second, nonce: undefined });
    expect(res.apiCalls[2]).toEqual({ ...third, nonce: undefined });
  });

  it('ignores blocked requests if the ignore blocked requests limit has passed', () => {
    const meta = { currentBlock: 110, ignoreBlockedRequestsAfterBlocks: 1 };
    const firstMeta = fixtures.requests.buildMetadata({ ...meta, blockNumber: 100, transactionHash: '0xa' });
    const secondMeta = fixtures.requests.buildMetadata({ ...meta, blockNumber: 101, transactionHash: '0xb' });
    const thirdMeta = fixtures.requests.buildMetadata({ ...meta, blockNumber: 101, transactionHash: '0xc' });

    const sponsorAddress = '0x99bd3a5A045066F1CEf37A0A952DFa87Af9D898E';
    // The second request is blocked
    const first = fixtures.requests.buildApiCall({
      id: '0x1',
      nonce: undefined,
      metadata: firstMeta,
      sponsorAddress,
    });
    const second = fixtures.requests.buildApiCall({
      id: '0x2',
      nonce: undefined,
      metadata: secondMeta,
      sponsorAddress,
      status: RequestStatus.Blocked,
    });
    const third = fixtures.requests.buildApiCall({
      id: '0x3',
      nonce: undefined,
      metadata: thirdMeta,
      sponsorAddress,
    });

    const requests: GroupedRequests = {
      apiCalls: shuffle([third, second, first]),
      withdrawals: [],
    };
    const transactionCountsBySponsorAddress: { readonly [sponsorAddress: string]: number } = { [sponsorAddress]: 7 };
    const state = providerState.update(mutableInitialState, {
      requests,
      transactionCountsBySponsorAddress,
      sponsorAddress,
    });
    const res = nonces.assign(state);
    expect(res.apiCalls[0]).toEqual({ ...first, nonce: 7 });
    expect(res.apiCalls[1]).toEqual({ ...second, nonce: undefined });
    expect(res.apiCalls[2]).toEqual({ ...third, nonce: 8 });
  });

  it('does not assign nonces to fulfilled requests', () => {
    const firstMeta = fixtures.requests.buildMetadata({ blockNumber: 100, transactionHash: '0xa' });
    const secondMeta = fixtures.requests.buildMetadata({ blockNumber: 101, transactionHash: '0xb' });
    const thirdMeta = fixtures.requests.buildMetadata({ blockNumber: 101, transactionHash: '0xc' });

    const sponsorAddress = '0x1d822613f7cC57Be9c9b6C3cC0Bf41b4FB4D97f9';
    const first = fixtures.requests.buildWithdrawal({
      id: '0x1',
      nonce: undefined,
      metadata: firstMeta,
      sponsorAddress,
      status: RequestStatus.Pending,
    });
    const second = fixtures.requests.buildWithdrawal({
      id: '0x2',
      nonce: undefined,
      metadata: secondMeta,
      sponsorAddress,
      status: RequestStatus.Fulfilled,
    });
    const third = fixtures.requests.buildWithdrawal({
      id: '0x3',
      nonce: undefined,
      metadata: thirdMeta,
      sponsorAddress,
      status: RequestStatus.Pending,
    });

    const requests: GroupedRequests = {
      apiCalls: [],
      withdrawals: shuffle([first, third, second]),
    };
    const transactionCountsBySponsorAddress: { readonly [sponsorAddress: string]: number } = { [sponsorAddress]: 11 };
    const state = providerState.update(mutableInitialState, {
      requests,
      transactionCountsBySponsorAddress,
      sponsorAddress,
    });
    const res = nonces.assign(state);
    expect(res.withdrawals[0]).toEqual({ ...first, nonce: 11 });
    expect(res.withdrawals[1]).toEqual({ ...second, nonce: undefined });
    expect(res.withdrawals[2]).toEqual({ ...third, nonce: 12 });
  });
});
