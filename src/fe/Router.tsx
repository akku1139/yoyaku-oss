import { Router, Route } from "@solidjs/router"

import home from "./pages/home"
import admin from "./pages/admin"
import handle404 from "./pages/404"
import join from "./pages/join"
import multiJoin from "./pages/multiJoin"
import multiJoinHost from "./pages/multiJoinHost"
import profile from "./pages/profile"

export default () => (
  <Router>
    <Route path="/" component={home} />
    <Route path="/admin" component={admin} />
    <Route path="/join" component={join} />
    <Route path="/multi_join" component={multiJoin} />
    <Route path="/multi_join_host" component={multiJoinHost} />
    <Route path="/profile" component={profile} />
    <Route path="*404" component={handle404} />
  </Router>
)
