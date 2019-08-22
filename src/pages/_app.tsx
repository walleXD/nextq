import React from 'react'
import App, { Container } from 'next/app'
import { ApolloProvider } from 'react-apollo'
import withApollo from '../utils/withApollo'
import { ReactElement } from 'react'
import {
  ApolloClient,
  NormalizedCacheObject
} from 'apollo-boost'

interface Props {
  apollo: ApolloClient<NormalizedCacheObject>
}

class MyApp extends App<Props> {
  public render(): ReactElement {
    const { Component, pageProps, apollo } = this.props

    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Component {...pageProps} />
        </ApolloProvider>
      </Container>
    )
  }
}

export default withApollo(MyApp)
