import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=optional"
            rel="stylesheet"
          />
          <link
            rel="icon"
            href="/images/logo.png"
            type="image/png"
            sizes="1080x1080"
          />
          <meta property="og:title" content="Secret Chat" />
          <meta property="og:site_name" content="Secret Chat" />
          <meta
            property="og:url"
            content="https://secret-chat-one.vercel.app/"
          />
          <meta
            property="og:description"
            content="¡App para chatear con cualquier persona!"
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:image"
            content="https://secret-chat-one.vercel.app/images/og-image.jpg"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
