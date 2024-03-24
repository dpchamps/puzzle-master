import {component$, Slot} from "@builder.io/qwik";
import {Link as QwikLink} from "@builder.io/qwik-city";

type LinkProps = {
    href: string
}
export const Link = component$(({href}: LinkProps) => {
    return (
        <div class={"my-3"}>
            <QwikLink prefetch class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href={href}><Slot/></QwikLink>
        </div>
    )
})