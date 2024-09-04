import * as s from "../schema"

export type Game = typeof s.games.$inferSelect
export type Games = Array<Game>
