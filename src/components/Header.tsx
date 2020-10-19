import React, { useState, useEffect, createRef, useContext } from "react"
import { Tabs, useTheme, Row, Select } from "@geist-ui/react"
import { useRouter } from "next/router"
import { ThemeContextType, ThemeContext } from "./Layout"
import { Sun, Moon, Droplet, Send } from "@geist-ui/react-icons"

type HeaderProps = {
  routerEventPath?: string
}

/**
 * Calculates the base path to highlight
 * its tab in the header
 * @example "/blog/article" becomes "/blog"
 * @param fullpath Current path from Router
 * @returns Base path
 */
const calculateBase = (fullpath: string) => `/${fullpath.split("/")[1]}`

/**
 * Create a header at the top of the page
 * @param routerEventPath Path from router events, used between route changes
 */
const Header = ({ routerEventPath }: HeaderProps) => {
  const { type } = useTheme()
  const { setThemeMode } = useContext<ThemeContextType>(ThemeContext)
  const [selectedTheme, setSelectedTheme] = useState<string>("auto")

  const { pathname, push } = useRouter()
  const [path, setPath] = useState(pathname)
  const headerRef = createRef<HTMLDivElement>()

  const [base, setBase] = useState(calculateBase(pathname))

  // used to switch to the selected tab
  useEffect(() => {
    if (pathname !== path) push(path)
  }, [path])

  // used to react to router events between route changes
  useEffect(() => {
    if (routerEventPath) setBase(calculateBase(routerEventPath))
    else {
      setPath(pathname)
      setBase(calculateBase(pathname))
    }
  }, [routerEventPath])

  // used to remove empty space under the tabs
  useEffect(() => {
    const ref = headerRef.current
    if (!ref) return
    const content = ref.querySelector(".content")
    if (content) content.remove()
  }, [headerRef])

  // used to highlight the selected tab from router change
  useEffect(() => {
    setPath(pathname)
    setBase(calculateBase(pathname))
  }, [pathname])

  // used to get the theme the user selected.
  // if the user didn't select a theme, the
  // system theme will be used.
  useEffect(() => {
    setSelectedTheme(window.localStorage.getItem("theme") ?? "auto")
  }, [])

  // used to detect manual theme changes
  useEffect(() => {
    setThemeMode(selectedTheme as "auto" | "light" | "dark")
    window.localStorage.removeItem("theme")
    if (selectedTheme !== "auto") {
      window.localStorage.setItem("theme", selectedTheme)
    }
  }, [selectedTheme, setThemeMode])

  /** Creates a label to be used in the theme switcher */
  const createThemeLabel = (title: string, icon: JSX.Element) => (
    <Row justify="center">
      <div style={{ marginRight: 5, marginTop: 3 }}>{icon}</div>
      <div style={{ marginTop: 1 }}>{title}</div>
    </Row>
  )

  const logo = (
    <button onClick={() => setPath("/")} className="unstyled-button">
      <Row>
        <div style={{ paddingRight: 5, paddingTop: 3 }}>
          <Send />
        </div>
        <h4>NotifyBot</h4>
      </Row>
    </button>
  )

  const themeSwitcher = (
    <div style={{ position: "relative" }}>
      <Row style={{ position: "absolute" }}>
        <div style={{ height: 40, width: 104, zIndex: 110 }} />
        {type === "light" ? <Sun /> : <Moon />}
      </Row>
      <Select
        value={selectedTheme}
        onChange={(val) => setSelectedTheme(val.toString())}
        size="small"
        style={{ opacity: 0, zIndex: 105 }}
        pure
      >
        <Select.Option value="auto">
          {createThemeLabel("Automatic", <Droplet size={14} />)}
        </Select.Option>
        <Select.Option value="light">
          {createThemeLabel("Light", <Sun size={14} />)}
        </Select.Option>
        <Select.Option value="dark">
          {createThemeLabel("Dark", <Moon size={14} />)}
        </Select.Option>
      </Select>
    </div>
  )

  const tabs = (
    <Tabs value={base} onChange={(val) => setPath(val)}>
      <Tabs.Item label="Home" value="/" />
      <Tabs.Item label="History" value="/history" />
      <Tabs.Item label="API" value="/api-page" />
    </Tabs>
  )

  return (
    <div className="header" ref={headerRef}>
      <div className="header-content">
        <div style={{ paddingTop: 10 }}>
          <Row justify="space-between">
            {logo}
            {themeSwitcher}
          </Row>
        </div>
        {tabs}
      </div>
    </div>
  )
}

export default Header
