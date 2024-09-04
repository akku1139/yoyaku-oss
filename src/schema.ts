import { integer, sqliteTable, text, } from "drizzle-orm/sqlite-core";
import { MAX_PLAYER } from "./common/config";

/* 命名規則
JS側: キャメルケース
D1側: スネークケース
*/

export const games = sqliteTable("games", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }).notNull(), // 0は特殊
  startTime: integer("start_time", { mode: "timestamp" }).primaryKey().notNull(),
  maxPlayer: integer("max_player", { mode: "number" }).default(MAX_PLAYER).notNull(),
  availableCount: integer("available_count", { mode: "number" }).default(0).notNull(),
});

export const player = sqliteTable("player", {
  token: text("token", { mode: "text", length: 36 }).primaryKey().unique().notNull(), // crypto.randomUUID()
  gameID: integer("game_id", { mode: "number" }).notNull(),
  name: text("name", { mode: "text" }).notNull(),
  group: text("group", { mode: "text" }), // groupJoin.code
  /*
   * 1: 生徒
   * 2: 職員
   * 3: 保護者・一般
   */
  type: integer("type", { mode: "number" }).notNull(),
  grade: integer("grade", { mode: "number" }).default(0).notNull(),
  class: integer("class", { mode: "number" }).default(0).notNull(),
  studentID: integer("student_id", { mode: "number" }).default(0).notNull(), // 出席番号
});

export const groupJoin = sqliteTable("group_join", {
  code: text("code", { mode: "text" }).primaryKey().unique().notNull(),
  gameID: integer("game_id", { mode: "number" }).notNull(),
  numPlayer: integer("num_player", { mode: "number" }).notNull(),
  availableCount: integer("available_count", { mode: "number" }).default(0).notNull(),
})

export const admins = sqliteTable("admins", {
  id: text("id", { mode: "text" }).primaryKey().unique().notNull(),
  password: text("password", { mode: "text" }).notNull(),
  permissionLevel: integer("permission_level", { mode: "number" }).notNull(),
});

export const adminSessions = sqliteTable("admin_sessions", {
  token: text("token", { mode: "text", length: 36 }).primaryKey().unique().notNull(), // crypto.randomUUID()
  userID: text("user_id", { mode: "text" }).notNull(),
  permissionLevel: integer("permission_level", { mode: "number" }).notNull(),
});
