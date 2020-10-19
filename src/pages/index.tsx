import Head from "../components/Head"
import { GetServerSideProps, NextPage } from "next"
import loki from "lokijs"
import {
  Table,
  Textarea,
  Button,
  useToasts,
  Tabs,
  Divider,
  Row,
} from "@geist-ui/react"
import Message from "../models/Message"
import { FormEvent, useState } from "react"
import { useRouter } from "next/router"
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers"
import DayJSUtils from "@date-io/dayjs"
import { ParsedUrlQuery } from "querystring"
import { RotateCw } from "@geist-ui/react-icons"
import { getDbInstance } from "../data/db"
import { sendMessage } from "../data/bot"

type HomePageProps = {
  messages: Message[]
}

const HomePage: NextPage<HomePageProps> = ({ messages }) => {
  const router = useRouter()
  const [, setToast] = useToasts()
  const [message, setMessage] = useState("")
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date())
  const [shouldSchedule, setShouldSchedule] = useState<"true" | "false">(
    "false"
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (message.replaceAll(" ", "") === "") {
      setToast({
        text: "Nothing to send",
        type: "warning",
      })
      return
    }
    const schedule = shouldSchedule === "true"
    if (schedule && new Date() >= scheduleDate) {
      setToast({
        text: "You should pick a future date",
        type: "warning",
      })
      return
    }
    await router.push({
      pathname: "/",
      query: schedule
        ? { send: message, schedule: scheduleDate.toISOString() }
        : { send: message },
    })
    setMessage("")
    setScheduleDate(new Date())
    router.push("/", undefined, { shallow: true })
    setToast({
      text: schedule ? "Message scheduled" : "Message sent",
    })
  }

  const datePicker = (
    <Tabs
      hideDivider
      initialValue={shouldSchedule}
      onChange={(val) => setShouldSchedule(val as "true" | "false")}
    >
      <Tabs.Item label="Send Now" value="false" />
      <Tabs.Item label="Send Later" value="true">
        <div style={{ height: 40 }}>
          <div style={{ position: "absolute" }}>
            <Button type="secondary" ghost>
              {scheduleDate.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </Button>
          </div>
          <div style={{ position: "absolute" }}>
            <MuiPickersUtilsProvider utils={DayJSUtils}>
              <DateTimePicker
                value={scheduleDate}
                inputVariant="outlined"
                style={{ height: 40, width: 200, opacity: 0, zIndex: 50 }}
                onChange={(date) => setScheduleDate(date.toDate())}
                ampm={false}
                autoOk
                disablePast
              />
            </MuiPickersUtilsProvider>
          </div>
        </div>
      </Tabs.Item>
    </Tabs>
  )

  const form = (
    <form onSubmit={handleSubmit}>
      <Textarea
        width="100%"
        placeholder="Type Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {datePicker}
      <div
        style={{
          paddingTop: 10,
          paddingBottom: 16,
        }}
      >
        <Button
          auto
          type="secondary"
          htmlType="submit"
          style={{ width: "100%" }}
        >
          Send
        </Button>
      </div>
    </form>
  )

  const removeFromQueue = async (message: Message) => {
    await router.push({
      pathname: "/",
      query: { remove: message.message, schedule: message.schedule },
    })
    router.push("/", undefined, { shallow: true })
    setToast({
      text: "Message deleted",
    })
  }

  const removeFromQueueButton = (_actions, rowData) => {
    const message = rowData.rowValue as Message
    return (
      <Button
        type="error"
        auto
        size="mini"
        onClick={() => removeFromQueue(message)}
      >
        Remove
      </Button>
    )
  }

  const tableData = messages.map((message) => {
    let item = message as any
    item.remove = removeFromQueueButton
    item.scheduleString = new Date(item.schedule).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    return item
  })

  const queue = (
    <>
      <Row justify="space-between" align="middle">
        <div style={{ paddingBottom: 8 }}>
          <h3>{messages.length === 0 ? "Nothing in Queue" : "Queue"}</h3>
        </div>
        <div
          className="unstyled-button"
          onClick={() => {
            router.push("/")
            setToast({ text: "Reloaded queue" })
          }}
        >
          <RotateCw />
        </div>
      </Row>
      {messages.length > 0 && (
        <Table data={tableData}>
          <Table.Column prop="scheduleString" label="date" width={150} />
          <Table.Column prop="message" label="message" />
          <Table.Column prop="remove" label="remove" width={100} />
        </Table>
      )}
    </>
  )

  return (
    <div style={{ paddingTop: 30 }}>
      <Head title="Home" />
      {form}
      <Divider />
      {queue}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.query.send)
    await sendMessage(
      context.query.send as string,
      context.query.schedule as string | undefined
    )
  const db = await getDbInstance()
  if (context.query.remove) await removeMessage(db, context.query)
  const messages: Collection<Message> =
    db.getCollection("messages") || db.addCollection("messages")
  const data = messages
    .find({
      sent: false,
    })
    .sort((a, b) => {
      const aDate = new Date(a.schedule)
      const bDate = new Date(b.schedule)
      return bDate.getTime() - aDate.getTime()
    })
    .map((item) => {
      item.schedule = new Date(item.schedule).toISOString()
      return item
    })
  return {
    props: {
      messages: data,
    },
  }
}

const removeMessage = (db: loki, query: ParsedUrlQuery): Promise<void> => {
  const messages = db.getCollection("messages") || db.addCollection("messages")
  return new Promise((resolve) => {
    messages.findAndRemove({
      message: query.remove as string,
      schedule: query.schedule as string,
      sent: false,
    })
    db.save(() => resolve())
  })
}

export default HomePage
