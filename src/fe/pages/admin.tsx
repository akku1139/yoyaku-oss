import { createSignal, For } from "solid-js"
import { Show } from "solid-js"
import { adminAPI, api } from "../lib/api";
import { adminToken, setAdminToken, setPermissionLevel, permissionLevel, games, updateGames } from "../lib/signals";
import { MAX_PLAYER } from "../../common/config";

export default () => {
  let inputUser: HTMLInputElement | undefined, inputPW: HTMLInputElement | undefined;
  let inputUser2: HTMLInputElement | undefined, inputPW2: HTMLInputElement | undefined;

  let gameMaxPlayer: HTMLInputElement | undefined, gameStartTime: HTMLInputElement | undefined;

  const [loginMsg, setLoginMsg] = createSignal<string>("")
  const [showPW, setShowPW] = createSignal<boolean>(false)

  updateGames()

  return <div class="bg-slate-600">
    <Show when={adminToken() === ""} fallback={<>
      <h1>Admin panel</h1>
      <Show when={permissionLevel() <= 2}>
        <details>
          <summary>ゲーム管理</summary>
          <button onClick={(e) => {updateGames()}}>ゲーム一覧をリロード</button>
          <For each={games()}>{(g) => {
            return <div class="border-4 m-3">
              <div>開始時刻: <span>{g.startTime.toLocaleString("ja-JP", { timeZone: 'Asia/Tokyo' })}</span></div>
              <div>人数: <span>{g.maxPlayer - g.availableCount}</span> / <span>{g.maxPlayer}</span></div>
              <button onClick={async (e) => {
                if(confirm()) {
                  await adminAPI.delete_game.$post({json: {
                    gameID: g.id
                  }})
                  updateGames()
                }
              }} type="button" class="text-red-600 mx-3">ゲームを削除 (普通は押さない)</button>
              <button onClick={async (e) => {
                if(confirm()) {
                  await adminAPI.done_game.$post({json: {
                    gameID: g.id
                  }})
                  updateGames()
                }
              }} type="button" class="mx-3">終了としてマーク</button>

            </div>
          }}</For>
          <div class="border-4 m-3 border-green-400">
            <div>ここに入力してゲームを追加する</div>
            <form onsubmit={async (e) => {
              e.preventDefault()
              await adminAPI.add_game.$post({json: {
                maxPlayer: Number(gameMaxPlayer!.value),
                startTime: gameStartTime!.value,
              }})
              updateGames()
            }}>
              <div>最大人数: <input type="number" min={1} step={1} ref={gameMaxPlayer} value={MAX_PLAYER} required /></div>
              <div>開始時刻: <input type="datetime-local" ref={gameStartTime} required /></div>
              <input type="submit" value="追加" class="bg-gray-400 hover:bg-gray-500" />
            </form>
          </div>
        </details>
      </Show>
      <Show when={permissionLevel() <= 1}>
        <details>
          <summary>ユーザー追加</summary>
          <form onsubmit={async (e) => {
            e.preventDefault()
            const r = await adminAPI.add_user.$post({json: {
              user: inputUser2?.value ?? "",
              pw: inputPW2?.value ?? ""
            }})
            if(r.ok) {
              setLoginMsg(`登録に成功しました: ${inputUser2?.value}`)
              inputUser2!.value = ""
              inputPW2!.value = ""
            } else {
              setLoginMsg(await r.text())
            }
          }}>
            <input type="text" placeholder="ユーザー名" ref={inputUser2} required />
            <input type={showPW() ? "text" : "password"} placeholder="パスワード" ref={inputPW2} required />
            <input type="checkbox" id="showpw_reg" onInput={(e) => {
              setShowPW(e.target.checked)
            }} /> <label for="showpw_reg">パスワードを表示</label>
            <input type="submit" value="管理者登録" class="bg-gray-400 hover:bg-gray-500" />
            <Show when={loginMsg() !== ""}>
              <div>{loginMsg()}</div>
            </Show>
          </form>
        </details>
      </Show>
    </>}>
      <form onsubmit={async (e) => {
        e.preventDefault()
        const r = await api.adminlogin.$post({json: {
          user: inputUser?.value ?? "",
          pw: inputPW?.value ?? ""
        }})
        if(r.ok) {
          const ret = await r.json()
          localStorage.setItem("ADMIN_TOKEN", ret.token)
          setAdminToken(ret.token)
          const t = await adminAPI.perm.$get()
          setPermissionLevel(await t.json())
          setLoginMsg("")
        } else {
          setLoginMsg(await r.text())
        }
      }}>
        <input type="text" placeholder="ユーザー名" ref={inputUser} required />
        <input type={showPW() ? "text" : "password"} placeholder="パスワード" ref={inputPW} required />
        <input type="checkbox" id="showpw_login" onInput={(e) => {
          setShowPW(e.target.checked)
        }} /> <label for="showpw_login">パスワードを表示</label>
        <input type="submit" value="管理者ログイン" />
        <Show when={loginMsg() !== ""}>
          <div>{loginMsg()}</div>
        </Show>
      </form>
    </Show>
  </div>
}
