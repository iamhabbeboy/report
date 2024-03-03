import "./style.css";
import { setupReport } from "./report.ts";
import { setupChildren } from "./children.ts";
// document.querySelector<HTMLDivElement>('#app')!.innerHTML = ""
const elem = document.querySelector<HTMLButtonElement>("#form-button");
if(elem) {
  setupReport(elem!);
}
setupChildren();
