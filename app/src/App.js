import React, { useState } from 'react'
import { useAragonApi } from '@aragon/api-react'
import { Main, Button, Field } from '@aragon/ui'
import styled from 'styled-components'

function App() {
  const { api, appState } = useAragonApi();
  const { syncing } = appState;

  const state = {
    organizationAddress: useState(''),
    spaceTokenAddress: useState(''),
    lockerRegistryAddress: useState('')
  };
  
  function submit() {
    console.log('state', state);
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
