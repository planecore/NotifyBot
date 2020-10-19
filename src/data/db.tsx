import loki from "lokijs"

export const getDbInstance = async (): Promise<loki> => {
  const db = new loki("./db/notifybot.db")
  return new Promise((resolve, reject) => {
    db.loadDatabase({}, () => {
      resolve(db)
    })
  })
}

export const save = async (db: loki): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.save(() => resolve())
  })
}
