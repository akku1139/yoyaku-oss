import { api } from "../lib/api"
import { createSignal, For } from "solid-js";
import { games, updateGames, playerToken } from "../lib/signals";
import type { Game } from "../../common/types";
import { Navigate } from "@solidjs/router";

export default () => {
  let numPlayerElm: HTMLInputElement | undefined;

  const [selectGame, setSelectGame] = createSignal<Game>()
  const [numPlayer, setNumPlayer] = createSignal<number>(1)

  updateGames()

  return playerToken() !== "" ? <Navigate href="/profile" /> :
  <div class="bg-slate-600 p-3 rounded-md">
    <form onsubmit={async (e) => {
      e.preventDefault()

      const code = await (await api.makegroup.$post({json: {
        numPlayer: Number(numPlayerElm!.value),
        gameID: selectGame()!.id
      }})).text()

      location.href = "/join?multi=true&code="+code
    }}>
      <div>参加人数: <input type="number" min={1} step={1} ref={numPlayerElm} placeholder="参加人数" required onInput={(e) => {
        setNumPlayer(Number(numPlayerElm!.value))
      }} /></div>
      <div>参加するゲームを選択</div>
      <For each={games()}>{(g) => {
        return <div class={`
          ${selectGame()?.id === g.id ? "bg-gray-500" : (g.availableCount >= numPlayer() ? "hover:bg-gray-600 bg-gray-700" : "bg-gray-400 border-gray-500")}
          border-4 my-3 p-2 rounded-md
        `} onClick={(e) => {
          setSelectGame(g)
        }}>
          <div>開始時刻: <span>{g.startTime.getHours()}時 {g.startTime.getMinutes()}分</span></div>
          <div>残り <span>{g.availableCount} 人</span></div>
        </div>
      }}</For>
      <input type="submit" class="bg-gray-400 hover:bg-gray-500 p-2 rounded-md" value="決定" />
    </form>
  </div>
}
