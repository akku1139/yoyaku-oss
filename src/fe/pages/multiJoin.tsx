import { A, Navigate } from "@solidjs/router";
import { Button } from "../lib/components";
import { playerToken } from "../lib/signals";

export default () => playerToken() !== "" ? <Navigate href="/profile" /> : <>
  <div class="text-7xl text-center" style="text-shadow: 1px 1px 2px red, 0 0 1em blue, 0 0 0.2em blue;">みんなで参加する</div>
  <A href="/multi_join_host"><Button>代表者がクリックしてください</Button></A>
  <A href="/join?multi=true"><Button>他の方はこちら</Button></A>
  </>
