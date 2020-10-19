import * as NextHead from "next/head"

type HeadProps = {
  title: string
  desc?: string
  children?: JSX.Element | [JSX.Element]
}

/** Creates meta tags for a page */
const Head = ({
  title,
  desc = "Schedule Telegram notifications",
  children = undefined,
}: HeadProps) => (
  <NextHead.default>
    <title>{`NotifyBot | ${title}`}</title>
    <link rel="icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={desc} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={`NotifyBot | ${title}`} />
    <meta property="og:description" content={desc} />
    <meta property="og:site_name" content="NotifyBot" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={`NotifyBot | ${title}`} />
    <meta name="twitter:description" content={desc} />
    {children}
  </NextHead.default>
)

export default Head
