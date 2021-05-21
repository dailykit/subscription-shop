import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
   static async getInitialProps(ctx) {
      const initialProps = await Document.getInitialProps(ctx)
      return { ...initialProps }
   }

   render() {
      return (
         <Html>
            <Head>
               <script src="/env-config.js"></script>
            </Head>
            <body>
               <div id="portal" />
               <Main />
               <NextScript />
            </body>
         </Html>
      )
   }
}

export default MyDocument
