import React, { useState } from 'react'
import { useAragonApi } from '@aragon/api-react'
import { Main, Button, Field } from '@aragon/ui'
import styled from 'styled-components'

const Web3EthAbi = require('web3-eth-abi');
const Web3Utils = require('web3-utils');

import {utils} from 'web3';
const { hash } = require('eth-ens-namehash');

function App() {
  const { api, appState } = useAragonApi();
  const { syncing } = appState;

  const state = {
    organizationAddress: useState(''),
    spaceTokenAddress: useState(''),
    spaceReputationAddress: useState(''),
    lockerRegistryAddress: useState('')
  };
  
  async function submit() {
    const AMP_NODE = '0x9065c3e7f7b7ef1ef4e53d2d0b8e0cef02874ab020c1ece79d5f0d3d0111c0ba';

    const organization = await api.external(state.organizationAddress[0], '[{"constant":true,"inputs":[{"name":"_namespace","type":"bytes32"},{"name":"_appId","type":"bytes32"}],"name":"getApp","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]').toPromise();
    
    const votingHash = (new Web3EthAbi.AbiCoder()).encodeParameters(['bytes32', 'bytes32'], [AMP_NODE, Web3Utils.keccak256('voting')]);
    
    const votingAddress = await organization.getApp(utils.keccak256("base"), votingHash);
    console.log('votingAddress', votingAddress);
    
    api.setup(
      state.spaceTokenAddress[0],
      state.spaceReputationAddress[0], 
      state.lockerRegistryAddress[0],
      votingAddress
    );
    // console.log('state', state);
  }
  
  return (
    <Main>
      <BaseLayout>
        <Field label="Your organization address">
          <input value={state.organizationAddress[0]} onChange={(val) => state.organizationAddress[1](val.target.value)} />
        </Field>
        
        <Field label="Your SpaceToken address">
          <input value={state.spaceTokenAddress[0]} onChange={(val) => state.spaceTokenAddress[1](val.target.value)} />
        </Field>

        <Field label="Your Reputation address">
          <input value={state.spaceReputationAddress[0]} onChange={(val) => state.spaceReputationAddress[1](val.target.value)} />
        </Field>

        <Field label="Your Locker Registry address">
          <input value={state.lockerRegistryAddress[0]} onChange={(val) => state.lockerRegistryAddress[1](val.target.value)} />
        </Field>
  
        {syncing && <Syncing />}
        <Buttons>
          <Button mode="secondary" onClick={() => submit()}>
            Setup
          </Button>
        </Buttons>
      </BaseLayout>
    </Main>
  )
}

const BaseLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  flex-direction: column;
`

const Count = styled.h1`
  font-size: 30px;
`

const Buttons = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 40px;
  margin-top: 20px;
`

const Syncing = styled.div.attrs({ children: 'Syncing…' })`
  position: absolute;
  top: 15px;
  right: 20px;
`

export default App
