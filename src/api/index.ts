import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import * as s from "../schema";
import { eq } from "drizzle-orm";
import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";

const hiragana = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん".split("");
const randKana = () => hiragana[Math.floor(Math.random() * hiragana.length)];

const app = new Hono<{
  Bindings: {
    DB: D1Database
  },
  Variables: {
    db: DrizzleD1Database<typeof s>,
    permissionLevel: number,
  }
}>().basePath("/api/")
.use("*",
  async (c, next) => {
    c.set("permissionLevel", 1000)
    c.set("db", drizzle(c.env.DB, { schema: s }))
    await next()
    c.header("Cache-Control", "no-store")
    c.header("Pragma", "no-cache")
  }
)

.onError(async (e, c) => {
  console.error(e)
  // Send error to Webhook (Discord)
  const message = `An error has occurred:
\`\`\`js
${e.stack}
\`\`\`
- Path: ${c.req.path}
- Timestamp: ${new Date().toLocaleString("ja-JP", { timeZone: 'Asia/Tokyo' })}`

  await fetch("Discord Webhook", {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: message }),
  })
  return c.text('Internal Server Error', 500)
})

.use("/admin/*", async (c, next) => {
  const [ user ] = await c.var.db.select().from(s.adminSessions).where(eq(s.adminSessions.token, c.req.header("Authorization") ?? ""));
  if(user) {
    if(user.permissionLevel !== null) {
      c.set("permissionLevel", user.permissionLevel)
    } else {
      throw new Error("Missing: user.permissionLevel at admin auth middleware")
    }
    await next()
  } else {
    return c.text("not authenticated", 401)
  }
})

.get("/admin/perm", async (c) => {
  return c.json(c.var.permissionLevel)
})

.post("/admin/add_user", vValidator("json", v.object({
  user: v.string(),
  pw: v.string(),
})), async (c) => {
  if(c.var.permissionLevel > 2) {
    return c.text("missing permission", 403)
  }
  const j = c.req.valid("json")
  await c.var.db.insert(s.admins).values({
    id: j.user,
    password: j.pw,
    permissionLevel: 2
  })
  return c.text("登録成功")
})

.post("/admin/add_game", vValidator("json", v.object({
  startTime: v.pipe(v.string(), v.isoDateTime()),
  maxPlayer: v.pipe(v.number(), v.minValue(1), v.integer()),
})), async (c) => {
  if(c.var.permissionLevel > 3) {
    return c.text("missing permission", 403)
  }
  const j = c.req.valid("json")
  await c.var.db.insert(s.games).values({
    startTime: new Date(j.startTime),
    maxPlayer: j.maxPlayer,
    availableCount: j.maxPlayer,
  })
  return c.text("ok")
})

.post("/admin/done_game", vValidator("json", v.object({
  gameID: v.number()
})), async (c) => {
  const j = c.req.valid("json")
  await c.var.db.update(s.games).set({
    availableCount: 0
  }).where(eq(s.games.id, j.gameID))
  return c.text("ok")
})

.post("/admin/delete_game", vValidator("json", v.object({
  gameID: v.number()
})), async (c) => {
  if(c.var.permissionLevel > 3) {
    return c.text("missing permission", 403)
  }
  const j = c.req.valid("json")
  await c.var.db.delete(s.games).where(eq(s.games.id, j.gameID))
  return c.text("ok")
})

.post("/adminlogin", vValidator("json", v.object({
  user: v.string(),
  pw: v.string(),
})), async (c) => {
  const j = c.req.valid("json");
  const userdata = (await c.var.db.select().from(s.admins).where(eq(s.admins.id, j.user)))[0];
  if(!userdata) {
    return c.text("ユーザーが見つからなかった", 401)
  }
  if(userdata.password === j.pw) {
    const token = crypto.randomUUID()
    await c.var.db.insert(s.adminSessions).values({
      token,
      userID: userdata.id,
      permissionLevel: userdata.permissionLevel,
    })
    return c.json({token, permissionLevel: userdata.permissionLevel});
  } else {
    return c.text("パスワードが違う", 401)
  }
})

.get("/games", async (c) => {
  const games = await c.var.db.select().from(s.games)
  return c.json(games)
})

.post("/join", vValidator("json", v.object({
  gameID: v.number(),
  name: v.string(),
  group: v.undefinedable(v.string(), ""),
  type: v.number(),
  // 0: 生徒ではないことを示す
  grade: v.undefinedable(v.number(), 0),
  class: v.undefinedable(v.number(), 0),
  studentID: v.undefinedable(v.number(), 0), // 出席番号
})), async (c) => {
  const j = c.req.valid("json")
  if(j.group === "") {
    const [ game ] = await c.var.db.select().from(s.games).where(eq(s.games.id, j.gameID));
    if(game.availableCount === 0) {
      return c.text("over max players (game)", 403)
    }
    await c.var.db.update(s.games).set({
      availableCount: game.availableCount - 1
    }).where(eq(s.games.id, j.gameID))
  } else {
    const [ group ] = await c.var.db.select().from(s.groupJoin).where(eq(s.groupJoin.code, j.group))
    j.gameID = group.gameID
    // groupが存在しないことは想定しない
    if(group.availableCount === 0) {
      return c.text("over max players (group)", 403)
    } else {
      // ゲームは作成時に減らす
      await c.var.db.update(s.groupJoin).set({
        availableCount: group.availableCount - 1
      }).where(eq(s.groupJoin.code, j.group))
    }
  }
  const token = crypto.randomUUID()
  await c.var.db.insert(s.player).values({
    token,
    gameID: j.gameID,
    name: j.name,
    group: j.group ?? null,
    type: j.type,
    grade: j.grade,
    class: j.class,
    studentID: j.studentID,
  })
  return c.text(token)
})

.post("/makegroup", vValidator("json", v.object({
  gameID: v.number(),
  numPlayer: v.pipe(v.number(), v.minValue(1), v.integer()),
})), async (c) => {
  const j = c.req.valid("json")
  const [ game ] = await c.var.db.select().from(s.games).where(eq(s.games.id, j.gameID))
  if(game.availableCount - j.numPlayer < 0) {
    return c.text("over max players (game)")
  }

  await c.var.db.update(s.games).set({
    availableCount: game.availableCount - j.numPlayer
  }).where(eq(s.games.id, j.gameID))

  const code = randKana() + randKana() + randKana() + randKana() + randKana()
  await c.var.db.insert(s.groupJoin).values({
    code,
    gameID: j.gameID,
    numPlayer: j.numPlayer,
    availableCount: j.numPlayer,
  })
  return c.text(code)
})

.post("/my_info", vValidator("json", v.object({
  token: v.string()
})), async (c) => {
  const j = c.req.valid("json")
  const [m] = await c.var.db.select().from(s.player).where(eq(s.player.token, j.token))
  if(typeof m === "undefined") {
    c.text("プレイヤーデータ取得できなかった", 500)
  }
  const [g] = await c.var.db.select().from(s.games).where(eq(s.games.id, m.gameID))
  return c.json({
    my: m,
    game: g,
  })
})

.post("/error", vValidator("json", v.object({
  name: v.string(),
  message: v.string(),
  stack: v.string()
})), async (c) => {
  const e = c.req.valid("json")

  const message = `An error has occurred:
\`\`\`js
${e.name}: ${e.message}
${e.stack}
\`\`\`
- Path: ${c.req.path}
- Timestamp: ${new Date().toLocaleString("ja-JP", { timeZone: 'Asia/Tokyo' })}
  `.trim()

  await fetch("Discord Webhook", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
    })
  return c.text("ok")
})

export default app;
