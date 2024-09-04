import { render } from 'solid-js/web';

import './index.css';
import Router from "./Router";

import "./lib/api"

addEventListener("error", (e: ErrorEvent) => {
  fetch("/error", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: e.error?.name ?? "none",
      message: e.error?.message ?? "none",
      stack: e.error?.stack ?? "none"
    })
  })
})

addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
  fetch("/error", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: "none",
      message: e.reason,
      stack: "none"
    })
  })
})

const root = document.getElementById('root');

render(() => <Router />, root!);
