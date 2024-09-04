import { Show } from "solid-js"
import { api } from "../lib/api"
import { playerInfo, playerToken, setPlayerInfo, setPlayerToken } from "../lib/signals"

export default () => {
  api.my_info.$post({json: {
    token: playerToken()
  }}).then((r) => {
    if(!r.ok) {
      localStorage.removeItem("PLAYER_TOKEN")
      setPlayerToken("")
      location.href = "/"
    }
    r.json().then((j) => {
      if(typeof j.my === "undefined" || typeof j.game === "undefined") {
        localStorage.removeItem("PLAYER_TOKEN")
        setPlayerToken("")
        location.href = "/"
      }
      setPlayerInfo({
        my: {
          ...j.my
        },
        game: {
          ...j.game,
          startTime: new Date(j.game.startTime.slice(0, -1))
        }
      })
    })
  })

  return <div class="bg-slate-600 flex items-center justify-center rounded-md">
    <Show when={playerInfo()} fallback={
      <div>読み込み中...</div>
    }>
      <div class="p-8">{playerInfo()!.game.startTime.getHours()}時 {playerInfo()!.game.startTime.getMinutes()}分までに来てください</div>
    </Show>
  </div>
}
