import { children, type JSX } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";

export const Button = (props: {
  children: JSX.Element
}) => {
  const Children = children(() => props.children)
  return <div
    class="text-3xl flex items-center justify-center p-8 m-8 bg-gray-400 text-white font-semibold rounded hover:bg-gray-500"
  >
    <Children />
  </div>
}
