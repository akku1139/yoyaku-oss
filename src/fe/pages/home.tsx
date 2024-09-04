import { A, Navigate } from "@solidjs/router";
import { Button } from "../lib/components";
import { playerToken } from "../lib/signals";

export default () => playerToken() !== "" ? <Navigate href="/profile" /> :
<div class="text-center my-24">
  <h1 class="text-7xl" style="text-shadow: 1px 1px 2px red, 0 0 1em blue, 0 0 0.2em blue;">ようこそ</h1>
  <A href="/join"><Button>一人で参加する</Button></A>
  <A href="/multi_join"><Button>みんなで参加する</Button></A>
</div>
