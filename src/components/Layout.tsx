import React, { createContext, useState, useEffect } from "react"
import { GeistProvider, CssBaseline, Page, Spinner } from "@geist-ui/react"
import { useRouter } from "next/router"
import Header from "./Header"

export type ThemeContextType = {
  theme: "light" | "dark"
  setThemeMode: (value: "auto" | "light" | "dark") => void
}

/** Stores and updates the current theme */
export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setThemeMode: (val) => console.log(val),
})

type LayoutProps = {
  children: JSX.Element | [JSX.Element]
}

const Layout = ({ children }: LayoutProps) => {
  // selected option from the theme switcher in Header,
  // defaults to auto
  const [options, setOptions] = useState<"auto" | "light" | "dark">("auto")
  // the current theme
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // indicates if the loading indicator should appear
  const [isLoading, setIsLoading] = useState(false)
  // used to inform the Header about route changes
  const [routerEventPath, setRouterEventPath] = useState<string | undefined>()
  // used to listen to events
  const { events } = useRouter()

  useEffect(() => {
    // get initial values for theme
    setOptions(getSelectedTheme())
    setTheme(getSystemTheme())

    /** Informs about the beginning of a route change */
    const handleStart = (url: string) => {
      setRouterEventPath(url)
      setIsLoading(true)
    }

    /** Informs about the ending of a route change */
    const handleEnd = () => {
      setRouterEventPath(undefined)
      setIsLoading(false)
    }

    // adds listeners to route events
    events.on("routeChangeStart", handleStart)
    events.on("routeChangeComplete", handleEnd)
    events.on("routeChangeError", handleEnd)

    // removes listeners to route events
    return () => {
      events.off("routeChangeStart", handleStart)
      events.off("routeChangeComplete", handleEnd)
      events.off("routeChangeError", handleEnd)
    }
  }, [])

  /**
   * Returns the theme the user selected. If the user didn't
   * select a theme, the system theme will be used
   */
  const getSelectedTheme = () =>
    (window.localStorage.getItem("theme") ?? "auto") as
      | "auto"
      | "light"
      | "dark"

  /** Returns the current system theme */
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

  // used to handle theme changes
  useEffect(() => {
    // if options set to manual, switch the theme
    if (options !== "auto") {
      setTheme(options)
    }
    // listener that reacts to system theme changes
    // and changes the site theme
    const changeTheme = () => {
      if (options === "auto") {
        setTheme(getSystemTheme())
      }
    }
    // run the listener on load
    changeTheme()
    // add listener to system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addListener(() => changeTheme())
    // remove listener on exit
    return () =>
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeListener(() => changeTheme())
  }, [options])

  return (
    <GeistProvider theme={{ type: theme }}>
      <CssBaseline />
      <ThemeContext.Provider
        value={{ theme, setThemeMode: (val) => setOptions(val) }}
      >
        <Page>
          {/** page header and background */}
          <Page.Header style={{ height: 77.66 }}>
            <Header routerEventPath={routerEventPath} />
            <div
              className="header-background"
              style={{ backgroundColor: theme === "light" ? "white" : "black" }}
            />
          </Page.Header>
          <Page.Content>
            {/** show loading indicator on route changes */}
            <div className="center" style={{ opacity: isLoading ? 1 : 0 }}>
              <Spinner size="large" />
            </div>
            {/** main content */}
            <div style={{ opacity: isLoading ? 0 : 1, marginTop: -50 }}>
              {children}
            </div>
          </Page.Content>
        </Page>
      </ThemeContext.Provider>
    </GeistProvider>
  )
}

export default Layout
