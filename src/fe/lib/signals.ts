import { createSignal } from "solid-js";
import { api, adminAPI } from "./api";
import type { Games } from "../../common/types"
import * as s from "../../schema"

export const [adminToken, setAdminToken] = createSignal<string>("");
export const [permissionLevel, setPermissionLevel] = createSignal<number>(100)

const ADMIN_TOKEN = localStorage.getItem("ADMIN_TOKEN");
if(ADMIN_TOKEN !== null) {
  setAdminToken(ADMIN_TOKEN);
  fetch("/api/admin/perm", {
    headers: {
      Authorization: adminToken(),
      "content-type": "application/json",
    }
  }).then(async (t) => setPermissionLevel(await t.json()))
}

export const [playerToken, setPlayerToken] = createSignal<string>("")

export const [playerInfo, setPlayerInfo] = createSignal<{
  my: typeof s.player.$inferSelect,
  game: typeof s.games.$inferSelect,
}>()

const PLAYER_TOKEN = localStorage.getItem("PLAYER_TOKEN");
if(PLAYER_TOKEN !== null) {
  setPlayerToken(PLAYER_TOKEN);
}

export const [games, setGames] = createSignal<Games>([])
export const updateGames = () => {
  api.games.$get().then((t) => t.json().then((r) => {
    setGames(r.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map((r) => {
      return {
        id: r.id,
        startTime: new Date(r.startTime.slice(0, -1)),
        maxPlayer: r.maxPlayer,
        availableCount: r.availableCount,
      }
    }))
  }))
}

setInterval(() => {
  try {
    if(location.pathname !== "/profile") {
      updateGames()
    }
  } catch(e) {
    console.error(e)
  }
}, 15000)
