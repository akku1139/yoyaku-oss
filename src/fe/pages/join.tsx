import { Game } from "../../common/types"
import { api } from "../lib/api"
import { games, setPlayerToken, updateGames, playerToken } from "../lib/signals"
import { createSignal, For, Show } from "solid-js"
import { useSearchParams, Navigate } from "@solidjs/router"

export default () => {
  const [selectGame, setSelectGame] = createSignal<Game>()

  let name: HTMLInputElement | undefined
  let code: HTMLInputElement | undefined
  let type: HTMLSelectElement | undefined
  let grade: HTMLSelectElement | undefined
  let class_: HTMLSelectElement | undefined

  const [isStudent, setStutend] = createSignal<boolean>(true)

  const [searchParams] = useSearchParams()

  updateGames()

  return playerToken() !== "" ? <Navigate href="/profile" /> :
  <div class="bg-slate-600 p-3 rounded-md">
    <form onsubmit={(e) => {
      e.preventDefault()
      if(!searchParams.multi && typeof selectGame() === undefined) {
        alert("参加するゲームを選択してください")
        return false
      }
      if(searchParams.multi === "true" && ((code?.value ?? "") === "" && typeof searchParams.code === "undefined")) {
        alert("参加コードを入力してください")
        return false
      }
      api.join.$post({json: {
        gameID: selectGame()?.id ?? 0,
        name: name!.value,
        group: searchParams.code ?? code?.value ?? "",
        type: Number(type!.selectedOptions[0].value),
        grade: Number(grade!.selectedOptions[0].value),
        class: Number(class_!.selectedOptions[0].value),
        studentID: 0,
      }}).then((r) => r.text().then((t) => {
        setPlayerToken(t)
        localStorage.setItem("PLAYER_TOKEN", t)
        location.href = "/profile"
      }))
    }}>
      <Show when={searchParams.multi} fallback={<>
        <div>参加するゲームを選択</div>
        <For each={games()}>{(g) => {
          return <div class={`
            ${selectGame()?.id === g.id ? "bg-gray-500" : (g.availableCount > 0 ? "hover:bg-gray-600 bg-gray-700" : "bg-gray-400 border-gray-500")}
            border-4 my-3 p-2 rounded-md
          `} onClick={(e) => {
            if(g.availableCount > 0) {
              setSelectGame(g)
            }
          }}>
            <div>開始時刻: <span>{g.startTime.getHours()}時 {g.startTime.getMinutes()}分</span></div>
            <div>残り <span>{g.availableCount} 人</span></div>
          </div>
        }}</For>
      </>}>
        <Show when={searchParams.code} fallback={<div>参加コード (代表者から聞く): <input type="text" placeholder="あいうえお" ref={code} /></div>}>
          <div>このコードを一緒に参加する人に教えてください: <span class="bg-indigo-600">{searchParams.code}</span></div>
        </Show>
      </Show>
      <div>お名前: <input type="text" placeholder="中田 太郎" ref={name} required /></div>
      <div>参加枠:
        <select required onInput={(e) => {
          if(type!.selectedOptions[0].value === "1") {
            setStutend(true)
          } else {
            setStutend(false)
          }
        }} ref={type} >
          <option value={1}>生徒</option>
          <option value={2}>職員</option>
          <option value={3}>保護者・一般</option>
        </select>
      </div>
      <Show when={isStudent()}>
        <div>学年:
          <select required ref={grade}>
            <option value={0} disabled selected>選択してください</option>
            <option value={1}>1年生</option>
            <option value={2}>2年生</option>
            <option value={3}>3年生</option>
          </select>
        </div>
        <div>クラス:
          <select required ref={class_}>
            <option value={0} disabled selected>選択してください</option>
            <option value={1}>1組</option>
            <option value={2}>2組</option>
            <option value={3}>3組</option>
            <option value={4}>4組</option>
            <option value={5}>5組</option>
            <option value={6}>6組</option>
            <option value={7}>7組</option>
          </select>
        </div>
      </Show>
      <div><input id="read-rule" type="checkbox" required /><label for="read-rule">ゲームのルールを確認しました</label></div>
      <div><input type="submit" value="参加登録" class="bg-gray-400 hover:bg-gray-500 p-2 rounded-md" /></div>
    </form>
  </div>
}
