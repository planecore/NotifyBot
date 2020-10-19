import Head from "../components/Head"
import { GetServerSideProps, NextPage } from "next"
import loki from "lokijs"
import { Table, Button, Row, Modal, useToasts, useModal } from "@geist-ui/react"
import Message from "../models/Message"
import { useRouter } from "next/router"
import { RotateCw } from "@geist-ui/react-icons"
import { getDbInstance } from "../data/db"

type HistoryPageProps = {
  messages: Message[]
}

const HistoryPage: NextPage<HistoryPageProps> = ({ messages }) => {
  const router = useRouter()
  const [, setToast] = useToasts()
  const { setVisible: setModalVisible, bindings: modalBindings } = useModal()

  const tableData = messages.map((message) => {
    let item = message as any
    item.scheduleString = new Date(item.schedule).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    return item
  })

  const clearHistory = async () => {
    await router.push({
      pathname: "/history",
      query: { clear: "true" },
    })
    router.push("/history", undefined, { shallow: true })
    setModalVisible(false)
    setToast({
      text: "History cleared",
    })
  }

  const reloadButton = (
    <div
      className="unstyled-button"
      onClick={() => {
        router.push("/history")
        setToast({ text: "Reloaded history" })
      }}
    >
      <RotateCw />
    </div>
  )

  const upperRow = (
    <>
      <Row justify="space-between" align="middle">
        {reloadButton}
        <div style={{ paddingBottom: 8 }}>
          <Button type="error" auto onClick={() => setModalVisible(true)}>
            Clear History
          </Button>
        </div>
      </Row>
      <Modal {...modalBindings}>
        <Modal.Title>Clear History</Modal.Title>
        <Modal.Subtitle>This can't be undone.</Modal.Subtitle>
        <Modal.Action passive onClick={() => setModalVisible(false)}>
          Cancel
        </Modal.Action>
        <Modal.Action onClick={() => clearHistory()}>Clear</Modal.Action>
      </Modal>
    </>
  )

  const table = (
    <Table data={tableData}>
      <Table.Column prop="scheduleString" label="date" width={150} />
      <Table.Column prop="message" label="message" />
    </Table>
  )

  return (
    <div style={{ paddingTop: 10 }}>
      <Head title="History" />
      {messages.length === 0 ? (
        <>
          {reloadButton}
          <h2 className="center">Nothing in History</h2>
        </>
      ) : (
        <>
          {upperRow}
          {table}
        </>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const db = await getDbInstance()
  if (context.query.clear === "true") await clearHistory(db)
  const messages: Collection<Message> =
    db.getCollection("messages") || db.addCollection("messages")
  const data = messages
    .find({
      sent: true,
    })
    .sort((a, b) => {
      const aDate = new Date(a.schedule)
      const bDate = new Date(b.schedule)
      return bDate.getTime() - aDate.getTime()
    })
  return {
    props: {
      messages: data,
    },
  }
}

const clearHistory = (db: loki): Promise<void> => {
  const messages = db.getCollection("messages") || db.addCollection("messages")
  return new Promise((resolve) => {
    messages.findAndRemove({
      sent: true,
    })
    db.save(() => resolve())
  })
}

export default HistoryPage
