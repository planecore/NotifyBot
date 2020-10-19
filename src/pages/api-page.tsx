import Head from "../components/Head"
import { GetServerSideProps, NextPage } from "next"
import loki from "lokijs"
import {
  Table,
  Button,
  Row,
  Modal,
  useToasts,
  useModal,
  Input,
  Divider,
  Tag,
} from "@geist-ui/react"
import { useRouter } from "next/router"
import APIKey from "../models/APIKey"
import { ParsedUrlQuery } from "querystring"
import crypto from "crypto"
import React, { useState } from "react"
import { getDbInstance } from "../data/db"

type APIPageProps = {
  keys: APIKey[]
}

const APIPage: NextPage<APIPageProps> = ({ keys }) => {
  const router = useRouter()
  const [, setToast] = useToasts()
  const addKeyModal = useModal()
  const removeKeyModal = useModal()
  const [apiKeyToRemove, setAPIKeyToRemove] = useState<APIKey | undefined>(
    undefined
  )
  const [apiKeyName, setAPIKeyName] = useState("")

  const removeKey = async (key: APIKey) => {
    await router.push({
      pathname: "/api-page",
      query: { remove: key.key },
    })
    router.push("/api-page", undefined, { shallow: true })
    removeKeyModal.setVisible(false)
    setToast({
      text: "API key removed",
    })
  }

  const addKey = async () => {
    if (apiKeyName.replaceAll(" ", "") === "") {
      setToast({
        text: "Your didn't provide a name",
        type: "warning",
      })
      return
    }
    await router.push({
      pathname: "/api-page",
      query: { add: apiKeyName },
    })
    router.push("/api-page", undefined, { shallow: true })
    addKeyModal.setVisible(false)
    setAPIKeyName("")
    setToast({
      text: "API key added",
    })
  }

  const removeKeyButton = (_actions, rowData) => {
    const key = rowData.rowValue as APIKey
    return (
      <Button
        type="error"
        auto
        size="mini"
        onClick={() => {
          setAPIKeyToRemove(key)
          removeKeyModal.setVisible(true)
        }}
      >
        Remove
      </Button>
    )
  }

  const removeKeyModalView = apiKeyToRemove && (
    <Modal {...removeKeyModal.bindings}>
      <Modal.Title>Remove {apiKeyToRemove.name} Key</Modal.Title>
      <Modal.Subtitle>This can't be undone.</Modal.Subtitle>
      <Modal.Action passive onClick={() => removeKeyModal.setVisible(false)}>
        Cancel
      </Modal.Action>
      <Modal.Action onClick={() => removeKey(apiKeyToRemove)}>
        Remove
      </Modal.Action>
    </Modal>
  )

  const tableData = keys.map((message) => {
    let item = message as any
    item.remove = removeKeyButton
    item.creationDateString = new Date(item.creationDate).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    )
    return item
  })

  const table = keys.length > 0 && (
    <Table data={tableData}>
      <Table.Column prop="name" label="name" />
      <Table.Column prop="key" label="key" />
      <Table.Column
        prop="creationDateString"
        label="creation date"
        width={300}
      />
      <Table.Column prop="remove" label="remove" width={100} />
    </Table>
  )

  const addKeyButton = (
    <>
      <Row justify="space-between">
        <div>{keys.length === 0 && <h3>No API key created yet</h3>}</div>
        <div style={{ paddingBottom: 8 }}>
          <Button
            type="secondary"
            auto
            onClick={() => addKeyModal.setVisible(true)}
          >
            Add API Key
          </Button>
        </div>
      </Row>
      <Modal {...addKeyModal.bindings}>
        <Modal.Title>Add API Key</Modal.Title>
        <Modal.Action passive onClick={() => addKeyModal.setVisible(false)}>
          Cancel
        </Modal.Action>
        <Modal.Content>
          <Input
            width="100%"
            placeholder="Name"
            value={apiKeyName}
            onChange={(val) => setAPIKeyName(val.target.value)}
          />
        </Modal.Content>
        <Modal.Action onClick={() => addKey()}>Add</Modal.Action>
      </Modal>
    </>
  )

  const sendPOST = (
    <>
      <Row>
        <div style={{ paddingRight: 8 }}>
          <Tag>POST</Tag>
        </div>
        <h4>/api/send</h4>
      </Row>
      <h5>Parameters</h5>
      <ul>
        <li>
          <b>message:</b> Text to send
        </li>
        <li>
          <b>apiKey:</b> Create an API key to send messages
        </li>
        <li>
          <b>schedule (optional):</b> Provide an ISO date string to send the
          message at
        </li>
      </ul>
    </>
  )

  const endpoints = (
    <>
      <h3>API Endpoints</h3>
      {sendPOST}
    </>
  )

  return (
    <div style={{ paddingTop: 30 }}>
      <Head title="API" />
      {addKeyButton}
      {table}
      {removeKeyModalView}
      <Divider />
      {endpoints}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const db = await getDbInstance()
  if (context.query.remove) await removeKey(db, context.query.remove as string)
  if (context.query.add) await addKey(db, context.query)
  const keys: Collection<APIKey> =
    db.getCollection("keys") || db.addCollection("keys")
  const data = keys.data
    .sort((a, b) => {
      const aDate = new Date(a.creationDate)
      const bDate = new Date(b.creationDate)
      return bDate.getTime() - aDate.getTime()
    })
    .map((item) => {
      item.creationDate = new Date(item.creationDate).toISOString()
      return item
    })
  return {
    props: {
      keys: data,
    },
  }
}

const addKey = (db: loki, query: ParsedUrlQuery): Promise<void> => {
  const keys = db.getCollection("keys") || db.addCollection("keys")
  return new Promise((resolve) => {
    keys.insert({
      name: query.add as string,
      creationDate: new Date(),
      key: crypto.randomBytes(30).toString("hex"),
    })
    db.save(() => resolve())
  })
}

const removeKey = (db: loki, key: string): Promise<void> => {
  const keys = db.getCollection("keys") || db.addCollection("keys")
  return new Promise((resolve) => {
    keys.findAndRemove({
      key,
    })
    db.save(() => resolve())
  })
}

export default APIPage
