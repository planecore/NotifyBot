import React from "react"
import Head from "./Head"

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <Head title="404">
        <meta name="robots" content="noindex" />
      </Head>
      <h2>404</h2>
      <h2>Not Found</h2>
    </div>
  )
}

export default NotFound
