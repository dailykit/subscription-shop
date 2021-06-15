import React from 'react'
import styled from 'styled-components'
import { Layout, SEO } from '../../components'

const Index = ({ params }) => {
   return (
      <Layout>
         <SEO title={params.slugs[0]} />
         <Main>
            <h1>hello - {params.brand}</h1>
         </Main>
      </Layout>
   )
}

export default Index

export async function getStaticProps(ctx) {
   const params = ctx.params
   console.log(params)

   const props = { params }
   return { props, revalidate: 60 }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}

const Main = styled.main`
   margin: auto;
   overflow-y: auto;
   max-width: 1180px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
   > section {
      width: 100%;
      max-width: 360px;
   }
`
